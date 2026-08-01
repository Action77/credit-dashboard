import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

const webpush = require("web-push");

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

const path = String(body.path || "");

const uploadedBy = String(body.uploadedBy || "");

const originalName = String(body.originalName || "");

if (!path) {
  return NextResponse.json({
    success: false,
    error: "No file uploaded",
  });
}

const { data: storageFile, error: storageError } =
  await supabase.storage
    .from("imports")
    .download(path);

if (storageError || !storageFile) {
  throw storageError;
}

const buffer = Buffer.from(
  await storageFile.arrayBuffer()
);

    const workbook = XLSX.read(buffer, {
      type: "buffer",
    });

    const sheetName =
      workbook.SheetNames[0];

    const worksheet =
      workbook.Sheets[sheetName];

    const rows: any[] =
  XLSX.utils.sheet_to_json(
    worksheet,
    {
      header: 1,
    }
  );


const invoices = rows
  .slice(1)
  .filter((row: any) => {
    const status = String(row[26] || "")
      .trim()
      .toLowerCase();

    return (
      status === "hold" ||
      status === "completed"
    );
  })
  .map((row: any) =>
    String(row[1] || "")
      .trim()
      .replace(/\s/g, "")
      .toUpperCase()
  )
  .filter(Boolean);
    const { data: uploadRecord, error: uploadError } =
  await supabase
    .from("collection_uploads")
    .insert({
      file_name: originalName,
      uploaded_by: uploadedBy,
    })
    .select()
    .single();

if (uploadError) {
  throw uploadError;
}

const records = invoices.map(
  (invoice) => ({
    invoice,
    uploaded_by: uploadedBy,
    upload_id: uploadRecord.id,
  })
);

const uniqueInvoices = [
  ...new Set(records.map(r => r.invoice))
];

const recordsToInsert =
  uniqueInvoices.map(invoice => ({
    invoice,
    uploaded_by: uploadedBy,
    upload_id: uploadRecord.id,
  }));
for (
  let i = 0;
  i < recordsToInsert.length;
  i += 5000
) {
  const batch = recordsToInsert.slice(
    i,
    i + 5000
  );

  const { error } = await supabase
    .from("collection_invoices")
    .upsert(batch, {
      onConflict: "invoice",
    });

  if (error) {
    throw error;
  }
}
const { data: user } = await supabase
  .from("app_users")
  .select("full_name")
  .eq("username", uploadedBy)
  .single();

await supabase
  .from("notifications")
  .insert({
    username: null,
    title: "📦 Collection File Imported",
    message: `Collection ${uploadRecord.id} uploaded successfully by ${user?.full_name || uploadedBy}.`,
  });

const { data: creditRows } =
  await supabase
    .from("credit_data")
    .select("invoice, van_code");
const { data: allCollected } = await supabase
  .from("collection_invoices")
  .select("invoice");

const collectedSet = new Set(
  (allCollected || []).map((row: any) =>
    String(row.invoice)
      .trim()
      .toUpperCase()
  )
);

const currentCounts: Record<string, number> = {};

(creditRows || []).forEach(
  (row: any) => {

    const vanCode =
      String(
        row.van_code || ""
      ).trim();

    if (!vanCode) return;

    const invoice =
      String(
        row.invoice || ""
      )
        .trim()
        .toUpperCase();

    if (collectedSet.has(invoice))
      return;

    currentCounts[vanCode] =
      (currentCounts[vanCode] || 0) + 1;

  }
);

for (const vanCode in currentCounts) {

  const newCount =
    currentCounts[vanCode];

  const { data: savedCount } =
    await supabase
      .from("van_invoice_counts")
      .select("invoice_count")
      .eq(
        "van_code",
        vanCode
      )
      .single();

  const oldCount =
    savedCount?.invoice_count;

  if (
    oldCount !== null &&
    oldCount !== undefined &&
    newCount < oldCount
  ) {

    const reducedBy =
      oldCount - newCount;

    const { data: subscriptions } =
      await supabase
        .from("push_subscriptions")
        .select("*")
        .eq(
          "van_code",
          vanCode
        );

    await Promise.all(
  (subscriptions || []).map(
    async (row) => {

      const subscription =
        typeof row.subscription === "string"
          ? JSON.parse(
              row.subscription
            )
          : row.subscription;

      try {

        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: "✅ Collection Updated",
            body: `${reducedBy} invoice(s) have been collected from your route.`,
            url: `/van/${vanCode}`,
          })
        );

      } catch (error) {

        console.error(error);

      }

    }
  )
);

  }

  await supabase
    .from("van_invoice_counts")
    .upsert({
      van_code: vanCode,
      invoice_count: newCount,
      updated_at:
        new Date().toISOString(),
    });

}
    return NextResponse.json({
      success: true,
      invoices: invoices.length,
      file: originalName,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      error: String(error),
    });
  }
}