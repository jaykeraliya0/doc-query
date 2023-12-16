import { NextRequest, NextResponse } from "next/server";
import { PLANS } from "@/config/stripe";
import { getUserSubscription, stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getUser } from "@/lib/getUser";

export async function GET(request: NextRequest, response: NextResponse) {
  try {
    const billingUrl = absoluteUrl("/");

    const user = await getUser();
    if (!user)
      return NextResponse.json({ data: "Unauthorized" }, { status: 401 });

    const subscriptionPlan = await getUserSubscription();

    if (subscriptionPlan.isSubscribed && user.stripeCustomerId) {
      console.log("user.stripeCustomerId", user.stripeCustomerId);

      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: billingUrl,
      });

      return NextResponse.json({ url: stripeSession.url }, { status: 200 });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.email,
      line_items: [
        {
          price: PLANS.find((plan) => plan.name === "Pro")?.price.priceIds.test,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ url: stripeSession.url }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
