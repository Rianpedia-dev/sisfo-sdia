import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Periksa kembali email anda"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerTeacherSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().min(3, "Email / Username minimal 3 karakter"),
  appleid: z.string().min(1, "Apple ID wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  passwordappleid: z.string().min(1, "Password Apple ID wajib diisi"),
  guru_bidang: z.string().min(1, "Bidang studi wajib diisi"),
  gender: z.enum(["L", "P"], { message: "Pilih jenis kelamin" }),
  nip: z.string().optional(),
  kelas: z.string().optional().default("-"),
});

export const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["1", "2", "4"], { message: "Pilih role" }),
  kelas: z.string().optional(),
  appleid: z.string().optional(),
  passwordappleid: z.string().optional(),
  gender: z.enum(["L", "P"]).optional(),
  nis: z.string().optional(),
  nip: z.string().optional(),
  guru_bidang: z.string().optional(),
});

export const createClassSchema = z.object({
  nama_kelas: z.string().min(3, "Nama kelas minimal 3 karakter"),
  wali_kelas: z.string().optional(),
  jumlah_siswa: z.string().optional(),
  code_restrict: z.string().optional(),
});

export const announcementSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  from: z.string().min(1, "Asal pengumuman wajib diisi"),
  pengumuman: z.string().min(5, "Konten pengumuman minimal 5 karakter"),
  file: z.string().optional(),
});

export const eventSchema = z.object({
  title: z.string().min(2, "Judul event wajib diisi"),
  kelas: z.string().min(1, "Pilih kelas"),
  from: z.string().optional(),
  start: z.string().min(1, "Tanggal mulai wajib diisi"),
  end: z.string().optional(),
  deskripsi: z.string().optional(),
  backgroundColor: z.string().optional(),
});

export const violationSchema = z.object({
  user_id: z.string().min(1, "Pilih siswa"),
  nama: z.string().optional(),
  kelas: z.string().optional(),
  kategori: z.string().min(1, "Kategori pelanggaran wajib diisi"),
  keterangan: z.string().min(1, "Keterangan wajib diisi"),
});

export const latenessSchema = z.object({
  user_id: z.string().min(1, "Pilih siswa"),
  nama: z.string().min(1, "Nama siswa wajib diisi"),
  kelas: z.string().min(1, "Kelas wajib diisi"),
  waktu: z.string().min(1, "Waktu keterlambatan wajib diisi"),
  keterangan: z.string().min(1, "Alasan keterlambatan wajib diisi"),
});

export const bestStudentSchema = z.object({
  name: z.string().min(1, "Nama siswa wajib diisi"),
  kelas: z.string().min(1, "Kelas wajib diisi"),
  kategori: z.string().min(1, "Kategori penghargaan wajib diisi"),
  foto: z.string().optional(),
});

export const achievementSchema = z.object({
  id_user: z.string().min(1, "ID siswa wajib diisi"),
  nama: z.string().min(1, "Nama siswa wajib diisi"),
  kelas: z.string().min(1, "Kelas wajib diisi"),
  fotoanak: z.string().min(1, "Foto prestasi wajib diisi"),
  prestasi: z.string().min(1, "Deskripsi prestasi wajib diisi"),
});

export const prayerChecklistSchema = z.object({
  subuh: z.boolean().optional(),
  dhuha: z.boolean().optional(),
  dzuhur: z.boolean().optional(),
  ashar: z.boolean().optional(),
  maghrib: z.boolean().optional(),
  isya: z.boolean().optional(),
});
