import { db } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, response: NextResponse) {
  const fileId = request.nextUrl.searchParams.get("fileId");
  if (!fileId)
    return NextResponse.json({ error: "File not found" }, { status: 404 });

  const file = await db.file.findFirst({ where: { id: fileId } });
  if (!file)
    return NextResponse.json({ error: "File not found" }, { status: 404 });

  return NextResponse.json(file, { status: 200 });
}
