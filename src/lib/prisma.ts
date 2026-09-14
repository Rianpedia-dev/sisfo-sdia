import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  let rawUrl = (process.env.DATABASE_URL || "").trim();

  // Bersihkan tanda petik ganda/tunggal jika user memasukkannya di Vercel Environment Variables
  if (
    (rawUrl.startsWith('"') && rawUrl.endsWith('"')) ||
    (rawUrl.startsWith("'") && rawUrl.endsWith("'"))
  ) {
    rawUrl = rawUrl.slice(1, -1).trim();
  }

  const url = rawUrl || "mysql://root:@localhost:3306/sisfo_alazhar";

  try {
    const parsed = new URL(url);
    const isLocal = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";

    const dbName = parsed.pathname.replace(/^\//, "").split("?")[0] || "sisfo_alazhar";

    const adapter = new PrismaMariaDb({
      host: parsed.hostname || "localhost",
      port: parsed.port ? parseInt(parsed.port, 10) : 3306,
      user: decodeURIComponent(parsed.username || "root"),
      password: decodeURIComponent(parsed.password || ""),
      database: dbName,
      connectionLimit: 5,
      ssl: isLocal ? undefined : { minVersion: "TLSv1.2", rejectUnauthorized: true },
    });

    return new PrismaClient({ adapter });
  } catch (err) {
    console.error("[Prisma Setup Error] Failed to parse DATABASE_URL:", err);
    // Fallback adapter configuration
    const adapter = new PrismaMariaDb({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "",
      database: "sisfo_alazhar",
    });
    return new PrismaClient({ adapter });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
