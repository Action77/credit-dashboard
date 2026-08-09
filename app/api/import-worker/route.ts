import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const maxDuration = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 1. Claim one pending job
    const { data: job, error: claimError } =
      await supabase.rpc("claim_import_job");

    if (claimError) {
      throw claimError;
    }

    // No pending jobs
    if (!job) {
      return NextResponse.json({
        success: true,
        message: "No pending jobs",
      });
    }

    console.log("PROCESSING JOB:", job.id, job.type);

    try {
      // 2. Download file from Supabase Storage
      const { data: storageFile, error: storageError } =
        await supabase.storage
          .from("imports")
          .download(job.file_path);

      if (storageError || !storageFile) {
        throw storageError || new Error("File not found");
      }

      const buffer = Buffer.from(
        await storageFile.arrayBuffer()
      );

      // 3. Process according to job type
      if (job.type === "CREDIT") {
        await processCredit(
          buffer,
          job.file_name,
          job.uploaded_by
        );
      } else if (job.type === "COLLECTION") {
        await processCollection(
          buffer,
          job.file_name,
          job.uploaded_by
        );
      } else {
        throw new Error(
          `Unknown import type: ${job.type}`
        );
      }

      // 4. Mark job completed
      await supabase
        .from("import_jobs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          error_message: null,
        })
        .eq("id", job.id);

      // 5. Remove processed file
      await supabase.storage
        .from("imports")
        .remove([job.file_path]);

      return NextResponse.json({
        success: true,
        jobId: job.id,
        type: job.type,
        status: "completed",
      });

    } catch (error) {
      console.error(
        `IMPORT JOB ${job.id} FAILED:`,
        error
      );

      await supabase
        .from("import_jobs")
        .update({
          status: "failed",
          error_message: String(error),
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      return NextResponse.json(
        {
          success: false,
          jobId: job.id,
          error: String(error),
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("IMPORT WORKER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}


// ======================================================
// CREDIT
// ======================================================

async function processCredit(
  buffer: Buffer,
  fileName: string,
  uploadedBy: string
) {
  console.time("CREDIT_IMPORT");

  const workbook = XLSX.read(buffer, {
    type: "buffer",
  });

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const creditFileDate =
    worksheet["B3"]?.w || "";

  const jsonData: any[] =
    XLSX.utils.sheet_to_json(
      worksheet,
      {
        range: 5,
        defval: "",
      }
    );

  // Clear old data
  const clearCreditDataResult =
    await supabase.rpc(
      "clear_credit_data"
    );

  if (clearCreditDataResult.error) {
    throw clearCreditDataResult.error;
  }

  await supabase
    .from("collection_invoices")
    .delete()
    .neq("invoice", "");

  await supabase
    .from("collection_uploads")
    .delete()
    .gt("id", 0);

  await supabase
    .from("van_invoice_counts")
    .delete()
    .neq("van_code", "");

  await supabase
    .from("van_permissions")
    .delete()
    .neq("van_code", "");

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
    file_name: fileName,
    file_date: creditFileDate,
  }));

  const CHUNK_SIZE = 3000;

  for (
    let i = 0;
    i < allRecords.length;
    i += CHUNK_SIZE
  ) {
    const chunk =
      allRecords.slice(
        i,
        i + CHUNK_SIZE
      );

    const { error } =
      await supabase.rpc(
        "import_credit_data",
        {
          payload: chunk,
        }
      );

    if (error) {
      throw error;
    }
  }

  // User
  const { data: user } =
    await supabase
      .from("app_users")
      .select("full_name")
      .eq("username", uploadedBy)
      .single();

  // Notification
  await supabase
    .from("notifications")
    .insert({
      username: null,
      title: "✅ Credit File Imported",
      message:
        `Credit file uploaded successfully by ${
          user?.full_name || uploadedBy
        }.`,
    });

  // Calculate van counts
  const vanCounts: Record<
    string,
    number
  > = {};

  allRecords.forEach((row) => {
    const van =
      String(row.van_code || "")
        .trim();

    if (!van) return;

    const centralInvoice =
      String(
        row.central_invoice || ""
      )
        .trim()
        .toUpperCase();

    const invoiceStatus =
      String(
        row.invoice_status || ""
      ).toLowerCase();

    if (
      centralInvoice !==
      "NOT CENTRAL"
    ) {
      return;
    }

    if (
      invoiceStatus.includes("legal")
    ) {
      return;
    }

    vanCounts[van] =
      (vanCounts[van] || 0) + 1;
  });

  const vanRows =
    Object.keys(vanCounts).map(
      (vanCode) => ({
        van_code: vanCode,
        invoice_count:
          vanCounts[vanCode],
        updated_at:
          new Date().toISOString(),
      })
    );

  if (vanRows.length) {
    await supabase
      .from("van_invoice_counts")
      .upsert(vanRows);
  }

  const permissionRows =
    Object.keys(vanCounts).map(
      (vanCode) => ({
        van_code: vanCode,
        is_unblocked: false,
        public_token:
          crypto.randomUUID(),
      })
    );

  if (permissionRows.length) {
    await supabase
      .from("van_permissions")
      .upsert(
        permissionRows,
        {
          onConflict:
            "van_code",
        }
      );
  }

  console.timeEnd(
    "CREDIT_IMPORT"
  );
}


// ======================================================
// COLLECTION
// ======================================================

async function processCollection(
  buffer: Buffer,
  originalName: string,
  uploadedBy: string
) {
  console.time("COLLECTION_IMPORT");

  const workbook = XLSX.read(
    buffer,
    {
      type: "buffer",
    }
  );

  const worksheet =
    workbook.Sheets[
      workbook.SheetNames[0]
    ];

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
      const status =
        String(row[26] || "")
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

  const { data: uploadRecord, error } =
    await supabase
      .from("collection_uploads")
      .insert({
        file_name: originalName,
        uploaded_by: uploadedBy,
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  const uniqueInvoices = [
    ...new Set(invoices),
  ];

  const {
    data: existingCollected,
  } = await supabase
    .from("collection_invoices")
    .select("invoice");

  const existingSet =
    new Set(
      (existingCollected || [])
        .map((row: any) =>
          String(row.invoice)
            .trim()
            .toUpperCase()
        )
    );

  const recordsToInsert =
    uniqueInvoices
      .filter(
        (invoice) =>
          !existingSet.has(invoice)
      )
      .map((invoice) => ({
        invoice,
        uploaded_by:
          uploadedBy,
        upload_id:
          uploadRecord.id,
      }));

  for (
    let i = 0;
    i < recordsToInsert.length;
    i += 5000
  ) {
    const batch =
      recordsToInsert.slice(
        i,
        i + 5000
      );

    if (!batch.length) continue;

    const { error } =
      await supabase
        .from(
          "collection_invoices"
        )
        .insert(batch);

    if (error) {
      throw error;
    }
  }

  // Recalculate all van counts
  const { data: allCollected } =
    await supabase
      .from("collection_invoices")
      .select("invoice");

  const collectedSet =
    new Set(
      (allCollected || [])
        .map((row: any) =>
          String(row.invoice)
            .trim()
            .toUpperCase()
        )
    );

  const { data: creditRows } =
    await supabase
      .from("credit_data_full")
      .select(
        "invoice, van_code, central_invoice, invoice_status"
      );

  const currentCounts:
    Record<string, number> = {};

  (creditRows || []).forEach(
    (row: any) => {
      const vanCode =
        String(
          row.van_code || ""
        ).trim();

      if (!vanCode) return;

      const invoice =
        String(row.invoice || "")
          .trim()
          .toUpperCase();

      const centralInvoice =
        String(
          row.central_invoice || ""
        )
          .trim()
          .toUpperCase();

      const invoiceStatus =
        String(
          row.invoice_status || ""
        ).toLowerCase();

      if (
        centralInvoice !==
        "NOT CENTRAL"
      ) {
        return;
      }

      if (
        invoiceStatus.includes(
          "legal"
        )
      ) {
        return;
      }

      if (
        collectedSet.has(invoice)
      ) {
        return;
      }

      currentCounts[vanCode] =
        (currentCounts[vanCode] ||
          0) + 1;
    }
  );

  const countRows =
    Object.keys(
      currentCounts
    ).map((vanCode) => ({
      van_code: vanCode,
      invoice_count:
        currentCounts[vanCode],
      updated_at:
        new Date().toISOString(),
    }));

  if (countRows.length) {
    await supabase
      .from("van_invoice_counts")
      .upsert(countRows);
  }

  await supabase
    .from("notifications")
    .insert({
      username: null,
      title:
        "📦 Collection File Imported",
      message:
        `Collection ${uploadRecord.id} uploaded successfully by ${uploadedBy}.`,
    });

  console.timeEnd(
    "COLLECTION_IMPORT"
  );
}