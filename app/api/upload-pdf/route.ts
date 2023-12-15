import { db } from "@/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const acceptedTypes = ["application/pdf"];

const maxFileSize = 1024 * 1024 * 10; // 10MB

export async function POST(request: NextRequest, response: NextResponse) {
  try {
    const session = await getServerSession();
    if (!session || !session.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findFirst({
      where: {
        email: session.user.email!,
      },
    });
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("pdf") as File;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    if (!acceptedTypes.includes(file.type))
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

    if (file.size > maxFileSize)
      return NextResponse.json({ error: "File too large" }, { status: 400 });

    const timestamp = Date.now();

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `${user.id}+${file.name}`,
      ContentType: file.type,
      ContentLength: file.size,
      Metadata: {
        userId: user.id,
      },
    });

    const signedUrl = await getSignedUrl(s3, putObjectCommand, {
      expiresIn: 60,
    });

    await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${user.id}%2B${file.name}`;

    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
