import { getServerSession } from "next-auth";

export default async function Home() {
  const session = await getServerSession();

  return (
    <main className="">
      {session ? (
        <div>
          name: {session.user?.name}
          <br />
          email: {session.user?.email}
        </div>
      ) : (
        <div>Not signed in</div>
      )}
    </main>
  );
}
