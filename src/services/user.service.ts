import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";
import prisma from "@/lib/prisma";
import { AppError, NotFoundError, ValidationError } from "@/lib/errors";
import { serializeBigInt } from "@/lib/serializer";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: string;
  kelas?: string | null;
  appleid?: string | null;
  passwordappleid?: string | null;
  gender?: string;
  nis?: string | null;
  nip?: string | null;
  guru_bidang?: string | null;
}

export interface UpdateUserInput {
  id: string;
  name?: string;
  email?: string;
  kelas?: string | null;
  appleid?: string | null;
  passwordappleid?: string | null;
  ctt_iPad?: string | null;
  password?: string;
  address?: string | null;
  notes?: string | null;
  skills?: string | null;
  guru_bidang?: string | null;
  image?: string | null;
}

export class UserService {
  /**
   * Menambahkan pengguna baru ke sistem (Siswa, Guru, Wali)
   */
  static async createUser(data: CreateUserInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ValidationError("Email sudah terdaftar dalam sistem.");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const roleStatus = data.role || "1"; // 1=siswa, 2=guru, 4=wali

    const created = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        password1: data.password, // fallback legacy
        status: roleStatus,
        kelas: data.kelas || null,
        appleid: data.appleid || null,
        passwordappleid: data.passwordappleid || null,
        gender: data.gender || "L",
        nis: data.nis || null,
        nip: data.nip || null,
        guru_bidang: data.guru_bidang || null,
        point: "0",
      },
    });

    return serializeBigInt(created);
  }

  /**
   * Memperbarui informasi pengguna
   */
  static async updateUser(data: UpdateUserInput) {
    const existing = await prisma.user.findUnique({
      where: { id: BigInt(data.id) },
    });

    if (!existing) {
      throw new NotFoundError("Pengguna tidak ditemukan.");
    }

    const dataToUpdate: Record<string, unknown> = {};
    if (data.name !== undefined) dataToUpdate.name = data.name;
    if (data.email !== undefined) dataToUpdate.email = data.email;
    if (data.kelas !== undefined) dataToUpdate.kelas = data.kelas;
    if (data.appleid !== undefined) dataToUpdate.appleid = data.appleid;
    if (data.passwordappleid !== undefined) dataToUpdate.passwordappleid = data.passwordappleid;
    if (data.ctt_iPad !== undefined) dataToUpdate.ctt_iPad = data.ctt_iPad;
    if (data.address !== undefined) dataToUpdate.address = data.address;
    if (data.notes !== undefined) dataToUpdate.notes = data.notes;
    if (data.skills !== undefined) dataToUpdate.skills = data.skills;
    if (data.guru_bidang !== undefined) dataToUpdate.guru_bidang = data.guru_bidang;
    if (data.image !== undefined) dataToUpdate.image = data.image;

    if (data.password && data.password.trim().length > 0) {
      dataToUpdate.password = await bcrypt.hash(data.password, 10);
      dataToUpdate.password1 = data.password;
    }

    const updated = await prisma.user.update({
      where: { id: BigInt(data.id) },
      data: dataToUpdate,
    });

    return serializeBigInt(updated);
  }

  /**
   * Menghapus pengguna secara permanen
   */
  static async deleteUser(id: string) {
    const existing = await prisma.user.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      throw new NotFoundError("Pengguna tidak ditemukan.");
    }

    await prisma.user.delete({
      where: { id: BigInt(id) },
    });

    return true;
  }

  /**
   * Memverifikasi status akun (misal guru baru status 0 -> 2 atau 4)
   */
  static async verifyUser(id: string, status: string) {
    const updated = await prisma.user.update({
      where: { id: BigInt(id) },
      data: { status },
    });

    return serializeBigInt(updated);
  }

  /**
   * Menambah atau mengurangi point perilaku siswa
   */
  static async adjustStudentPoint(studentId: string, delta: number) {
    const student = await prisma.user.findUnique({
      where: { id: BigInt(studentId) },
    });

    if (!student) {
      throw new NotFoundError("Siswa tidak ditemukan.");
    }

    const currentPoint = parseInt(student.point || "0", 10) || 0;
    const newPoint = Math.max(0, currentPoint + delta);

    const updated = await prisma.user.update({
      where: { id: BigInt(studentId) },
      data: { point: String(newPoint) },
    });

    return { newPoint, user: serializeBigInt(updated) };
  }

  /**
   * Mendaftarkan siswa ke kelas wali
   */
  static async enrollStudentToClass(studentId: string, kelas: string) {
    const updated = await prisma.user.update({
      where: { id: BigInt(studentId) },
      data: { kelas },
    });

    return serializeBigInt(updated);
  }

  /**
   * Mengeluarkan sejumlah siswa dari kelas (set kelas = null)
   */
  static async removeStudentsFromClass(studentIds: string[]) {
    if (!studentIds || studentIds.length === 0) return 0;

    const result = await prisma.user.updateMany({
      where: {
        id: { in: studentIds.map((id) => BigInt(id)) },
      },
      data: { kelas: null },
    });

    return result.count;
  }

  /**
   * Mengimpor data siswa secara massal dari file Excel (base64 buffer) dengan batching
   */
  static async importStudentsFromBase64(base64Data: string): Promise<number> {
    const buffer = Buffer.from(base64Data, "base64");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new AppError("File Excel tidak memiliki lembar kerja (sheet).");
    }

    const worksheet = workbook.Sheets[sheetName];
    // Format: Email, Password, Password Plain, Nama, Apple ID, Password Apple ID, Status, Gender
    const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
    const dataRows = rows.slice(1);
    let importedCount = 0;

    // Proses dalam chunk 10 baris agar tidak memblokir event loop saat ribuan siswa diimpor
    const CHUNK_SIZE = 10;
    for (let i = 0; i < dataRows.length; i += CHUNK_SIZE) {
      const chunk = dataRows.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (row) => {
          if (!row || row.length < 4) return;
          const email = String(row[0] || "").trim();
          const passwordPlain = String(row[2] || row[1] || "123456").trim();
          const name = String(row[3] || "").trim();
          const appleid = row[4] ? String(row[4]).trim() : null;
          const passwordappleid = row[5] ? String(row[5]).trim() : null;
          const status = row[6] ? String(row[6]).trim() : "1";
          const gender = row[7] ? String(row[7]).trim() : "L";

          if (!email || !name) return;

          const hashedPassword = await bcrypt.hash(passwordPlain, 10);

          await prisma.user.upsert({
            where: { email },
            update: {
              name,
              appleid,
              passwordappleid,
              gender,
              status,
            },
            create: {
              email,
              name,
              password: hashedPassword,
              password1: passwordPlain,
              appleid,
              passwordappleid,
              status,
              gender,
            },
          });
          importedCount++;
        })
      );
    }

    return importedCount;
  }
}
