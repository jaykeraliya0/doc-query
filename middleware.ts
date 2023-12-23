import { NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export default async function middleware(
  req: NextRequest,
  event: NextFetchEvent
) {
  const session = await getServerSession();

  if (req.nextUrl.pathname.startsWith("/sign-in") && session?.user) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const authMiddleware = withAuth({
    pages: {
      signIn: `/authentication/sign-in`,
    },
  });

  return authMiddleware(req as NextRequestWithAuth, event);
}

export const config = {
  matcher: ["/sign-in", "/dashboard/:path*"],
};
