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

    const defaultLimit = process.env.NODE_ENV === "production" ? 25 : 5;
    const poolLimit = parseInt(
      process.env.DB_CONNECTION_LIMIT || process.env.DATABASE_POOL_SIZE || String(defaultLimit),
      10
    ) || defaultLimit;

    const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false";

    const adapter = new PrismaMariaDb({
      host: parsed.hostname || "localhost",
      port: parsed.port ? parseInt(parsed.port, 10) : 3306,
      user: decodeURIComponent(parsed.username || "root"),
      password: decodeURIComponent(parsed.password || ""),
      database: dbName,
      connectionLimit: poolLimit,
      ssl: isLocal ? undefined : { minVersion: "TLSv1.2", rejectUnauthorized },
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
      connectionLimit: 5,
    });
    return new PrismaClient({ adapter });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Selalu simpan di globalThis agar tidak membuat pool baru pada re-evaluasi server actions
globalForPrisma.prisma = prisma;

export default prisma;
