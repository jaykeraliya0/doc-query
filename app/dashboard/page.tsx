import { db } from "@/db";
import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { getUserSubscription } from "@/lib/stripe";
import { getUser } from "@/lib/getUser";

export default async function Page() {
  const user = await getUser();

  if (!user || !user.id) redirect("/sign-inin");

  const subscriptionPlan = await getUserSubscription();

  return <Dashboard subscriptionPlan={subscriptionPlan} />;
}
