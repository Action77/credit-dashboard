import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data: latestUpload } = await supabase
    .from("collection_uploads")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .single();

  if (!latestUpload) {
    return NextResponse.json({
      invoices: [],
      fileInfo: "",
    });
  }

  let allInvoices: any[] = [];
  let from = 0;
  const batchSize = 1000;

  while (true) {
    const { data: batch, error } = await supabase
      .from("collection_invoices")
      .select(
        "invoice, uploaded_by, created_at"
      )
      .eq("upload_id", latestUpload.id)
      .range(from, from + batchSize - 1);

    if (error) {
      return NextResponse.json({
        invoices: [],
        fileInfo: "",
      });
    }

    if (!batch || batch.length === 0) {
      break;
    }

    allInvoices.push(...batch);

    if (batch.length < batchSize) {
      break;
    }

    from += batchSize;
  }

  let fullName = "";

  if (allInvoices.length > 0) {
    const { data: user } = await supabase
      .from("app_users")
      .select("full_name")
      .eq(
        "username",
        allInvoices[0].uploaded_by
      )
      .single();

    fullName =
      user?.full_name ||
      allInvoices[0].uploaded_by ||
      "Unknown";
  }

  const uploadTime =
    allInvoices.length > 0
      ? new Date(
          new Date(
            allInvoices[0].created_at
          ).getTime() +
            3 * 60 * 60 * 1000
        )
      : null;

  return NextResponse.json({
    invoices: allInvoices.map(
      (row: any) => row.invoice
    ),

    fileInfo:
      allInvoices.length > 0
        ? `Uploaded By ${fullName} | ${uploadTime?.toLocaleString(
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