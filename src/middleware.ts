import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "alazharsdsecretkey2026modernrebuild_at_least_32_chars_long!!"
);

interface SessionPayload {
  id: string;
  name: string;
  email: string;
  role: "admin" | "guru" | "siswa";
  status: string;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("sisfo_session")?.value;

  let session: SessionPayload | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      session = payload as unknown as SessionPayload;
    } catch {
      session = null;
    }
  }

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isAdminRoute = pathname.startsWith("/admin");
  const isGuruRoute = pathname.startsWith("/guru");
  const isSiswaRoute = pathname.startsWith("/siswa");
  const isProtected = isAdminRoute || isGuruRoute || isSiswaRoute;

  // Root path redirect
  if (pathname === "/") {
    if (session) {
      if (session.role === "admin") return NextResponse.redirect(new URL("/admin", request.url));
      if (session.role === "guru") return NextResponse.redirect(new URL("/guru", request.url));
      if (session.role === "siswa") return NextResponse.redirect(new URL("/siswa", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If already logged in and visiting login or register, redirect to appropriate dashboard
  if (isAuthRoute && session) {
    if (session.role === "admin") return NextResponse.redirect(new URL("/admin", request.url));
    if (session.role === "guru") return NextResponse.redirect(new URL("/guru", request.url));
    if (session.role === "siswa") return NextResponse.redirect(new URL("/siswa", request.url));
  }

  // If visiting protected route without valid session, redirect to login
  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  if (session) {
    if (isAdminRoute && session.role !== "admin") {
      return NextResponse.redirect(new URL(`/${session.role}`, request.url));
    }
    if (isGuruRoute && session.role !== "guru") {
      return NextResponse.redirect(new URL(`/${session.role}`, request.url));
    }
    if (isSiswaRoute && session.role !== "siswa") {
      return NextResponse.redirect(new URL(`/${session.role}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/admin/:path*",
    "/guru/:path*",
    "/siswa/:path*",
  ],
};
