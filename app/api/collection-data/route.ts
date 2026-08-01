import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await supabase
  .from("collection_invoices")
  .select(
    "invoice, uploaded_by, created_at"
  )
  .order("created_at", {
    ascending: false,
  })
  .range(0, 20000);

    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return NextResponse.json({
      invoices: [],
      fileInfo: "",
    });
  }

  let fullName = "";

  if (data.length > 0) {
    const { data: user } = await supabase
      .from("app_users")
      .select("full_name")
      .eq(
        "username",
        data[0].uploaded_by
      )
      .single();

    fullName =
      user?.full_name ||
      data[0].uploaded_by ||
      "Unknown";
  }

  const uploadTime =
    data.length > 0
      ? new Date(
          new Date(
            data[0].created_at
          ).getTime() +
            3 * 60 * 60 * 1000
        )
      : null;

  return NextResponse.json({
    invoices: data.map(
      (row: any) => row.invoice
    ),

    fileInfo:
      data.length > 0
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