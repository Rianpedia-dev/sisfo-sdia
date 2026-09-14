/**
 * Utilitas untuk mengonversi seluruh tipe BigInt (yang dihasilkan oleh Prisma MySQL)
 * menjadi string biasa secara rekursif agar dapat diserialisasikan ke JSON atau
 * dikirim dengan aman dari Server Components ke Client Components.
 */

export type Serialized<T> = T extends bigint
  ? string
  : T extends Date
  ? Date
  : T extends Array<infer U>
  ? Array<Serialized<U>>
  : T extends object
  ? { [K in keyof T]: Serialized<T[K]> }
  : T;

export function serializeBigInt<T>(data: T): Serialized<T> {
  if (data === null || data === undefined) {
    return data as Serialized<T>;
  }

  if (typeof data === "bigint") {
    return data.toString() as unknown as Serialized<T>;
  }

  if (data instanceof Date) {
    return data as unknown as Serialized<T>;
  }

  if (Array.isArray(data)) {
    return data.map((item) => serializeBigInt(item)) as unknown as Serialized<T>;
  }

  if (typeof data === "object") {
    const serialized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeBigInt(value);
    }
    return serialized as Serialized<T>;
  }

  return data as unknown as Serialized<T>;
}
