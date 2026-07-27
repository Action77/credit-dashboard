import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {

  const { data, error } =
  await supabase
    .from("collection_invoices")
    .select(
      "invoice, uploaded_by, created_at"
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return NextResponse.json({
      invoices: [],
      fileInfo: "",
    });
  }

  return NextResponse.json({
    invoices: data.map(
      (row: any) => row.invoice
    ),
    fileInfo:
  data.length > 0
    ? `Uploaded By ${data[0].uploaded_by} | ${new Date(
        data[0].created_at
      ).toLocaleString()}`
    : "",
  });
}