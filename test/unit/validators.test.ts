import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerTeacherSchema,
  createClassSchema,
  announcementSchema,
  eventSchema,
  violationSchema,
  latenessSchema,
  bestStudentSchema,
} from "@/lib/validators";

describe("Zod Validation Contracts", () => {
  describe("loginSchema", () => {
    it("should accept valid email and password", () => {
      const res = loginSchema.safeParse({
        email: "admin@gmail.com",
        password: "password123",
      });
      expect(res.success).toBe(true);
    });

    it("should reject empty email or password", () => {
      const res = loginSchema.safeParse({ email: "", password: "" });
      expect(res.success).toBe(false);
    });
  });

  describe("registerTeacherSchema", () => {
    it("should validate complete teacher registration data", () => {
      const validData = {
        name: "Ustadz Hamzah, S.Pd",
        email: "hamzah@alazhar.sch.id",
        appleid: "hamzah.cairo@icloud.com",
        password: "securepassword123",
        passwordappleid: "ApplePass123!",
        guru_bidang: "Fikih",
        gender: "L",
        nip: "198801012015011001",
        kelas: "Kelas 5 - Al Bukhari",
      };
      const res = registerTeacherSchema.safeParse(validData);
      expect(res.success).toBe(true);
    });

    it("should reject invalid gender or short password", () => {
      const invalidData = {
        name: "A",
        email: "a",
        appleid: "id",
        password: "123", // too short (< 6 chars)
        passwordappleid: "p",
        guru_bidang: "B",
        gender: "X", // invalid gender
      };
      const res = registerTeacherSchema.safeParse(invalidData);
      expect(res.success).toBe(false);
    });
  });

  describe("createClassSchema", () => {
    it("should validate class creation with minimal required fields", () => {
      const res = createClassSchema.safeParse({
        nama_kelas: "Kelas 4 - Mehmed Al Fatih",
        wali_kelas: "Ustadzah Fatimah, S.Pd",
        jumlah_siswa: "28",
        code_restrict: "2739",
      });
      expect(res.success).toBe(true);
    });

    it("should reject class with name less than 3 chars", () => {
      const res = createClassSchema.safeParse({
        nama_kelas: "4A",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("announcementSchema", () => {
    it("should validate announcement with valid fields", () => {
      const res = announcementSchema.safeParse({
        title: "Pemberitahuan Ujian Tengah Semester",
        from: "Kurikulum & Akademik",
        pengumuman: "Diharapkan seluruh siswa mempersiapkan iPad dalam kondisi prima.",
      });
      expect(res.success).toBe(true);
    });
  });

  describe("eventSchema & disciplinary schemas", () => {
    it("should validate calendar event input", () => {
      const res = eventSchema.safeParse({
        title: "Pesantren Ramadhan",
        kelas: "Semua Kelas",
        start: "2026-03-15",
      });
      expect(res.success).toBe(true);
    });

    it("should validate violation record schema", () => {
      const res = violationSchema.safeParse({
        user_id: "2",
        kategori: "Kedisiplinan",
        keterangan: "Tidak membawa buku Al-Quran Hadits",
      });
      expect(res.success).toBe(true);
    });

    it("should validate lateness record schema", () => {
      const res = latenessSchema.safeParse({
        user_id: "2",
        nama: "Muhammad Fatih",
        kelas: "Kelas 4 - Mehmed Al Fatih",
        waktu: "07:35 WIB",
        keterangan: "Terjebak macet di Jembatan Ampera",
      });
      expect(res.success).toBe(true);
    });

    it("should validate best student schema", () => {
      const res = bestStudentSchema.safeParse({
        name: "Muhammad Fatih",
        kelas: "Kelas 4 - Mehmed Al Fatih",
        kategori: "Tahfidz Terbaik Juz 30",
      });
      expect(res.success).toBe(true);
    });
  });
});
