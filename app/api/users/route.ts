import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("region");

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {

    const body = await req.json();

const users = body.users;

const uploadedBy =
  body.uploadedBy || "Unknown";

    const deleteResult =
      await supabase
        .from("users")
        .delete()
        .neq("id", 0);

    console.log(
      "DELETE RESULT",
      deleteResult
    );

    const insertResult =
      await supabase
        .from("users")
        .insert(users);

    console.log(
      "INSERT RESULT",
      insertResult
    );

    if (insertResult.error) {

      return NextResponse.json(
        {
          error:
            insertResult.error.message,
        },
        {
          status: 500,
        }
      );

    }
await supabase
  .from("notifications")
  .insert({
    username: null,
    title: "👥 Users Imported",
    message: `${users.length} users imported successfully by ${uploadedBy}.`,
  });
    return NextResponse.json({
      success: true
    });

  } catch (error: any) {

    console.log(
      "FULL ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Import Failed",
      },
      {
        status: 500,
      }
    );

  }
}
export async function PUT(req: Request) {

  const body = await req.json();

  const { error } =
    await supabase
      .from("users")
      .update({
        region: body.region,
        city: body.city,
        organization_code:
          body.organization_code,
        user_code:
          body.user_code,
        organization_name:
          body.organization_name,
        van_sub_inventory:
          body.van_sub_inventory,
        contact:
          body.contact,
      })
      .eq("id", body.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true
  });

}

export async function DELETE(
  req: Request
) {

  const { id } =
    await req.json();

  const { error } =
    await supabase
      .from("users")
      .delete()
      .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true
  });

}