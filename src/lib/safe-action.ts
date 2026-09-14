import { z } from "zod";
import { getSession, type SessionUser } from "./auth";
import { errorResult, type ActionResult } from "./result";
import { AppError, UnauthorizedError, UnauthenticatedError } from "./errors";

export interface ActionContext {
  session: SessionUser;
}

export type ActionHandler<TInput, TOutput> = (
  input: TInput,
  ctx: ActionContext
) => Promise<ActionResult<TOutput>>;

export interface SafeActionOptions<TInput> {
  roles?: Array<"admin" | "guru" | "siswa">;
  schema?: z.ZodType<TInput>;
}

/**
 * Higher-order function untuk mengamankan Server Actions:
 * 1. Otomatis cek autentikasi & validasi role
 * 2. Validasi input menggunakan Zod schema jika disediakan
 * 3. Menangkap error secara terpusat dan mengembalikan ActionResult yang aman
 */
export function createSafeAction<TInput, TOutput>(
  options: SafeActionOptions<TInput>,
  handler: ActionHandler<TInput, TOutput>
) {
  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    try {
      // 1. Otorisasi & Sesi
      const session = await getSession();
      if (!session) {
        throw new UnauthenticatedError();
      }

      if (options.roles && !options.roles.includes(session.role)) {
        throw new UnauthorizedError(
          `Akses ditolak: Dibutuhkan peran ${options.roles.join("/")}, Anda masuk sebagai ${session.role}.`
        );
      }

      // 2. Validasi Input Zod
      let validatedInput = input;
      if (options.schema) {
        const parseResult = options.schema.safeParse(input);
        if (!parseResult.success) {
          const fieldErrors = parseResult.error.flatten().fieldErrors;
          const firstError = parseResult.error.issues[0]?.message || "Validasi gagal.";
          return errorResult(firstError, fieldErrors as Record<string, string[]>);
        }
        validatedInput = parseResult.data;
      }

      // 3. Eksekusi Handler
      return await handler(validatedInput, { session });
    } catch (err: unknown) {
      if (err instanceof AppError) {
        return errorResult(err.message, (err as any).fieldErrors);
      }

      console.error("[SafeAction Error]:", err);
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan internal pada server.";
      return errorResult(message);
    }
  };
}
