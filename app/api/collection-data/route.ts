import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {

  const jsonPath = path.join(
    process.cwd(),
    "data",
    "collection.json"
  );

  const data = JSON.parse(
    fs.readFileSync(
      jsonPath,
      "utf8"
    )
  );

  return NextResponse.json(data);
}