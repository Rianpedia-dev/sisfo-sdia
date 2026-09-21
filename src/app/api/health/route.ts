import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Health check endpoint ringan untuk load balancer, Nginx, dan uptime monitoring.
 * Melakukan query paling ringan (SELECT 1) untuk memastikan konektivitas database berjalan baik.
 */
export async function GET() {
  const startTime = Date.now();
  let dbHealthy = false;

  try {
    // Quick probe to ensure database connectivity
    await prisma.$queryRaw`SELECT 1`;
    dbHealthy = true;
  } catch {
    dbHealthy = false;
  }

  const responseTimeMs = Date.now() - startTime;

  if (!dbHealthy) {
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        responseTimeMs,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      status: "healthy",
      database: "connected",
      uptimeSeconds: Math.floor(process.uptime()),
      responseTimeMs,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
