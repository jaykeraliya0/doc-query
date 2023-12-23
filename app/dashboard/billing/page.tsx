import BillingForm from "@/components/BillingForm";
import { getUserSubscription } from "@/lib/stripe";

const Page = async () => {
  const subscriptionPlan = await getUserSubscription();

  return <BillingForm subscriptionPlan={subscriptionPlan} />;
};

export default Page;
