import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {

  const today =
    new Date().toISOString().split("T")[0];

  // حذف جميع الاستثناءات المنتهية
  await supabase
    .from("exceptions")
    .delete()
    .lt("till_date", today);

  // جلب الاستثناءات الحالية
  const { data } =
    await supabase
      .from("exceptions")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  return NextResponse.json(
    data || []
  );
}
export async function POST(
  request: Request
) {

  const body =
    await request.json();

  const { error } =
    await supabase
      .from("exceptions")
      .insert(body);

  return NextResponse.json({
    success: !error,
    error: error?.message,
  });
}