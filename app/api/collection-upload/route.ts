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
const uploadedBy =
  String(
    formData.get("uploadedBy") || ""
  );
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
        const status = String(
          row[26] || ""
        ).trim();

        return (
          status === "Hold" ||
          status === "Completed"
        );
      })
      .map((row: any) =>
        String(row[1] || "")
          .trim()
          .replace(/\s/g, "")
      );

    const { data: uploadRecord, error: uploadError } =
  await supabase
    .from("collection_uploads")
    .insert({
      file_name: file.name,
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

const { error } = await supabase
  .from("collection_invoices")
  .insert(records);

if (error) {
  throw error;
}
await supabase
  .from("notifications")
  .insert({
    username: null,
    title: "📦 Collection File Imported",
    message: `Collection ${uploadRecord.id} uploaded successfully by ${uploadedBy}.`,
  });

const previousUploadId =
  uploadRecord.id - 1;

if (previousUploadId > 0) {

  const { data: previousInvoices } =
    await supabase
      .from("collection_invoices")
      .select("invoice")
      .eq(
        "upload_id",
        previousUploadId
      );

  const currentSet = new Set(
    invoices.map(i =>
      String(i)
        .trim()
        .toUpperCase()
    )
  );

  const disappearedInvoices =
    (previousInvoices || [])
      .map((x: any) =>
        String(x.invoice)
          .trim()
          .toUpperCase()
      )
      .filter(
        invoice =>
          !currentSet.has(invoice)
      );

  if (
    disappearedInvoices.length > 0
  ) {

    const { data: invoiceInfo } =
      await supabase
        .from("credit_data_full")
        .select(
          "invoice, van_code"
        )
        .in(
          "invoice",
          disappearedInvoices
        );

    const vanGroups: any = {};

    (invoiceInfo || []).forEach(
      (row: any) => {

        const van =
          row.van_code ||
          "Unknown";

        vanGroups[van] =
          (vanGroups[van] || 0) + 1;

      }
    );

    const { data: userFilters } =
      await supabase
        .from("user_filters")
        .select("*");

    for (const vanCode in vanGroups) {

      const count =
        vanGroups[vanCode];

      const matchedUsers =
        (userFilters || [])
          .filter(
            (user: any) =>
              user.vans?.includes(
                vanCode
              )
          );

      for (const user of matchedUsers) {

        await supabase
          .from("notifications")
          .insert({
            username:
              user.username,
            title:
              "🚨 Disappeared Invoices",
            message:
              `${count} invoices disappeared in ${vanCode}.`,
          });

      }

    }

  }

}
    return NextResponse.json({
      success: true,
      invoices: invoices.length,
      file: file.name,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      error: String(error),
    });
  }
}