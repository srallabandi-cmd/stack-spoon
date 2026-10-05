import { NextResponse, type NextRequest } from "next/server";

// Browse path is public so a visitor can see roles and the agents in each pack.
// Propose and write-back still require a session.
const PROTECTED: string[] = [];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get("ss_session")?.value;
  if (token) return NextResponse.next();

  const login = req.nextUrl.clone();
  login.pathname = "/login";
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/start",
    "/start/:path*",
    "/pack",
    "/pack/:path*",
    "/hub",
    "/hub/:path*",
    "/inbox",
    "/inbox/:path*",
    "/brief",
    "/brief/:path*",
  ],
};
