import { db } from "@/db";
import { getServerSession } from "next-auth";

export const getUser = async () => {
  const session = await getServerSession();
  if (!session || !session.user) return null;

  const dbUser = db.user.findFirst({
    where: { email: session.user.email! },
  });
  if (!dbUser) return null;

  return dbUser;
};
