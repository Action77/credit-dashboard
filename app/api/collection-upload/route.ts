import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

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

    const jsonPath = path.join(
      process.cwd(),
      "data",
      "collection.json"
    );

    let existingInvoices: string[] = [];

    if (fs.existsSync(jsonPath)) {
      try {
        const existingData = JSON.parse(
          fs.readFileSync(
            jsonPath,
            "utf8"
          )
        );

        existingInvoices =
          existingData.invoices || [];
      } catch {
        existingInvoices = [];
      }
    }

    const mergedInvoices = [
      ...new Set([
        ...existingInvoices,
        ...invoices,
      ]),
    ];

    fs.writeFileSync(
      jsonPath,
      JSON.stringify(
        {
          invoices: mergedInvoices,
          fileInfo: `${file.name} | ${new Date().toLocaleString()}`,
        },
        null,
        2
      )
    );

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