import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { User } from "@prisma/client";

interface Props {
  file: File;
  user: User;
  maxFileSize: number;
}

const acceptedTypes = ["application/pdf"];

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function fileUploader({ file, user, maxFileSize }: Props) {
  if (!file) throw new Error("No file");
  if (!acceptedTypes.includes(file.type)) throw new Error("Invalid file type");
  if (file.size > maxFileSize) throw new Error("File too large");

  const timestamp = Date.now();

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: `${timestamp}-${file.name}`,
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

  return `${timestamp}-${file.name}`;
}
