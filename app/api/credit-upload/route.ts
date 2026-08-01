import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const webpush = require("web-push");

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const uploadedBy = String(formData.get("uploadedBy") || "");

    if (!file) {
      return NextResponse.json({
        success: false,
        error: "No file uploaded",
      });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = XLSX.read(buffer, {
      type: "buffer",
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const creditFileDate = worksheet["B3"]?.w || "";

    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
      range: 5,
      defval: "",
    });

        
const [
  collectionInvoicesDelete,
  collectionUploadsDelete,
  creditFullDelete
] = await Promise.all([

  supabase
    .from("collection_invoices")
    .delete()
    .neq("id", 0),

  supabase
    .from("collection_uploads")
    .delete()
    .neq("id", 0),


  supabase
    .from("credit_data_full")
    .delete()
    .neq("invoice", "")

]);

if (creditFullDelete.error) {
  throw creditFullDelete.error;
}
const allRecords = jsonData.map((row) => ({
  invoice: String(row["Invoice #"])
  .replace(/\s/g, "")
  .trim()
  .toUpperCase(),

  van_code: row["Van Code."],
  employee_name: row["Employee Name."],
  employee_ats_code: row["Employee ATS Code."],

  customer_code: row["Customer Code"],
  customer_name: row["Customer Name"],

  central_invoice: row["Central Invoice"],
  payment_term: row["Payment Term"],

  trx_date: String(row["Trx Date"]),

  credit_invoice_amount:
    Number(row["Credit Invoice Amount"]) || 0,

  pending_cim:
    Number(row["Pending CIM"]) || 0,

  credit_days:
    Number(row["Credit_Days"]) || 0,

  total_rejected_count:
    Number(row["Total Rejected Count"]) || 0,

  region: row["Region"],
  city: row["City"],

  status_user_block:
    row["Status User Block"],

  invoice_status:
    row["Invoice status (Due/ Overdue)"],

  uploaded_by: uploadedBy,
  file_name: file.name,
  file_date: creditFileDate,
}));
    

    




    for (
  let i = 0;
  i < allRecords.length;
  i += 5000
) {
  const batch = allRecords.slice(
    i,
    i + 5000
  );

  const { error } = await supabase
    .from("credit_data_full")
    .insert(batch);

  if (error) {
    throw error;
  }
}


const { data: user } = await supabase
  .from("app_users")
  .select("full_name")
  .eq("username", uploadedBy)
  .single();

const notificationResult = await supabase
  .from("notifications")
  .insert({
    username: null,
    title: "✅ Credit File Imported",
    message: `Credit file uploaded successfully by ${user?.full_name || uploadedBy}.`,
  })
  .select();
const vansInFile = [
  ...new Set(
    allRecords
      .map((x) => x.van_code)
      .filter(Boolean)
  ),
];

const { data: subscriptions } =
  await supabase
    .from("push_subscriptions")
    .select("*")
    .in("van_code", vansInFile);
await Promise.all(

  (subscriptions || []).map(
    async (row) => {

      const subscription =
        typeof row.subscription === "string"
          ? JSON.parse(row.subscription)
          : row.subscription;

      try {

        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title:
              "✅ New Credit File Imported",
            body:
              "A new credit file has been uploaded. Please review your blocked invoices to see the latest updates affecting your route.",
            url: `/van/${row.van_code}`,
          })
        );

      } catch (error) {

        console.error(
          "Credit push failed:",
          error
        );

      }

    }
  )

);
const vanCounts: Record<string, number> = {};

allRecords.forEach((row) => {
  const van =
    String(row.van_code || "").trim();

  if (!van) return;

  vanCounts[van] =
    (vanCounts[van] || 0) + 1;

});
const vanRows = Object.keys(vanCounts).map(
  (vanCode) => ({
    van_code: vanCode,
    invoice_count: vanCounts[vanCode],
    updated_at: new Date().toISOString(),
  })
);

await supabase
  .from("van_invoice_counts")
  .upsert(vanRows);
return NextResponse.json({
  success: true,
  rows: allRecords.length,
});

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json({
      success: false,
      error: String(err),
    });
  }
}