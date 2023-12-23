import { db } from "@/db";
import { openai } from "@/lib/openai";
import { pinecone } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/getUser";

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const user = await getUser();

  if (!user) return new Response("Unauthorized", { status: 401 });
  const { id: userId } = user;

  const { fileId, message } = body;
  if (!fileId || !message) return new Response("Bad request", { status: 400 });

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) return new Response("Not found", { status: 404 });

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  const pineconeIndex = pinecone.Index("doc-query");
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: file.id,
  });

  const results = await vectorStore.similaritySearch(message, 4);

  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });

  const formattedPrevMessages = prevMessages.map((message) => ({
    role: message.isUserMessage ? ("user" as const) : ("assistant" as const),
    content: message.text,
  }));

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-16k",
    temperature: 0,
    stream: false,
    messages: [
      {
        role: "system",
        content:
          "Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format.",
      },
      {
        role: "user",
        content: `Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
          
    \n----------------\n
    
    PREVIOUS CONVERSATION:
    ${formattedPrevMessages.map((message) => {
      if (message.role === "user") return `User: ${message.content}\n`;
      return `Assistant: ${message.content}\n`;
    })}
    
    \n----------------\n
    
    CONTEXT:
    ${results.map((r) => r.pageContent).join("\n\n")}
    
    USER INPUT: ${message}`,
      },
    ],
  });

  const aiMessage = response.choices[0].message.content;

  await db.message.create({
    data: {
      text: aiMessage!,
      isUserMessage: false,
      userId,
      fileId,
    },
  });

  return NextResponse.json(aiMessage, { status: 200 });
};

export async function GET(req: NextRequest) {
  const fileId = req.nextUrl.searchParams.get("fileId");

  const user = await getUser();

  if (!user) return new Response("Unauthorized", { status: 401 });
  const { id: userId } = user;

  if (!fileId) return new Response("Bad request", { status: 400 });

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) return new Response("Not found", { status: 404 });

  const messages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      isUserMessage: true,
      createdAt: true,
      text: true,
    },
  });

  return NextResponse.json(messages, { status: 200 });
}
