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
