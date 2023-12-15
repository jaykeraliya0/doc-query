import Subscribe from "@/components/Subscribe";
import { getUserSubscription } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession();

  let userSubscription;
  try {
    userSubscription = await getUserSubscription();
  } catch (error) {
    redirect("/api/auth/signin");
  }

  console.log(userSubscription);

  const isSubscribed = Boolean(userSubscription.isSubscribed);

  console.log(isSubscribed);

  return (
    <main className="">
      {session ? (
        <div>
          name: {session.user?.name}
          <br />
          email: {session.user?.email}
        </div>
      ) : (
        <div>
          <a href="/api/auth/signin">Login</a>
        </div>
      )}

      <div>
        <Subscribe isCurrentPlan={isSubscribed} />
      </div>
    </main>
  );
}
