import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
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
  } catch (err: any) {
    dbConnected = false;
    errorDetail = err?.message || String(err);
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
