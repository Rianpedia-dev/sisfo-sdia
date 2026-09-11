// Mock and fallback dataset fully compliant with prd.md

export interface MockStudent {
  id: string;
  name: string;
  nis: string | null;
  nip: string | null;
  email: string;
  appleid: string | null;
  gender: string | null;
  kelas: string | null;
  status: string;
  point: string | null;
  notes: string | null;
  address?: string | null;
  skills?: string | null;
  prayerToday?: any;
}

export interface MockTeacher {
  id: string;
  name: string;
  email: string;
  nip: string | null;
  guru_bidang: string | null;
  kelas: string | null;
  status: string;
  gender: string | null;
}

export interface MockClass {
  id: string;
  nama_kelas: string;
  wali_kelas: string | null;
  jumlah_siswa: string | null;
  code_restrict: string | null;
}

export interface MockRestrict {
  id: string;
  nama_kelas: string;
  code_restrict: string;
}

export interface MockAnnouncement {
  id: string;
  from: string | null;
  title: string;
  file: string | null;
  pengumuman: string;
  like: string | null;
  created_at: Date | null;
}

export interface MockEvent {
  id: string;
  title: string;
  kelas: string;
  from: string | null;
  start: Date;
  end: Date | null;
  deskripsi: string | null;
  backgroundColor: string | null;
}

export interface MockBestStudent {
  id: string;
  name: string;
  foto: string | null;
  kelas: string;
  kategori: string;
  created_at: Date | null;
}

export interface MockPrestasi {
  id: string;
  id_user: string;
  nama: string;
  kelas: string;
  fotoanak: string;
  prestasi: string;
  created_at: Date | null;
}

export const MOCK_CLASSES: MockClass[] = [
  { id: "1", nama_kelas: "Kelas 4 - Mehmed Al Fatih", wali_kelas: "Ustadz Ahmad, S.Pd", jumlah_siswa: "28", code_restrict: "2739" },
  { id: "2", nama_kelas: "Kelas 4 - Sayfuddin Al Quthuz", wali_kelas: "Ustadzah Siti Aminah, S.Pd.I", jumlah_siswa: "27", code_restrict: "2957" },
  { id: "3", nama_kelas: "Kelas 4 - Sholahuddin Al Ayubi", wali_kelas: "Ustadz Faisal, S.Pd", jumlah_siswa: "26", code_restrict: "3419" },
  { id: "4", nama_kelas: "Kelas 4 - Sulaiman Al Qanuni", wali_kelas: "Ustadzah Fatimah, S.Pd", jumlah_siswa: "28", code_restrict: "3458" },
  { id: "5", nama_kelas: "Kelas 4 - Mushab bin Umair", wali_kelas: "Ustadz Ridwan, S.Pd", jumlah_siswa: "25", code_restrict: "2816" },
  { id: "6", nama_kelas: "Kelas 5 - Al Bukhari", wali_kelas: "Ustadz Hanafi, M.Pd", jumlah_siswa: "30", code_restrict: "9375, 1989" },
  { id: "7", nama_kelas: "Kelas 5 - Muslim", wali_kelas: "Ustadzah Aisyah, S.Ag", jumlah_siswa: "29", code_restrict: "1890, 2371" },
  { id: "8", nama_kelas: "Kelas 5 - Abu Daud", wali_kelas: "Ustadz Zulkarnain, S.Pd", jumlah_siswa: "28", code_restrict: "1690, 2560" },
  { id: "9", nama_kelas: "Kelas 5 - Tirmidzi", wali_kelas: "Ustadzah Maryam, S.Pd", jumlah_siswa: "27", code_restrict: "1990, 7373" },
  { id: "10", nama_kelas: "Kelas 5 - An Nasai", wali_kelas: "Ustadz Bilal, S.Pd.I", jumlah_siswa: "28", code_restrict: "1996, 2203" },
  { id: "11", nama_kelas: "Kelas 6 - Tholhah bin Ubaidillah", wali_kelas: "Ustadz Umar, M.Pd", jumlah_siswa: "25", code_restrict: "6183" },
  { id: "12", nama_kelas: "Kelas 6 - Anas bin Malik", wali_kelas: "Ustadzah Khadijah, S.Pd", jumlah_siswa: "26", code_restrict: "6843" },
  { id: "13", nama_kelas: "Kelas 6 - Jabir bin Abdillah", wali_kelas: "Ustadz Salman, S.Pd", jumlah_siswa: "24", code_restrict: "1204" },
  { id: "14", nama_kelas: "Kelas 6 - Mu'adz bin Jabal", wali_kelas: "Ustadz Hamzah, S.Pd.I", jumlah_siswa: "25", code_restrict: "4952" },
  { id: "15", nama_kelas: "Kelas 6 - Urwah bin Zubair", wali_kelas: "Ustadzah Ruqayyah, S.Pd", jumlah_siswa: "24", code_restrict: "1972" },
];

export const MOCK_RESTRICTS: MockRestrict[] = [
  { id: "1", nama_kelas: "Kelas 3 - Ibnu Hayyan", code_restrict: "2739" },
  { id: "2", nama_kelas: "Kelas 3 - Ibnu Rusyd", code_restrict: "2957" },
  { id: "3", nama_kelas: "Kelas 3 - Ibnu Nafis", code_restrict: "3419" },
  { id: "4", nama_kelas: "Kelas 3 - Ibnu Kholdun", code_restrict: "3458" },
  { id: "5", nama_kelas: "Kelas 3 - Ibnu Batutah", code_restrict: "2816" },
  { id: "6", nama_kelas: "Kelas 5 - Al Bukhari", code_restrict: "9375, 1989" },
  { id: "7", nama_kelas: "Kelas 5 - Muslim", code_restrict: "1890, 2371" },
  { id: "8", nama_kelas: "Kelas 5 - Abu Daud", code_restrict: "1690, 2560" },
  { id: "9", nama_kelas: "Kelas 5 - Tirmidzi", code_restrict: "1990, 7373" },
  { id: "10", nama_kelas: "Kelas 5 - An Nasai", code_restrict: "1996, 2203" },
  { id: "11", nama_kelas: "Kelas 6 - Tholha", code_restrict: "6183" },
  { id: "12", nama_kelas: "Kelas 6 - Anas", code_restrict: "6843" },
  { id: "13", nama_kelas: "Kelas 6 - Jabir", code_restrict: "1204" },
  { id: "14", nama_kelas: "Kelas 6 - Muadz", code_restrict: "4952" },
  { id: "15", nama_kelas: "Kelas 6 - Urwah", code_restrict: "1972" },
];

export const MOCK_TEACHERS: MockTeacher[] = [
  { id: "1", name: "Ustadz Ahmad, S.Pd", email: "guru@gmail.com", nip: "198501012010011001", guru_bidang: "Tematik & Agama", kelas: "Kelas 4 - Mehmed Al Fatih", status: "4", gender: "L" },
  { id: "4", name: "Ustadzah Siti Aminah, S.Pd.I", email: "siti.aminah@gmail.com", nip: "198803122011012002", guru_bidang: "Pendidikan Agama Islam", kelas: "Kelas 4 - Sayfuddin Al Quthuz", status: "4", gender: "P" },
  { id: "5", name: "Ustadz Faisal, S.Pd", email: "faisal.it@gmail.com", nip: "199005152015011003", guru_bidang: "IT & Digital Literacy", kelas: "Kelas 4 - Sholahuddin Al Ayubi", status: "4", gender: "L" },
  { id: "6", name: "Ustadzah Fatimah, S.Pd", email: "fatimah.math@gmail.com", nip: "199207202016022004", guru_bidang: "Matematika", kelas: null, status: "2", gender: "P" },
  { id: "7", name: "Ustadz Ridwan, S.Pd", email: "ridwan.science@gmail.com", nip: "199411082019011005", guru_bidang: "Ilmu Pengetahuan Alam", kelas: null, status: "0", gender: "L" },
];

export const MOCK_STUDENTS: MockStudent[] = [
  { id: "2", name: "Muhammad Fatih", nis: "20260401", nip: null, email: "siswa@gmail.com", appleid: "fatih@appleid.com", gender: "L", kelas: "Kelas 4 - Mehmed Al Fatih", status: "1", point: "125", notes: "Siswa aktif dan berprestasi di bidang sains.", address: "Jl. Demang Lebar Daun No. 45, Palembang", skills: "Tahfidz Juz 30, Coding Scratch" },
  { id: "10", name: "Khadijah Azzahra", nis: "20260402", nip: null, email: "khadijah@gmail.com", appleid: "khadijah@appleid.com", gender: "P", kelas: "Kelas 4 - Mehmed Al Fatih", status: "1", point: "150", notes: "Hafidzah 3 juz, juara MHQ", address: "Jl. Jendral Sudirman KM 3.5, Palembang", skills: "Tahfidz Al-Qur'an, Tilawah" },
  { id: "11", name: "Aisha Zahra", nis: "20260403", nip: null, email: "aisha.zahra@gmail.com", appleid: "aisha@appleid.com", gender: "P", kelas: "Kelas 4 - Mehmed Al Fatih", status: "1", point: "95", notes: "Aktif dalam kegiatan sholat dhuha berjamaah.", address: "Komplek Pakri No. 12, Palembang", skills: "Public Speaking, Melukis Digital" },
  { id: "12", name: "Rayyan Al-Ghifari", nis: "20260404", nip: null, email: "rayyan@gmail.com", appleid: "rayyan@appleid.com", gender: "L", kelas: "Kelas 4 - Mehmed Al Fatih", status: "1", point: "85", notes: "Disiplin dan bertanggung jawab menjaga iPad kelas.", address: "Jl. Basuki Rahmat No. 88, Palembang", skills: "Robotika Dasar, Futsal" },
  { id: "13", name: "Zaynab Maryam", nis: "20260405", nip: null, email: "zaynab@gmail.com", appleid: "zaynab@appleid.com", gender: "P", kelas: "Kelas 4 - Mehmed Al Fatih", status: "1", point: "110", notes: "Rajin mengisi checklist sholat harian.", address: "Jl. Angkatan 45 Lorong Harapan, Palembang", skills: "Kaligrafi Arab, Bahasa Inggris" },
  { id: "14", name: "Ibrahim Hasan", nis: "20260406", nip: null, email: "ibrahim@gmail.com", appleid: "ibrahim@appleid.com", gender: "L", kelas: "Kelas 4 - Mehmed Al Fatih", status: "1", point: "70", notes: "Perlu perhatian dalam kehadiran sholat subuh.", address: "Jl. Kapten A. Rivai No. 10, Palembang", skills: "Panahan, Matematika Mencongak" },
  { id: "15", name: "Ahmad Danish", nis: "20260407", nip: null, email: "danish@gmail.com", appleid: "danish@appleid.com", gender: "L", kelas: "Kelas 4 - Mehmed Al Fatih", status: "1", point: "90", notes: "Cepat memahami materi pelajaran tematik.", address: "Jl. Veteran No. 24, Palembang", skills: "Sains Eksperimen, Renang" },
  { id: "16", name: "Nayla Putri Al-Habsyi", nis: "20260408", nip: null, email: "nayla@gmail.com", appleid: "nayla@appleid.com", gender: "P", kelas: "Kelas 4 - Mehmed Al Fatih", status: "0", point: "0", notes: "Pendaftar baru menanti verifikasi.", address: "Kenten Garden Blok B2, Palembang", skills: "Puisi Islami" },
];

export const MOCK_ANNOUNCEMENTS: MockAnnouncement[] = [
  {
    id: "1",
    from: "IT",
    title: "Kebijakan Penggunaan iPad & Panduan Restrict Code Semester Ganjil 2026/2027",
    file: null,
    pengumuman: "<p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p><p>Diberitahukan kepada seluruh wali kelas dan peserta didik bahwa <strong>kode restrict iPad</strong> telah diperbarui untuk menjamin keamanan pembelajaran digital di lingkungan SD Islam Al-Azhar Cairo Palembang. Harap memastikan iPad siswa terkonfigurasi dengan profil sekolah.</p>",
    like: "14",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "2",
    from: "Kelas 4 - Mehmed Al Fatih",
    title: "Pelaksanaan Sholat Dhuha Berjamaah & Pembiasaan Adab Harian",
    file: null,
    pengumuman: "<p>Ayah dan Bunda yang dirahmati Allah,</p><p>Mulai pekan ini, murid Kelas 4 Mehmed Al Fatih diwajibkan membawa sajadah dan perlengkapan sholat bersih untuk pembiasaan sholat Dhuha dan Dzuhur berjamaah di musholla sekolah. Mohon pantau checklist sholat harian ananda melalui SISFO.</p>",
    like: "9",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: "3",
    from: "IT",
    title: "Sosialisasi Fitur Baru Checklist Sholat & E-Absensi SISFO Al-Azhar",
    file: null,
    pengumuman: "<p>Bismillah, sistem informasi sekolah kini telah dilengkapi dengan fitur <strong>Checklist 6 Waktu Sholat</strong>, pemantauan poin reward karakter islami, dan rekap absensi digital terpadu.</p>",
    like: "22",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
  },
];

export const MOCK_EVENTS: MockEvent[] = [
  {
    id: "1",
    title: "Ujian Tengah Semester (UTS) Ganjil",
    kelas: "Semua Kelas",
    from: "admin",
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), 20),
    deskripsi: "Pelaksanaan evaluasi tengah semester 1 tahun pelajaran 2026/2027",
    backgroundColor: "#059669",
  },
  {
    id: "2",
    title: "Market Day & Kewirausahaan Cilik",
    kelas: "Kelas 4 - Mehmed Al Fatih",
    from: "Ustadz Ahmad, S.Pd",
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 24),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), 24),
    deskripsi: "Praktik berniaga islami dan infaq barokah murid kelas 4",
    backgroundColor: "#0284c7",
  },
  {
    id: "3",
    title: "Pemeriksaan iPad & Backup Edukasi",
    kelas: "Semua Kelas",
    from: "admin",
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 28),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), 28),
    deskripsi: "Pemeriksaan berkala restrict code dan sinkronisasi Apple ID",
    backgroundColor: "#d97706",
  },
];

export const MOCK_BEST_STUDENTS: MockBestStudent[] = [
  {
    id: "1",
    name: "Khadijah Azzahra",
    foto: null,
    kelas: "Kelas 4 - Mehmed Al Fatih",
    kategori: "Best Tahfidz & Akhlaqul Karimah",
    created_at: new Date(),
  },
  {
    id: "2",
    name: "Muhammad Fatih",
    foto: null,
    kelas: "Kelas 4 - Mehmed Al Fatih",
    kategori: "Best Academic & Digital Etiquette",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
  },
  {
    id: "3",
    name: "Aisha Zahra",
    foto: null,
    kelas: "Kelas 4 - Mehmed Al Fatih",
    kategori: "Best Discipline & Prayer Regularity",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
  },
];

export const MOCK_PRESTASI: MockPrestasi[] = [
  {
    id: "1",
    id_user: "10",
    nama: "Khadijah Azzahra",
    kelas: "Kelas 4 - Mehmed Al Fatih",
    fotoanak: "/images/trophy.png",
    prestasi: "Juara 1 Musabaqah Hifdzil Qur'an (MHQ) 3 Juz Tingkat Kota Palembang 2026",
    created_at: new Date(),
  },
  {
    id: "2",
    id_user: "2",
    nama: "Muhammad Fatih",
    kelas: "Kelas 4 - Mehmed Al Fatih",
    fotoanak: "/images/trophy.png",
    prestasi: "Medali Perak Olimpiade Sains Terpadu Al-Azhar Se-Indonesia",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
  },
];
