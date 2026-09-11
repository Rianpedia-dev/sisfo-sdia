export type RoleType = "admin" | "guru" | "siswa" | "unverified";

export interface UserItem {
  id: string;
  name: string;
  nis?: string | null;
  nip?: string | null;
  guru_bidang?: string | null;
  email: string;
  appleid?: string | null;
  password1?: string | null;
  passwordappleid?: string | null;
  gender?: string | null;
  kelas?: string | null;
  status: string;
  ctt_iPad?: string | null;
  image?: string | null;
  address?: string | null;
  notes?: string | null;
  skills?: string | null;
  point?: string | null;
  created_at?: Date | string | null;
}

export interface KelasItem {
  id: string;
  nama_kelas: string;
  wali_kelas?: string | null;
  jumlah_siswa?: string | null;
  code_restrict?: string | null;
}

export interface PengumumanItem {
  id: string;
  from?: string | null;
  title: string;
  file?: string | null;
  pengumuman: string;
  like?: string | null;
  created_at?: Date | string | null;
}

export interface EventItem {
  id: string;
  title: string;
  kelas: string;
  from?: string | null;
  start: string;
  end?: string | null;
  deskripsi?: string | null;
  backgroundColor?: string | null;
}

export interface AbsenItem {
  id: string;
  user_id: string;
  userName?: string;
  kelas: string;
  keterangan: "Hadir" | "Sakit" | "Izin" | "Alpha" | string;
  date: string;
  month?: string | null;
}

export interface PrayerItem {
  id: string;
  date: string;
  subuh?: string | null;
  dhuha?: string | null;
  dzuhur?: string | null;
  ashar?: string | null;
  maghrib?: string | null;
  isya?: string | null;
  verified_otm?: string | null;
  verified_guru?: string | null;
}

export interface BestStudentItem {
  id: string;
  name: string;
  foto?: string | null;
  kelas: string;
  kategori: string;
  created_at?: Date | string | null;
}

export interface PrestasiItem {
  id: string;
  id_user: string;
  nama: string;
  kelas: string;
  fotoanak: string;
  prestasi: string;
  created_at?: Date | string | null;
}

export interface ViolationItem {
  id: string;
  user_id: string;
  nama?: string | null;
  kelas?: string | null;
  kategori?: string | null;
  keterangan?: string | null;
  created_at?: Date | string | null;
}

export interface LatenessItem {
  id: string;
  user_id: string;
  nama: string;
  kelas: string;
  waktu: string;
  keterangan: string;
  created_at?: Date | string | null;
}

export interface RestrictItem {
  id: string;
  nama_kelas: string;
  code_restrict: string;
}
