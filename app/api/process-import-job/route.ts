import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webpush = require("web-push");

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  let job: any = null;

  try {
    // Claim one pending job
    const { data, error: claimError } =
      await supabase.rpc("claim_import_job");

    if (claimError) {
      throw claimError;
    }

    job = data;

    if (!job) {
      return NextResponse.json({
        success: true,
        message: "No pending jobs",
      });
    }

    if (job.type !== "CREDIT") {
      return NextResponse.json({
        success: true,
        message: `Job ${job.id} is ${job.type}. Credit worker skipped.`,
      });
    }

    console.log("PROCESSING CREDIT JOB:", job.id);

    // --------------------------------------------------
    // 1. Download file from Supabase Storage
    // --------------------------------------------------

    const { data: storageFile, error: storageError } =
      await supabase.storage
        .from("imports")
        .download(job.file_path);

    if (storageError || !storageFile) {
      throw storageError || new Error("Could not download file");
    }

    const buffer = Buffer.from(
      await storageFile.arrayBuffer()
    );

    // --------------------------------------------------
    // 2. Read Excel
    // --------------------------------------------------

    const workbook = XLSX.read(buffer, {
      type: "buffer",
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const creditFileDate =
      worksheet["B3"]?.w || "";

    const jsonData: any[] =
      XLSX.utils.sheet_to_json(worksheet, {
        range: 5,
        defval: "",
      });

    console.log(
      "CREDIT ROWS:",
      jsonData.length
    );

    // --------------------------------------------------
    // 3. Clear old data
    // --------------------------------------------------

    const clearCreditDataResult =
      await supabase.rpc(
        "clear_credit_data"
      );

    if (clearCreditDataResult.error) {
      throw clearCreditDataResult.error;
    }

    const { error: deleteCollectionError } =
      await supabase
        .from("collection_invoices")
        .delete()
        .neq("invoice", "");

    if (deleteCollectionError) {
      throw deleteCollectionError;
    }

    const { error: deleteUploadsError } =
      await supabase
        .from("collection_uploads")
        .delete()
        .gt("id", 0);

    if (deleteUploadsError) {
      throw deleteUploadsError;
    }

    const { error: deleteCountsError } =
      await supabase
        .from("van_invoice_counts")
        .delete()
        .neq("van_code", "");

    if (deleteCountsError) {
      throw deleteCountsError;
    }

    // --------------------------------------------------
    // 4. Map Credit rows
    // --------------------------------------------------

    const allRecords = jsonData.map((row) => ({
      invoice: String(
        row["Invoice #"]
      )
        .replace(/\s/g, "")
        .trim()
        .toUpperCase(),

      van_code: row["Van Code."],
      employee_name: row["Employee Name."],
      employee_ats_code:
        row["Employee ATS Code."],

      customer_code:
        row["Customer Code"],

      customer_name:
        row["Customer Name"],

      central_invoice:
        row["Central Invoice"],

      payment_term:
        row["Payment Term"],

      trx_date:
        String(row["Trx Date"]),

      credit_invoice_amount:
        Number(
          row["Credit Invoice Amount"]
        ) || 0,

      pending_cim:
        Number(row["Pending CIM"]) || 0,

      credit_days:
        Number(row["Credit_Days"]) || 0,

      total_rejected_count:
        Number(
          row["Total Rejected Count"]
        ) || 0,

      region: row["Region"],
      city: row["City"],

      status_user_block:
        row["Status User Block"],

      invoice_status:
        row[
          "Invoice status (Due/ Overdue)"
        ],

      uploaded_by:
        job.uploaded_by,

      file_name:
        job.file_name,

      file_date:
        creditFileDate,
    }));

    // --------------------------------------------------
    // 5. Insert Credit data
    // --------------------------------------------------

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

      console.log(
        `Inserted ${Math.min(
          i + CHUNK_SIZE,
          allRecords.length
        )} / ${allRecords.length}`
      );
    }

    // --------------------------------------------------
    // 6. Get uploader name
    // --------------------------------------------------

    const { data: user } =
      await supabase
        .from("app_users")
        .select("full_name")
        .eq(
          "username",
          job.uploaded_by
        )
        .single();

    const fullName =
      user?.full_name ||
      job.uploaded_by;

    // --------------------------------------------------
    // 7. Notification record
    // --------------------------------------------------

    const { error: notificationError } =
      await supabase
        .from("notifications")
        .insert({
          username: null,
          title:
            "✅ Credit File Imported",
          message:
            `Credit file uploaded successfully by ${fullName}.`,
        });

    if (notificationError) {
      console.error(
        "Notification insert failed:",
        notificationError
      );
    }

    // --------------------------------------------------
    // 8. Prepare van subscriptions
    // --------------------------------------------------

    const vansInFile = [
      ...new Set(
        allRecords
          .map(
            (x) => x.van_code
          )
          .filter(Boolean)
      ),
    ];

    const { data: vanSubscriptions } =
      await supabase
        .from("push_subscriptions")
        .select("*")
        .in(
          "van_code",
          vansInFile
        );

    const { data: adminSubscriptions } =
      await supabase
        .from("push_subscriptions")
        .select("*")
        .eq(
          "van_code",
          "ADMIN"
        );

    const subscriptions = [
      ...(vanSubscriptions || []),
      ...(adminSubscriptions || []),
    ];

    const uniqueSubscriptions =
      Array.from(
        new Map(
          subscriptions.map(
            (row: any) => {
              const subscription =
                typeof row.subscription ===
                "string"
                  ? JSON.parse(
                      row.subscription
                    )
                  : row.subscription;

              return [
                subscription.endpoint,
                row,
              ];
            }
          )
        ).values()
      );

    // --------------------------------------------------
    // 9. Send Push notifications
    // --------------------------------------------------

    await Promise.all(
      uniqueSubscriptions.map(
        async (row: any) => {
          const subscription =
            typeof row.subscription ===
            "string"
              ? JSON.parse(
                  row.subscription
                )
              : row.subscription;

          try {
            const isAdmin =
              row.van_code ===
              "ADMIN";

            await webpush.sendNotification(
              subscription,
              JSON.stringify({
                title: isAdmin
                  ? "📘 Credit File Uploaded"
                  : "✅ New Credit File Imported",

                body: isAdmin
                  ? `${fullName} has successfully uploaded a Credit file.`
                  : "A new credit file has been uploaded. Please review your blocked invoices.",

                url: isAdmin
                  ? "https://credit-dashboard-fawn.vercel.app/van"
                  : `/van/${row.van_code}`,
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

    // --------------------------------------------------
    // 10. Calculate van counts
    // --------------------------------------------------

    const vanCounts: Record<
      string,
      number
    > = {};

    allRecords.forEach(
      (row) => {
        const van =
          String(
            row.van_code || ""
          ).trim();

        if (!van) return;

        const centralInvoice =
          String(
            row.central_invoice ||
              ""
          )
            .trim()
            .toUpperCase();

        const invoiceStatus =
          String(
            row.invoice_status ||
              ""
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

        vanCounts[van] =
          (vanCounts[van] || 0) +
          1;
      }
    );

    // --------------------------------------------------
    // 11. Save van counts
    // --------------------------------------------------

    const vanRows =
      Object.keys(
        vanCounts
      ).map(
        (vanCode) => ({
          van_code:
            vanCode,

          invoice_count:
            vanCounts[
              vanCode
            ],

          updated_at:
            new Date().toISOString(),
        })
      );

    if (vanRows.length > 0) {
      const { error } =
        await supabase
          .from(
            "van_invoice_counts"
          )
          .upsert(vanRows);

      if (error) {
        throw error;
      }
    }

    // --------------------------------------------------
    // 12. Save permissions
    // --------------------------------------------------

    const permissionRows =
      Object.keys(
        vanCounts
      ).map(
        (vanCode) => ({
          van_code:
            vanCode,

          is_unblocked:
            false,

          public_token:
            crypto.randomUUID(),
        })
      );

    if (
      permissionRows.length > 0
    ) {
      const { error } =
        await supabase
          .from(
            "van_permissions"
          )
          .upsert(
            permissionRows,
            {
              onConflict:
                "van_code",
            }
          );

      if (error) {
        throw error;
      }
    }

    // --------------------------------------------------
    // 13. Delete processed file
    // --------------------------------------------------

    const { error: removeError } =
      await supabase.storage
        .from("imports")
        .remove([
          job.file_path,
        ]);

    if (removeError) {
      console.error(
        "Could not remove processed file:",
        removeError
      );
    }

    // --------------------------------------------------
    // 14. Mark job completed
    // --------------------------------------------------

    const { error: completeError } =
      await supabase
        .from("import_jobs")
        .update({
          status:
            "completed",

          completed_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          job.id
        );

    if (completeError) {
      throw completeError;
    }

    console.log(
      "CREDIT JOB COMPLETED:",
      job.id
    );

    return NextResponse.json({
      success: true,
      jobId: job.id,
      type: "CREDIT",
      rows:
        allRecords.length,
    });
  } catch (error) {
    console.error(
      "IMPORT WORKER ERROR:",
      error
    );

    if (job?.id) {
      await supabase
        .from("import_jobs")
        .update({
          status: "failed",
          error_message:
            String(error),
          completed_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          job.id
        );
    }

    return NextResponse.json(
      {
        success: false,
        jobId:
          job?.id || null,
        error:
          String(error),
      },
      {
        status: 500,
      }
    );
  }
}