import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Hanya Admin atau caller dengan header x-status-key yang valid yang boleh mengakses
  const session = await getSession();
  const statusKey = request.headers.get("x-status-key") || request.nextUrl.searchParams.get("key");
  const isKeyValid = process.env.INTERNAL_STATUS_KEY && statusKey === process.env.INTERNAL_STATUS_KEY;

  if (session?.role !== "admin" && !isKeyValid && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Unauthorized: Akses status database dibatasi." },
      { status: 401 }
    );
  }

  const rawUrl = process.env.DATABASE_URL || "";
  const hasDbUrl = !!rawUrl;

  let redactedUrl = "NOT_SET";
  if (hasDbUrl) {
    try {
      const clean = rawUrl.replace(/^["']|["']$/g, "").trim();
      const parsed = new URL(clean);
      redactedUrl = `${parsed.protocol}//${parsed.username}:****@${parsed.hostname}:${parsed.port}${parsed.pathname}`;
    } catch {
      redactedUrl = "INVALID_URL_FORMAT";
    }
  }

  let dbConnected = false;
  let userCount = 0;
  let errorDetail: string | null = null;

  try {
    userCount = await prisma.user.count();
    dbConnected = true;
  } catch (err: unknown) {
    dbConnected = false;
    errorDetail = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json({
    status: dbConnected ? "ok" : "error",
    has_database_url: hasDbUrl,
    redacted_database_url: redactedUrl,
    db_connected: dbConnected,
    user_count: userCount,
    error: errorDetail,
    timestamp: new Date().toISOString(),
  });
}
