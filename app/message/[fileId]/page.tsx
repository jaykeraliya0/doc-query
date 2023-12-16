import ChatWrapper from "@/components/ChatWrapper";
import { db } from "@/db";
import { getUser } from "@/lib/getUser";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

interface Props {
  params: {
    fileId: string;
  };
}

const Page = async ({ params: { fileId } }: Props) => {
  const user = await getUser();
  if (!user) {
    return redirect("/api/auth/signin");
  }

  const file = await db.file.findFirst({
    where: { id: fileId, userId: user?.id },
  });
  if (!file) notFound();

  return (
    <div>
      <h1>File: {file.name}</h1>
      <h2>File ID: {file.id}</h2>
      <h3>status: {file.uploadStatus}</h3>
      <hr />
      <ChatWrapper fileId={fileId} />
    </div>
  );
};

export default Page;
