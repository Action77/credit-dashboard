import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {

  const { data: creditData } =
    await supabase
      .from("credit_data_full")
      .select("*");

  const { data: collections } =
    await supabase
      .from("collection_uploads")
      .select("*")
      .order("created_at", {
        ascending: true,
      });

  return NextResponse.json({
    creditData: creditData || [],
    collections: collections || [],
  });

}