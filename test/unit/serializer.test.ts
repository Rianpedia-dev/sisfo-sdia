import { describe, it, expect } from "vitest";
import { serializeBigInt } from "@/lib/serializer";

describe("serializeBigInt Utility", () => {
  it("should convert a standalone BigInt to string", () => {
    const input = BigInt(9007199254740991);
    const result = serializeBigInt(input);
    expect(result).toBe("9007199254740991");
    expect(typeof result).toBe("string");
  });

  it("should safely convert BigInt inside an object", () => {
    const user = {
      id: BigInt(42),
      name: "Muhammad Fatih",
      point: "100",
      active: true,
    };
    const result = serializeBigInt(user);
    expect(result).toEqual({
      id: "42",
      name: "Muhammad Fatih",
      point: "100",
      active: true,
    });
  });

  it("should handle nested objects and arrays with BigInts", () => {
    const data = {
      classId: BigInt(10),
      students: [
        { id: BigInt(1), name: "Aisyah" },
        { id: BigInt(2), name: "Ahmad" },
      ],
    };
    const result = serializeBigInt(data);
    expect(result.classId).toBe("10");
    expect(result.students[0].id).toBe("1");
    expect(result.students[1].id).toBe("2");
  });

  it("should preserve Date objects and nulls", () => {
    const now = new Date();
    const input = {
      id: BigInt(123),
      createdAt: now,
      deletedAt: null,
      notes: undefined,
    };
    const result = serializeBigInt(input);
    expect(result.id).toBe("123");
    expect(result.createdAt).toBe(now);
    expect(result.deletedAt).toBeNull();
    expect(result.notes).toBeUndefined();
  });
});
