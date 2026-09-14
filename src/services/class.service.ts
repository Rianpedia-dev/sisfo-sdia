import prisma from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { serializeBigInt } from "@/lib/serializer";

export interface CreateClassInput {
  nama_kelas: string;
  wali_kelas?: string | null;
  jumlah_siswa?: string | null;
  code_restrict?: string | null;
}

export interface UpdateClassInput extends CreateClassInput {
  id: string;
}

export class ClassService {
  /**
   * Membuat rombel / kelas baru
   */
  static async createClass(data: CreateClassInput) {
    if (!data.nama_kelas || data.nama_kelas.trim().length === 0) {
      throw new ValidationError("Nama kelas wajib diisi.");
    }

    const created = await prisma.kelas.create({
      data: {
        nama_kelas: data.nama_kelas,
        wali_kelas: data.wali_kelas || null,
        jumlah_siswa: data.jumlah_siswa || null,
        code_restrict: data.code_restrict || null,
      },
    });

    if (data.code_restrict) {
      await prisma.restrict.create({
        data: {
          nama_kelas: data.nama_kelas,
          code_restrict: data.code_restrict,
        },
      });
    }

    return serializeBigInt(created);
  }

  /**
   * Memperbarui informasi kelas dan wali kelas
   */
  static async updateClass(data: UpdateClassInput) {
    const existing = await prisma.kelas.findUnique({
      where: { id: BigInt(data.id) },
    });

    if (!existing) {
      throw new NotFoundError("Kelas tidak ditemukan.");
    }

    const updated = await prisma.kelas.update({
      where: { id: BigInt(data.id) },
      data: {
        nama_kelas: data.nama_kelas,
        wali_kelas: data.wali_kelas || null,
        jumlah_siswa: data.jumlah_siswa || null,
        code_restrict: data.code_restrict || null,
      },
    });

    return serializeBigInt(updated);
  }

  /**
   * Menghapus data kelas
   */
  static async deleteClass(id: string) {
    const existing = await prisma.kelas.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      throw new NotFoundError("Kelas tidak ditemukan.");
    }

    await prisma.kelas.delete({
      where: { id: BigInt(id) },
    });

    return true;
  }

  /**
   * Memperbarui kode restrict iPad per kelas
   */
  static async updateRestrictCode(id: string, code_restrict: string) {
    const updated = await prisma.restrict.update({
      where: { id: BigInt(id) },
      data: { code_restrict },
    });

    return serializeBigInt(updated);
  }
}
