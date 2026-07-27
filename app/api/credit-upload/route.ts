import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

    console.log("========== CREDIT FILE ==========");
    console.log("Total Rows:", jsonData.length);
    console.log("First Row:", jsonData[0]);
    console.log("Second Row:", jsonData[1]);

    const blockedRows = jsonData.filter((row) => {
      const userBlock = String(row["Status User Block"] || "")
        .trim()
        .toLowerCase();

      const invoiceStatus = String(
        row["Invoice status (Due/ Overdue)"] || ""
      )
        .trim()
        .toLowerCase();

      return (
        userBlock === "block" &&
        !invoiceStatus.includes("legal")
      );
    });

    console.log("Blocked Rows:", blockedRows.length);

    const { error: deleteError } = await supabase
      .from("credit_data")
      .delete()
      .neq("invoice", "");

    if (deleteError) {
      console.error("DELETE ERROR:", deleteError);
      throw deleteError;
    }

    const records = blockedRows.map((row) => ({
      invoice: String(row["Invoice #"]).replace(/\s/g, ""),
      van_code: row["Van Code."],
      employee_name: row["Employee Name."],
      employee_ats_code: row["Employee ATS Code."],
      customer_code: row["Customer Code"],
      customer_name: row["Customer Name"],
      central_invoice: row["Central Invoice"],
      payment_term: row["Payment Term"],
      trx_date: String(row["Trx Date"]),
      credit_invoice_amount: Number(row["Credit Invoice Amount"]) || 0,
      pending_cim: Number(row["Pending CIM"]) || 0,
      credit_days: Number(row["Credit_Days"]) || 0,
      total_rejected_count: Number(row["Total Rejected Count"]) || 0,
      region: row["Region"],
      city: row["City"],
      uploaded_by: uploadedBy,
      file_name: file.name,
      file_date: creditFileDate,
    }));

    console.log("Records To Insert:", records.length);

    if (records.length > 0) {
      console.log("Sample Record:", records[0]);
    }

    const { data, error } = await supabase
      .from("credit_data")
      .insert(records)
      .select();

    console.log("Inserted Rows:", data?.length);
    console.log("Insert Error:", error);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      rows: records.length,
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);

    return NextResponse.json({
      success: false,
      error: String(err),
    });
  }
}