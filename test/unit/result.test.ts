import { describe, it, expect } from "vitest";
import { successResult, errorResult } from "@/lib/result";
import { AppError, ValidationError, NotFoundError, UnauthorizedError } from "@/lib/errors";

describe("ActionResult Factory & Error Classes", () => {
  it("should create successful result with data and message", () => {
    const res = successResult({ id: "100" }, "Berhasil disimpan");
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data).toEqual({ id: "100" });
      expect(res.message).toBe("Berhasil disimpan");
      expect(res.error).toBeUndefined();
    }
  });

  it("should create error result with error message and fieldErrors", () => {
    const res = errorResult("Validasi gagal", { email: ["Email tidak valid"] });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBe("Validasi gagal");
      expect(res.fieldErrors?.email).toContain("Email tidak valid");
    }
  });

  it("should instantiate AppError subclasses with correct status codes", () => {
    const unauth = new UnauthorizedError();
    expect(unauth.statusCode).toBe(403);
    expect(unauth.name).toBe("UnauthorizedError");

    const notFound = new NotFoundError("Data tidak ada");
    expect(notFound.statusCode).toBe(404);
    expect(notFound.message).toBe("Data tidak ada");

    const valErr = new ValidationError("Salah input", { name: ["Terlalu pendek"] });
    expect(valErr.statusCode).toBe(422);
    expect(valErr.fieldErrors?.name).toBeDefined();
  });
});
