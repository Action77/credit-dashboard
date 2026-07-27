import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("collection_invoices")
    .select("invoice");

  if (error) {
    return NextResponse.json({
      invoices: [],
    });
  }

  return NextResponse.json({
    invoices: data.map(
      (row: any) => row.invoice
    ),
  });
}