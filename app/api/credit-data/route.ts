import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {

  const { data, error } = await supabase
    .from("credit_data")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return NextResponse.json({
      data: [],
      fileInfo: "",
    });
  }

  const uploadTime =
    data.length > 0
      ? new Date(
          new Date(data[0].created_at).getTime() +
          3 * 60 * 60 * 1000
        )
      : null;

  return NextResponse.json({
    data,

    fileInfo:
      data.length > 0
        ? `${data[0].file_name} | ${data[0].file_date} | Uploaded By ${
            data[0].uploaded_by || "Unknown"
          } | ${uploadTime?.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}`
        : "",
  });

}