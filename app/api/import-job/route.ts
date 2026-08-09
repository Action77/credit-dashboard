import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const type = String(body.type || "");
    const filePath = String(body.filePath || "");
    const fileName = String(body.fileName || "");
    const uploadedBy = String(body.uploadedBy || "");

    if (!type || !filePath || !fileName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing job information",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("import_jobs")
      .insert({
        type,
        file_path: filePath,
        file_name: fileName,
        uploaded_by: uploadedBy,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("CREATE_IMPORT_JOB_ERROR", error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      job: data,
    });
  } catch (error) {
    console.error("IMPORT_JOB_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}