import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL || "mysql://root:@localhost:3306/sisfo_alazhar";
  try {
    const parsed = new URL(url);
    const adapter = new PrismaMariaDb({
      host: parsed.hostname || "localhost",
      port: parsed.port ? parseInt(parsed.port, 10) : 3306,
      user: parsed.username || "root",
      password: parsed.password || "",
      database: parsed.pathname.replace(/^\//, "") || "sisfo_alazhar",
      connectionLimit: 10,
    });
    return new PrismaClient({ adapter });
  } catch {
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
