import { describe, it, expect } from "vitest";
import {
  getAcademicYear,
  getRoleFromStatus,
  getRoleLabel,
  getDefaultProfileImage,
  getUserProfileImage,
} from "@/lib/utils";

describe("Academic Year Calculation (PRD Section 18)", () => {
  it("should calculate Semester 1 for months July - December", () => {
    // 15 Agustus 2026
    const augDate = new Date(2026, 7, 15);
    const result = getAcademicYear(augDate);
    expect(result.tahunPelajaran).toBe("2026/2027");
    expect(result.semester).toBe("Semester 1");
    expect(result.semesterNum).toBe(1);
  });

  it("should calculate Semester 2 for months January - June", () => {
    // 10 Maret 2026
    const marDate = new Date(2026, 2, 10);
    const result = getAcademicYear(marDate);
    expect(result.tahunPelajaran).toBe("2025/2026");
    expect(result.semester).toBe("Semester 2");
    expect(result.semesterNum).toBe(2);
  });
});

describe("Role & Status Resolver (RBAC)", () => {
  it("should resolve status 3 to admin", () => {
    expect(getRoleFromStatus("3")).toBe("admin");
    expect(getRoleLabel("3")).toBe("Administrator");
  });

  it("should resolve status 4 and 2 to guru", () => {
    expect(getRoleFromStatus("4")).toBe("guru");
    expect(getRoleLabel("4")).toBe("Guru & Wali Kelas");
    expect(getRoleFromStatus("2")).toBe("guru");
    expect(getRoleLabel("2")).toBe("Guru");
  });

  it("should resolve status 1 to siswa", () => {
    expect(getRoleFromStatus("1")).toBe("siswa");
    expect(getRoleLabel("1")).toBe("Siswa");
  });

  it("should resolve status 0 to unverified", () => {
    expect(getRoleFromStatus("0")).toBe("unverified");
    expect(getRoleLabel("0")).toBe("Belum Terverifikasi");
  });
});

describe("Profile Image Resolver", () => {
  it("should return default male avatar for 'L' or undefined", () => {
    expect(getDefaultProfileImage("L")).toBe("/profil-default-laki-laki.avif");
    expect(getDefaultProfileImage(undefined)).toBe("/profil-default-laki-laki.avif");
  });

  it("should return default female avatar for 'P' or 'perempuan'", () => {
    expect(getDefaultProfileImage("P")).toBe("/profil-default-perempuan.avif");
    expect(getDefaultProfileImage("perempuan")).toBe("/profil-default-perempuan.avif");
  });

  it("should return uploaded image if valid string, else fallback to gender default", () => {
    expect(getUserProfileImage("/uploads/images/photo.png", "L")).toBe("/uploads/images/photo.png");
    expect(getUserProfileImage(null, "P")).toBe("/profil-default-perempuan.avif");
    expect(getUserProfileImage("", "L")).toBe("/profil-default-laki-laki.avif");
  });
});
