import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { parseSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth-session";
import type { SessionUser } from "@/lib/mock-data";

type Role = SessionUser["role"];

const allowedRolesByPath: Record<string, Role[]> = {
  "/dashboard": ["admin", "super_admin", "general_admin"],
  "/orders": ["admin", "super_admin"],
  "/products": ["admin", "super_admin"],
  "/stock": ["admin"],
  "/finance": ["admin", "super_admin"],
  "/users": ["admin", "super_admin", "general_admin"],
  "/company": ["admin", "super_admin", "general_admin"],
  "/branches": ["super_admin"],
  "/companies": ["general_admin"],
  "/onboarding": ["general_admin"],
  "/reports": ["general_admin"],
};

const resolveBasePath = (pathname: string) => {
  const candidates = Object.keys(allowedRolesByPath).sort(
    (a, b) => b.length - a.length,
  );

  return candidates.find(
    (candidate) =>
      pathname === candidate || pathname.startsWith(`${candidate}/`),
  );
};

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const matchedPath = resolveBasePath(pathname);

  if (!matchedPath) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const session = parseSessionToken(sessionCookie);

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!allowedRolesByPath[matchedPath].includes(session.role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/orders/:path*",
    "/products/:path*",
    "/stock/:path*",
    "/finance/:path*",
    "/users/:path*",
    "/company/:path*",
    "/branches/:path*",
    "/companies/:path*",
    "/onboarding/:path*",
    "/reports/:path*",
  ],
};
