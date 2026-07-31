import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
let allData: any[] = [];
let from = 0;
const batchSize = 1000;
let error = null;

while (true) {
  const { data, error: err } = await supabase
    .from("credit_data_full")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, from + batchSize - 1);

  if (err) {
    error = err;
    break;
  }

  if (!data || data.length === 0) {
    break;
  }

  allData.push(...data);

  if (data.length < batchSize) {
    break;
  }

  from += batchSize;
}

const data = allData;
/* Auto Clear Daily - Saudi Time */

if (data.length > 0) {

  const now = new Date();

  const saudiToday = new Date(
    now.toLocaleString("en-US", {
      timeZone: "Asia/Riyadh",
    })
  );

  const todayString =
    saudiToday.toISOString().split("T")[0];

  const fileCreatedDate = new Date(
    data[0].created_at
  );

  const fileSaudiDate =
    new Date(
      fileCreatedDate.toLocaleString(
        "en-US",
        {
          timeZone: "Asia/Riyadh",
        }
      )
    )
      .toISOString()
      .split("T")[0];

  if (todayString !== fileSaudiDate) {

    await supabase
      .from("credit_data")
      .delete()
      .neq("invoice", "");

    await supabase
      .from("credit_data_full")
      .delete()
      .neq("invoice", "");

    return NextResponse.json({
      data: [],
      fileInfo: "",
    });

  }
}
console.log("Rows from Supabase:", data.length);
console.log("Rows from Supabase:", data?.length);
console.log("Error:", error);

if (data?.length) {
  console.log("First Invoice:", data[0].invoice);
  console.log("Last Invoice:", data[data.length - 1].invoice);
}
  if (error) {
    return NextResponse.json({
      data: [],
      fileInfo: "",
    });
  }

  const uploadTime =
    data.length > 0
      ? new Date(
          new Date(data[0].created_at).getTime() +
            3 * 60 * 60 * 1000
        )
      : null;

  let uploadedByName = "Unknown";

  if (data.length > 0) {
    const { data: userData } = await supabase
      .from("app_users")
      .select("full_name")
      .eq(
        "username",
        data[0].uploaded_by
      )
      .single();

    uploadedByName =
      userData?.full_name ||
      data[0].uploaded_by ||
      "Unknown";
  }

  const formattedData = data.map((row) => ({
  "Van Code.": row.van_code,
  "Employee Name.": row.employee_name,
  "Employee ATS Code.": row.employee_ats_code,
  "Customer Code": row.customer_code,
  "Customer Name": row.customer_name,
  "Central Invoice": row.central_invoice,
  "Payment Term": row.payment_term,
  "Invoice #": row.invoice,
  "Trx Date": row.trx_date,
  "Credit Invoice Amount": row.credit_invoice_amount,
  "Pending CIM": row.pending_cim,
  "Credit_Days": row.credit_days,
  "Total Rejected Count": row.total_rejected_count,
  "Status User Block": row.status_user_block,
  "Invoice status (Due/ Overdue)": row.invoice_status,
  Region: row.region,
  City: row.city,
}));

  return NextResponse.json({
    data: formattedData,

    fileInfo:
      data.length > 0
        ? `${data[0].file_name} | ${data[0].file_date} | Uploaded By ${uploadedByName} | ${uploadTime?.toLocaleString(
            "en-US",
            {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }
          )}`
        : "",
  });
}