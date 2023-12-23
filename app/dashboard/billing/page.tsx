import BillingForm from "@/components/BillingForm";
import { getUser } from "@/lib/getUser";
import { getUserSubscription } from "@/lib/stripe";
import { redirect } from "next/navigation";

const Page = async () => {
  const user = await getUser();
  if (!user || !user.id) redirect("/sign-in");

  const subscriptionPlan = await getUserSubscription();

  return <BillingForm subscriptionPlan={subscriptionPlan} />;
};

export default Page;
