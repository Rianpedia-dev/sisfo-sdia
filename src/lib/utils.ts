export { cn } from "cn";

/**
 * Mendapatkan Tahun Pelajaran dan Semester berjalan berdasarkan aturan PRD Section 18:
 * - Jika bulan saat ini >= Juli (7): Tahun Pelajaran = {tahun}/{tahun+1}, Semester 1
 * - Jika bulan saat ini < Juli (7): Tahun Pelajaran = {tahun-1}/{tahun}, Semester 2
 */
export function getAcademicYear(dateInput: Date = new Date()) {
  const currentMonth = dateInput.getMonth() + 1; // 1-12
  const currentYear = dateInput.getFullYear();

  if (currentMonth >= 7) {
    return {
      tahunPelajaran: `${currentYear}/${currentYear + 1}`,
      semester: "Semester 1",
      semesterNum: 1,
    };
  } else {
    return {
      tahunPelajaran: `${currentYear - 1}/${currentYear}`,
      semester: "Semester 2",
      semesterNum: 2,
    };
  }
}

export function formatDateIndo(dateStrOrObj: string | Date | null | undefined): string {
  if (!dateStrOrObj) return "-";
  const date = typeof dateStrOrObj === "string" ? new Date(dateStrOrObj) : dateStrOrObj;
  if (isNaN(date.getTime())) return String(dateStrOrObj);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(dateStrOrObj: string | Date | null | undefined): string {
  if (!dateStrOrObj) return "-";
  const date = typeof dateStrOrObj === "string" ? new Date(dateStrOrObj) : dateStrOrObj;
  if (isNaN(date.getTime())) return String(dateStrOrObj);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getRoleFromStatus(status: string | number): "admin" | "guru" | "siswa" | "unverified" {
  const s = String(status);
  if (s === "3") return "admin";
  if (s === "2" || s === "4") return "guru";
  if (s === "1") return "siswa";
  return "unverified";
}

export function getRoleLabel(status: string | number): string {
  const s = String(status);
  if (s === "3") return "Administrator";
  if (s === "4") return "Guru & Wali Kelas";
  if (s === "2") return "Guru";
  if (s === "1") return "Siswa";
  return "Belum Terverifikasi";
}

/**
 * Mendapatkan URL foto profil default berdasarkan gender:
 * - Laki-laki ('L', 'laki-laki', 'pria', dll) -> /profil-default-laki-laki.avif
 * - Perempuan ('P', 'perempuan', 'wanita', dll) -> /profil-default-perempuan.avif
 */
export function getDefaultProfileImage(gender?: string | null): string {
  if (!gender) return "/profil-default-laki-laki.avif";
  const g = String(gender).trim().toUpperCase();
  if (g === "P" || g === "PEREMPUAN" || g === "WANITA" || g === "F" || g === "FEMALE") {
    return "/profil-default-perempuan.avif";
  }
  return "/profil-default-laki-laki.avif";
}

/**
 * Mengembalikan foto profil jika pengguna sudah mengunggah, atau foto default sesuai gender jika belum update.
 */
export function getUserProfileImage(image?: string | null, gender?: string | null): string {
  if (image && typeof image === "string" && image.trim() !== "" && image !== "null" && image !== "undefined") {
    return image;
  }
  return getDefaultProfileImage(gender);
}
