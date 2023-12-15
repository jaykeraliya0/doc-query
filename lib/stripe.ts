import { PLANS } from "@/config/stripe";
import { db } from "@/db";
import { getServerSession } from "next-auth";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
  typescript: true,
});

export const getUserSubscription = async () => {
  const session = await getServerSession();
  if (!session || !session.user) throw new Error("Unauthorized");

  const user = await db.user.findFirst({
    where: {
      email: session.user.email!,
    },
  });
  if (!user) throw new Error("Unauthorized");

  const isSubscribed =
    user.stripePriceId &&
    user.stripeCurrentPeriodEnd &&
    user.stripeCurrentPeriodEnd.getTime() + 86400000 > Date.now();

  const plan = isSubscribed
    ? PLANS.find((plan) => plan.price.priceIds.test === user.stripePriceId)
    : null;

  let isCanceled = false;
  if (isSubscribed && user.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );
    isCanceled = stripePlan.cancel_at_period_end;
  }

  return {
    ...plan,
    stripeSubscriptionId: user.stripeSubscriptionId,
    stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
    stripeCustomerId: user.stripeCustomerId,
    isSubscribed,
    isCanceled,
  };
};
