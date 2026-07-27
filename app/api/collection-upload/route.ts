import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({
        success: false,
      });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadPath = path.join(
      process.cwd(),
      "uploads"
    );

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    const filePath = path.join(
      uploadPath,
      file.name
    );

    fs.writeFileSync(
      filePath,
      buffer
    );

    const workbook = XLSX.read(buffer, {
      type: "buffer",
    });

    const sheetName =
      workbook.SheetNames[0];

    const worksheet =
      workbook.Sheets[sheetName];

    const rows: any[] =
      XLSX.utils.sheet_to_json(
        worksheet,
        {
          header: 1,
        }
      );

    const invoices =
      rows
        .slice(1)
        .filter((row: any) => {
          const status =
            String(
              row[26] || ""
            ).trim();

          return (
            status === "Hold" ||
            status === "Completed"
          );
        })
        .map((row: any) =>
          String(row[1] || "")
            .trim()
            .replace(/\s/g, "")
        );

    const records = invoices.map(
  (invoice) => ({
    invoice,
  })
);

const { error } = await supabase
  .from("collection_invoices")
  .upsert(records);

if (error) {
  throw error;
}

    return NextResponse.json({
      success: true,
      invoices: mergedInvoices.length,
      newInvoices: invoices.length,
      file: file.name,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
    });
  }
}