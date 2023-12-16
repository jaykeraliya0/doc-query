import { PLANS } from "@/config/stripe";
import { db } from "@/db";
import fileUploader from "@/lib/fileUploader";
import { getUser } from "@/lib/getUser";
import { pinecone } from "@/lib/pinecone";
import { getUserSubscription } from "@/lib/stripe";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, response: NextResponse) {
  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const file = (await request.formData()).get("pdf") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 401 });

  const userSubscription = await getUserSubscription();
  const { isSubscribed } = userSubscription;

  const key = await fileUploader({
    file,
    user,
    maxFileSize: isSubscribed ? 16 * 1024 * 1024 : 4 * 1024 * 1024,
  });

  const createdFile = await db.file.create({
    data: {
      key: key,
      name: file.name,
      userId: user.id,
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`,
      uploadStatus: "PROCESSING",
    },
  });

  try {
    const res = await fetch(
      `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`
    );
    const blob = await res.blob();
    const loader = new PDFLoader(blob);
    const pageLevelDocs = await loader.load();
    const pagesAmt = pageLevelDocs.length;

    const isProExceeded =
      pagesAmt > PLANS.find((p) => p.name === "Pro")!.pagesPerPdf;
    const isFreeExceeded =
      pagesAmt > PLANS.find((p) => p.name === "Free")!.pagesPerPdf;

    if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
      await db.file.update({
        data: {
          uploadStatus: "FAILED",
        },
        where: {
          id: createdFile.id,
        },
      });
    }

    const pineconeIndex = pinecone.Index("doc-query");

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
      pineconeIndex,
      namespace: createdFile.id,
    });

    await db.file.update({
      data: {
        uploadStatus: "SUCCESS",
      },
      where: {
        id: createdFile.id,
      },
    });

    return NextResponse.json(createdFile);
  } catch (error) {
    await db.file.update({
      data: {
        uploadStatus: "FAILED",
      },
      where: {
        id: createdFile.id,
      },
    });
    return NextResponse.json({ error }, { status: 401 });
  }
}
