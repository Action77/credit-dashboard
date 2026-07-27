import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function DELETE(
  request: Request,
  { params }: {
    params: { id: string };
  }
) {

  const { error } =
    await supabase
      .from("exceptions")
      .delete()
      .eq("id", params.id);

  return NextResponse.json({
    success: !error,
    error: error?.message,
  });

}