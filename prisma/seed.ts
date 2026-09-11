import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

function getPrisma() {
  const url = process.env.DATABASE_URL || "mysql://root:@localhost:3306/sisfo_alazhar";
  try {
    const parsed = new URL(url);
    const isLocal = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    const adapter = new PrismaMariaDb({
      host: parsed.hostname || "localhost",
      port: parsed.port ? parseInt(parsed.port, 10) : 3306,
      user: decodeURIComponent(parsed.username || "root"),
      password: decodeURIComponent(parsed.password || ""),
      database: parsed.pathname.replace(/^\//, "") || "sisfo_alazhar",
      connectionLimit: 10,
      ssl: isLocal ? undefined : { minVersion: "TLSv1.2", rejectUnauthorized: true },
    });
    return new PrismaClient({ adapter });
  } catch {
    const adapter = new PrismaMariaDb({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "",
      database: "sisfo_alazhar",
    });
    return new PrismaClient({ adapter });
  }
}

const prisma = getPrisma();

async function main() {
  console.log("=========================================");
  console.log("🌱 Memulai Seeding Database SISFO SDIA Cairo Palembang...");
  console.log("=========================================");

  // Pre-generate password hashes
  const hashAdmin = await bcrypt.hash("admin123", 10);
  const hashGuru = await bcrypt.hash("guru123", 10);
  const hashSiswa = await bcrypt.hash("siswa123", 10);

  // ---------------------------------------------------------------------------
  // 1. DATA KELAS (15 Rombongan Belajar Kelas 4, 5, 6)
  // ---------------------------------------------------------------------------
  console.log("\n📦 Menyiapkan data kelas...");
  const classesData = [
    { nama_kelas: "Kelas 4 - Mehmed Al Fatih", wali_kelas: "Ustadzah Fatimah, S.Pd", jumlah_siswa: "28", code_restrict: "2739" },
    { nama_kelas: "Kelas 4 - Sayfuddin Al Quthuz", wali_kelas: "Ustadz Ahmad, S.Pd.I", jumlah_siswa: "26", code_restrict: "2957" },
    { nama_kelas: "Kelas 4 - Sholahuddin Al Ayubi", wali_kelas: "Ustadzah Maryam, M.Pd", jumlah_siswa: "27", code_restrict: "3419" },
    { nama_kelas: "Kelas 4 - Sulaiman Al Qanuni", wali_kelas: "Ustadz Ibrahim, S.Pd", jumlah_siswa: "25", code_restrict: "3458" },
    { nama_kelas: "Kelas 4 - Mushab bin Umair", wali_kelas: "Ustadzah Aisyah, S.Pd", jumlah_siswa: "28", code_restrict: "2816" },

    { nama_kelas: "Kelas 5 - Al Bukhari", wali_kelas: "Ustadz Hasan, S.Pd", jumlah_siswa: "29", code_restrict: "9375, 1989" },
    { nama_kelas: "Kelas 5 - Muslim", wali_kelas: "Ustadzah Khadijah, S.Pd.I", jumlah_siswa: "28", code_restrict: "1890, 2371" },
    { nama_kelas: "Kelas 5 - Abu Daud", wali_kelas: "Ustadz Ridwan, S.Kom", jumlah_siswa: "27", code_restrict: "1690, 2560" },
    { nama_kelas: "Kelas 5 - Tirmidzi", wali_kelas: "Ustadzah Nurul, M.Pd", jumlah_siswa: "28", code_restrict: "1990, 7373" },
    { nama_kelas: "Kelas 5 - An Nasa'i", wali_kelas: "Ustadz Faisal, S.Pd", jumlah_siswa: "29", code_restrict: "1996, 2203" },

    { nama_kelas: "Kelas 6 - Tholhah bin Ubaidillah", wali_kelas: "Ustadz Mansyur, S.Pd", jumlah_siswa: "30", code_restrict: "6183" },
    { nama_kelas: "Kelas 6 - Anas bin Malik", wali_kelas: "Ustadzah Zahra, S.Pd", jumlah_siswa: "29", code_restrict: "6843" },
    { nama_kelas: "Kelas 6 - Jabir bin Abdillah", wali_kelas: "Ustadz Harun, S.Pd.I", jumlah_siswa: "28", code_restrict: "1204" },
    { nama_kelas: "Kelas 6 - Mu'adz bin Jabal", wali_kelas: "Ustadzah Salma, M.Pd", jumlah_siswa: "30", code_restrict: "4952" },
    { nama_kelas: "Kelas 6 - Urwah bin Zubair", wali_kelas: "Ustadz Yahya, S.Pd", jumlah_siswa: "28", code_restrict: "1972" },
  ];

  for (const c of classesData) {
    const existing = await prisma.kelas.findFirst({
      where: { nama_kelas: c.nama_kelas },
    });
    if (!existing) {
      await prisma.kelas.create({ data: c });
    }

    const existRestrict = await prisma.restrict.findFirst({
      where: { nama_kelas: c.nama_kelas },
    });
    if (!existRestrict) {
      await prisma.restrict.create({
        data: {
          nama_kelas: c.nama_kelas,
          code_restrict: c.code_restrict,
        },
      });
    }
  }
  console.log(`✅ ${classesData.length} kelas berhasil disiapkan.`);

  // ---------------------------------------------------------------------------
  // 2. DATA ADMINISTRATOR
  // ---------------------------------------------------------------------------
  console.log("\n👤 Menyiapkan data Administrator...");
  await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {
      password: hashAdmin,
      password1: "admin123",
      status: "3",
    },
    create: {
      name: "Administrator SDIA",
      email: "admin@gmail.com",
      password: hashAdmin,
      password1: "admin123",
      status: "3", // Admin
      gender: "L",
      notes: "Akun Super Administrator",
    },
  });
  console.log("✅ Administrator disiapkan (email: admin@gmail.com, password: admin123).");

  // ---------------------------------------------------------------------------
  // 3. DATA GURU (Wali Kelas & Guru Mata Pelajaran)
  // ---------------------------------------------------------------------------
  console.log("\n👨‍🏫 Menyiapkan data Guru...");
  const teachersData = [
    // 1. Akun Demo Utama Guru
    {
      name: "Ustadzah Fatimah, S.Pd",
      email: "guru@gmail.com",
      password: hashGuru,
      password1: "guru123",
      status: "4", // Guru + Wali Kelas
      gender: "P",
      nip: "198501152010012001",
      guru_bidang: "Pendidikan Agama Islam & Budi Pekerti",
      kelas: "Kelas 4 - Mehmed Al Fatih",
      appleid: "fatimah.cairo@icloud.com",
      passwordappleid: "AppleGuru123!",
      address: "Jl. Kolonel H. Barlian KM 6.5, Palembang",
      notes: "Wali Kelas 4 Mehmed Al Fatih",
    },
    // Wali Kelas Kelas 4
    {
      name: "Ustadz Ahmad, S.Pd.I",
      email: "ahmad.guru@alazhar.sch.id",
      password: hashGuru,
      password1: "guru123",
      status: "4",
      gender: "L",
      nip: "198603202011011002",
      guru_bidang: "Bahasa Arab",
      kelas: "Kelas 4 - Sayfuddin Al Quthuz",
      appleid: "ahmad.cairo@icloud.com",
      passwordappleid: "AppleGuru123!",
      address: "Jl. Demang Lebar Daun No. 28, Palembang",
      notes: "Wali Kelas 4 Sayfuddin Al Quthuz",
    },
    {
      name: "Ustadzah Maryam, M.Pd",
      email: "maryam.guru@alazhar.sch.id",
      password: hashGuru,
      password1: "guru123",
      status: "4",
      gender: "P",
      nip: "198807122012022003",
      guru_bidang: "Matematika",
      kelas: "Kelas 4 - Sholahuddin Al Ayubi",
      appleid: "maryam.cairo@icloud.com",
      passwordappleid: "AppleGuru123!",
      address: "Jl. Mayor Ruslan No. 15, Palembang",
      notes: "Wali Kelas 4 Sholahuddin Al Ayubi",
    },
    {
      name: "Ustadz Ibrahim, S.Pd",
      email: "ibrahim.guru@alazhar.sch.id",
      password: hashGuru,
      password1: "guru123",
      status: "4",
      gender: "L",
      nip: "198409052009011004",
      guru_bidang: "Tematik & IPA",
      kelas: "Kelas 4 - Sulaiman Al Qanuni",
      appleid: "ibrahim.cairo@icloud.com",
      passwordappleid: "AppleGuru123!",
      address: "Jl. Jenderal Ahmad Yani No. 12, Palembang",
      notes: "Wali Kelas 4 Sulaiman Al Qanuni",
    },
    {
      name: "Ustadzah Aisyah, S.Pd",
      email: "aisyah.guru@alazhar.sch.id",
      password: hashGuru,
      password1: "guru123",
      status: "4",
      gender: "P",
      nip: "199011232014022005",
      guru_bidang: "Bahasa Inggris",
      kelas: "Kelas 4 - Mushab bin Umair",
      appleid: "aisyah.cairo@icloud.com",
      passwordappleid: "AppleGuru123!",
      address: "Jl. Angkatan 45 No. 88, Palembang",
      notes: "Wali Kelas 4 Mushab bin Umair",
    },

    // Wali Kelas Kelas 5
    {
      name: "Ustadz Hasan, S.Pd",
      email: "hasan.guru@alazhar.sch.id",
      password: hashGuru,
      password1: "guru123",
      status: "4",
      gender: "L",
      nip: "198705182011011006",
      guru_bidang: "Al-Qur'an & Tahfidz",
      kelas: "Kelas 5 - Al Bukhari",
      appleid: "hasan.cairo@icloud.com",
      passwordappleid: "AppleGuru123!",
      address: "Jl. R. Soekamto No. 42, Palembang",
      notes: "Wali Kelas 5 Al Bukhari",
    },
    {
      name: "Ustadzah Khadijah, S.Pd.I",
      email: "khadijah.guru@alazhar.sch.id",
      password: hashGuru,
      password1: "guru123",
      status: "4",
      gender: "P",
      nip: "198902142013022007",
      guru_bidang: "Akidah Akhlak & Fiqih",
      kelas: "Kelas 5 - Muslim",
      appleid: "khadijah.cairo@icloud.com",
      passwordappleid: "AppleGuru123!",
      address: "Jl. Basuki Rahmat No. 70, Palembang",
      notes: "Wali Kelas 5 Muslim",
    },
    {
      name: "Ustadz Ridwan, S.Kom",
      email: "ridwan.guru@alazhar.sch.id",
      password: hashGuru,
      password1: "guru123",
      status: "4",
      gender: "L",
      nip: "199104082015011008",
      guru_bidang: "Informatika & Robotika",
      kelas: "Kelas 5 - Abu Daud",
      appleid: "ridwan.cairo@icloud.com",
      passwordappleid: "AppleGuru123!",
      address: "Jl. Veteran No. 34, Palembang",
      notes: "Wali Kelas 5 Abu Daud",
    },
    {
      name: "Ustadzah Nurul, M.Pd",
      email: "nurul.guru@alazhar.sch.id",
      password: hashGuru,
      password1: "guru123",
      status: "4",
      gender: "P",
      nip: "198806252012022009",
      guru_bidang: "Ilmu Pengetahuan Alam (IPA)",
      kelas: "Kelas 5 - Tirmidzi",
      appleid: "nurul.cairo@icloud.com",
      passwordappleid: "AppleGuru123!",
      address: "Jl. Kapten A. Rivai No. 19, Palembang",
      notes: "Wali Kelas 5 Tirmidzi",
    },
    {
      name: "Ustadz Faisal, S.Pd",
      email: "faisal.guru@alazhar.sch.id",
      password: hashGuru,
      password1: "guru123",
      status: "4",
      gender: "L",
      nip: "199208102016011010",
      guru_bidang: "PJOK (Pendidikan Jasmani)",
      kelas: "Kelas 5 - An Nasa'i",
      appleid: "faisal.cairo@icloud.com",
      passwordappleid: "AppleGuru123!",
      address: "Jl. Residen H. Abdul Rozak, Palembang",
      notes: "Wali Kelas 5 An Nasa'i",
    },

    // Wali Kelas Kelas 6
    {
      name: "Ustadz Mansyur, S.Pd",
      email: "mansyur.guru@alazhar.sch.id",
      password: hashGuru,
      password1: "guru123",
      status: "4",
      gender: "L",
      nip: "198301302008011011",
      guru_bidang: "Bahasa Indonesia",
      kelas: "Kelas 6 - Tholhah bin Ubaidillah",
      appleid: "mansyur.cairo@icloud.com",
      passwordappleid: "AppleGuru123!",
      address: "Jl. Sudirman No. 120, Palembang",
      notes: "Wali Kelas 6 Tholhah bin Ubaidillah",
    },
    {
      name: "Ustadzah Zahra, S.Pd",
      email: "zahra.guru@alazhar.sch.id",
      password: hashGuru,
      password1: "guru123",
      status: "4",
      gender: "P",
      nip: "199003152014022012",
      guru_bidang: "Matematika Tingkat Lanjut",
      kelas: "Kelas 6 - Anas bin Malik",
      appleid: "zahra.cairo@icloud.com",
      passwordappleid: "AppleGuru123!",
      address: "Jl. MP. Mangkunegara No. 8, Palembang",
      notes: "Wali Kelas 6 Anas bin Malik",
    },
    {
      name: "Ustadz Harun, S.Pd.I",
      email: "harun.guru@alazhar.sch.id",
      password: hashGuru,
      password1: "guru123",
      status: "4",
      gender: "L",
      nip: "198612012010011013",
      guru_bidang: "Sejarah Kebudayaan Islam (SKI)",
      kelas: "Kelas 6 - Jabir bin Abdillah",
      appleid: "harun.cairo@icloud.com",
      passwordappleid: "AppleGuru123!",
      address: "Jl. Srijaya Negara, Bukit Besar, Palembang",
      notes: "Wali Kelas 6 Jabir bin Abdillah",
    },
    {
      name: "Ustadzah Salma, M.Pd",
      email: "salma.guru@alazhar.sch.id",
      password: hashGuru,
      password1: "guru123",
      status: "4",
      gender: "P",
      nip: "198710202011022014",
      guru_bidang: "Seni Budaya & Prakarya (SBdP)",
      kelas: "Kelas 6 - Mu'adz bin Jabal",
      appleid: "salma.cairo@icloud.com",
      passwordappleid: "AppleGuru123!",
      address: "Jl. Letnan Murod No. 55, Palembang",
      notes: "Wali Kelas 6 Mu'adz bin Jabal",
    },
    {
      name: "Ustadz Yahya, S.Pd",
      email: "yahya.guru@alazhar.sch.id",
      password: hashGuru,
      password1: "guru123",
      status: "4",
      gender: "L",
      nip: "198509122009011015",
      guru_bidang: "Pendidikan Pancasila / PKn",
      kelas: "Kelas 6 - Urwah bin Zubair",
      appleid: "yahya.cairo@icloud.com",
      passwordappleid: "AppleGuru123!",
      address: "Jl. Radial No. 24, Palembang",
      notes: "Wali Kelas 6 Urwah bin Zubair",
    },

    // Guru Mata Pelajaran (Non-Wali Kelas)
    {
      name: "Ustadz Hendra Kurniawan, S.Pd",
      email: "hendra.guru@alazhar.sch.id",
      password: hashGuru,
      password1: "guru123",
      status: "2", // Guru Mata Pelajaran
      gender: "L",
      nip: "199304152017011016",
      guru_bidang: "Tahsin & Tahfidz Al-Qur'an",
      kelas: "Kelas 4 - Mehmed Al Fatih",
      appleid: "hendra.cairo@icloud.com",
      passwordappleid: "AppleGuru123!",
      address: "Jl. Sukabangun II No. 17, Palembang",
      notes: "Guru Spesialis Tahsin dan Tahfidz",
    },
    {
      name: "Ustadzah Dewi Sartika, S.Pd",
      email: "dewi.guru@alazhar.sch.id",
      password: hashGuru,
      password1: "guru123",
      status: "2", // Guru Mata Pelajaran
      gender: "P",
      nip: "199408222018022017",
      guru_bidang: "English for Cambridge Curriculum",
      kelas: "Kelas 5 - Al Bukhari",
      appleid: "dewi.cairo@icloud.com",
      passwordappleid: "AppleGuru123!",
      address: "Jl. Kebun Bunga No. 63, Palembang",
      notes: "Guru Native English Language",
    },
  ];

  for (const t of teachersData) {
    await prisma.user.upsert({
      where: { email: t.email },
      update: {
        name: t.name,
        nip: t.nip,
        guru_bidang: t.guru_bidang,
        gender: t.gender,
        kelas: t.kelas,
        status: t.status,
        password: t.password,
        password1: t.password1,
        appleid: t.appleid,
        passwordappleid: t.passwordappleid,
        address: t.address,
        notes: t.notes,
      },
      create: t,
    });
  }
  console.log(`✅ ${teachersData.length} data Guru berhasil disiapkan (password default: guru123).`);

  // ---------------------------------------------------------------------------
  // 4. DATA SISWA (Terdistribusi di Berbagai Kelas)
  // ---------------------------------------------------------------------------
  console.log("\n🎓 Menyiapkan data Siswa...");
  const studentsData = [
    // --- Kelas 4 - Mehmed Al Fatih (Kelas Utama Ustadzah Fatimah) ---
    {
      name: "Muhammad Rayhan Al-Fatih",
      email: "siswa@gmail.com", // Akun Demo Utama Siswa
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "L",
      nis: "202404001",
      kelas: "Kelas 4 - Mehmed Al Fatih",
      appleid: "rayhan.alfatih@icloud.com",
      passwordappleid: "AppleRayhan123!",
      point: "95",
      address: "Jl. Jenderal Sudirman No. 45, Palembang",
      skills: "Tahfidz Juz 30, Robotika, Sains",
      notes: "Siswa berprestasi dalam sains dan tahfidz.",
    },
    {
      name: "Khalid bin Walid Al-Ghazi",
      email: "khalid.ghazi@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "L",
      nis: "202404002",
      kelas: "Kelas 4 - Mehmed Al Fatih",
      appleid: "khalid.ghazi@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "88",
      address: "Jl. Basuki Rahmat No. 12, Palembang",
      skills: "Panahan, Futsal, Tartil",
      notes: "Aktif dalam kegiatan olahraga sekolah.",
    },
    {
      name: "Zahra Amira Salsabila",
      email: "zahra.salsabila@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "P",
      nis: "202404003",
      kelas: "Kelas 4 - Mehmed Al Fatih",
      appleid: "zahra.amira@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "92",
      address: "Jl. Kolonel H. Barlian No. 33, Palembang",
      skills: "Pidato Bahasa Inggris, Kaligrafi, Matematika",
      notes: "Juara lomba pidato bahasa Inggris tingkat kota.",
    },
    {
      name: "Umar Al-Faruq Pratama",
      email: "umar.pratama@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "L",
      nis: "202404004",
      kelas: "Kelas 4 - Mehmed Al Fatih",
      appleid: "umar.faruq@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "78",
      address: "Jl. R. Soekamto No. 5B, Palembang",
      skills: "Catur, Coding Scratch, Tahfidz",
      notes: "Minat tinggi di bidang logika dan IT.",
    },
    {
      name: "Naira Syakira Azzahra",
      email: "naira.azzahra@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "P",
      nis: "202404005",
      kelas: "Kelas 4 - Mehmed Al Fatih",
      appleid: "naira.syakira@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "85",
      address: "Jl. Demang Lebar Daun No. 71, Palembang",
      skills: "Menggambar Digital iPad, Tilawah",
      notes: "Kreatif dan rajin mengumpulkan tugas.",
    },
    {
      name: "Kenzie Arkan Atharizz",
      email: "kenzie.atharizz@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "L",
      nis: "202404006",
      kelas: "Kelas 4 - Mehmed Al Fatih",
      appleid: "kenzie.arkan@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "82",
      address: "Jl. Veteran No. 89, Palembang",
      skills: "Taekwondo, Matematika Cepat",
      notes: "Disiplin dan bertanggung jawab.",
    },
    {
      name: "Siti Fatimah Azzahra",
      email: "fatimah.siti@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "P",
      nis: "202404007",
      kelas: "Kelas 4 - Mehmed Al Fatih",
      appleid: "fatimah.siti@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "90",
      address: "Jl. Mayor Ruslan No. 20, Palembang",
      skills: "Tahfidz Juz 29-30, Menulis Puisi",
      notes: "Bakat sastra dan hafalan yang kuat.",
    },
    {
      name: "Abdullah Faqih Al-Anshori",
      email: "abdullah.faqih@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "L",
      nis: "202404008",
      kelas: "Kelas 4 - Mehmed Al Fatih",
      appleid: "abdullah.faqih@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "84",
      address: "Jl. Angkatan 45 No. 14, Palembang",
      skills: "Adzan, Tilawah Al-Qur'an",
      notes: "Sering menjadi muadzin saat sholat berjamaah.",
    },

    // --- Kelas 4 - Sayfuddin Al Quthuz ---
    {
      name: "Hamzah Asadullah Al-Qudsi",
      email: "hamzah.asad@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "L",
      nis: "202404011",
      kelas: "Kelas 4 - Sayfuddin Al Quthuz",
      appleid: "hamzah.asad@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "86",
      address: "Jl. Sumpah Pemuda No. 10, Palembang",
      skills: "Berenang, Pencak Silat, Tahfidz",
      notes: "Fisik tangguh dan berjiwa kepemimpinan.",
    },
    {
      name: "Alyssa Khansa Nabila",
      email: "alyssa.nabila@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "P",
      nis: "202404012",
      kelas: "Kelas 4 - Sayfuddin Al Quthuz",
      appleid: "alyssa.khansa@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "94",
      address: "Jl. POM IX No. 23, Palembang",
      skills: "Olimpiade Sains, Bahasa Inggris",
      notes: "Peringkat 1 paralel kelas 4 semester lalu.",
    },
    {
      name: "Bilal Al-Habasyi Putra",
      email: "bilal.putra@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "L",
      nis: "202404013",
      kelas: "Kelas 4 - Sayfuddin Al Quthuz",
      appleid: "bilal.putra@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "79",
      address: "Jl. Srijaya Negara No. 4, Palembang",
      skills: "Pramuka, Drum Band",
      notes: "Suka bekerjasama dalam tim.",
    },
    {
      name: "Yasmin Safira Ramadhani",
      email: "yasmin.safira@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "P",
      nis: "202404014",
      kelas: "Kelas 4 - Sayfuddin Al Quthuz",
      appleid: "yasmin.safira@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "89",
      address: "Jl. Kapten Cek Syeh No. 31, Palembang",
      skills: "Story Telling, Desain Poster",
      notes: "Pandai bercerita kisah-kisah teladan sahabat nabi.",
    },

    // --- Kelas 4 - Sholahuddin Al Ayubi ---
    {
      name: "Thariq Ziyad Ramadhan",
      email: "thariq.ramadhan@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "L",
      nis: "202404021",
      kelas: "Kelas 4 - Sholahuddin Al Ayubi",
      appleid: "thariq.ziyad@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "87",
      address: "Jl. Radial No. 78, Palembang",
      skills: "Pencak Silat, Tahsin",
      notes: "Sopan dan tekun dalam beribadah.",
    },
    {
      name: "Syifa Nur Marwah",
      email: "syifa.marwah@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "P",
      nis: "202404022",
      kelas: "Kelas 4 - Sholahuddin Al Ayubi",
      appleid: "syifa.marwah@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "91",
      address: "Jl. Ariodillah No. 16, Palembang",
      skills: "Pildacil, Menulis Cerpen",
      notes: "Komunikatif dan percaya diri tinggi.",
    },

    // --- Kelas 5 - Al Bukhari ---
    {
      name: "Hafidz Al-Hasan Ar-Rasyid",
      email: "hafidz.alhasan@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "L",
      nis: "202305001",
      kelas: "Kelas 5 - Al Bukhari",
      appleid: "hafidz.hasan@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "98",
      address: "Jl. MP Mangkunegara No. 90, Palembang",
      skills: "Tahfidz 3 Juz (28, 29, 30), Hadits Arbain",
      notes: "Kandidat Best Student teladan tahun ajaran ini.",
    },
    {
      name: "Annisa Lathifah Zahir",
      email: "annisa.zahir@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "P",
      nis: "202305002",
      kelas: "Kelas 5 - Al Bukhari",
      appleid: "annisa.zahir@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "96",
      address: "Jl. Sukabangun I No. 45, Palembang",
      skills: "Olimpiade Matematika, Kaligrafi Khot Naskhi",
      notes: "Sangat teliti dan disiplin dalam pengerjaan tugas.",
    },
    {
      name: "Dzaki Arsyad Maulana",
      email: "dzaki.maulana@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "L",
      nis: "202305003",
      kelas: "Kelas 5 - Al Bukhari",
      appleid: "dzaki.arsyad@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "83",
      address: "Jl. Swadaya No. 12, Pakjo, Palembang",
      skills: "Robotik Arduino, Coding Python dasar",
      notes: "Juara festival teknologi anak tingkat provinsi.",
    },
    {
      name: "Nayla Azkadina Rania",
      email: "nayla.azkadina@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "P",
      nis: "202305004",
      kelas: "Kelas 5 - Al Bukhari",
      appleid: "nayla.azkadina@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "89",
      address: "Jl. Tanjung Siapi-api KM 9, Palembang",
      skills: "Bahasa Arab, Puisi Islami",
      notes: "Fasih berbahasa Arab percakapan sehari-hari.",
    },

    // --- Kelas 5 - Muslim ---
    {
      name: "Ali Murtadha Syahputra",
      email: "ali.syahputra@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "L",
      nis: "202305011",
      kelas: "Kelas 5 - Muslim",
      appleid: "ali.murtadha@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "82",
      address: "Jl. Pangeran Antasari No. 67, Palembang",
      skills: "Futsal, Tahsin",
      notes: "Kapten tim futsal SDIA Cairo.",
    },
    {
      name: "Maryam Qonitah Al-Hafidzah",
      email: "maryam.qonitah@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "P",
      nis: "202305012",
      kelas: "Kelas 5 - Muslim",
      appleid: "maryam.qonitah@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "93",
      address: "Jl. Kapten Cek Syeh No. 51, Palembang",
      skills: "Tahfidz Juz 29 & 30, Bahasa Inggris",
      notes: "Berakhlak mulia dan rajin sholat tepat waktu.",
    },

    // --- Kelas 5 - Abu Daud ---
    {
      name: "Fathir Ar-Rasyid Siregar",
      email: "fathir.arrasyid@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "L",
      nis: "202305021",
      kelas: "Kelas 5 - Abu Daud",
      appleid: "fathir.arrasyid@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "85",
      address: "Jl. Seduduk Putih No. 19, Palembang",
      skills: "Karya Ilmiah Remaja, Desain 3D",
      notes: "Suka mengeksplorasi eksperimen sains.",
    },
    {
      name: "Nadia Humaira Firdaus",
      email: "nadia.firdaus@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "P",
      nis: "202305022",
      kelas: "Kelas 5 - Abu Daud",
      appleid: "nadia.firdaus@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "90",
      address: "Jl. Bambang Utoyo No. 38, Palembang",
      skills: "Tilawatil Qur'an, Nasyid",
      notes: "Vokal merdu dan tartil membaca Al-Qur'an.",
    },

    // --- Kelas 6 - Tholhah bin Ubaidillah ---
    {
      name: "Ahmad Mujahid Fisabilillah",
      email: "ahmad.mujahid@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "L",
      nis: "202206001",
      kelas: "Kelas 6 - Tholhah bin Ubaidillah",
      appleid: "ahmad.mujahid@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "100",
      address: "Jl. Veteran Komp. Al-Azhar No. 1, Palembang",
      skills: "Ketua OSIS, Tahfidz 4 Juz, Pidato 3 Bahasa",
      notes: "Ketua murid teladan teladan utama SD Al-Azhar Cairo.",
    },
    {
      name: "Yasmin Mumtazah Zahirah",
      email: "yasmin.mumtazah@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "P",
      nis: "202206002",
      kelas: "Kelas 6 - Tholhah bin Ubaidillah",
      appleid: "yasmin.mumtazah@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "97",
      address: "Jl. Jenderal Sudirman KM 3.5, Palembang",
      skills: "Olimpiade IPA Nasional, Debat Bahasa Inggris",
      notes: "Meraih medali perak olimpiade sains nasional.",
    },
    {
      name: "Fakhri Azzam Khairy",
      email: "fakhri.khairy@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "L",
      nis: "202206003",
      kelas: "Kelas 6 - Tholhah bin Ubaidillah",
      appleid: "fakhri.khairy@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "88",
      address: "Jl. Musi II Komp. Poligon, Palembang",
      skills: "Bulu Tangkis, Robotika LEGO",
      notes: "Siswa berprestasi di bidang olahraga dan robotik.",
    },
    {
      name: "Salma Haura Insyirah",
      email: "salma.insyirah@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "P",
      nis: "202206004",
      kelas: "Kelas 6 - Tholhah bin Ubaidillah",
      appleid: "salma.haura@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "92",
      address: "Jl. Demang Lebar Daun No. 99, Palembang",
      skills: "Tahfidz Juz 30 & 29, Kaligrafi",
      notes: "Karya kaligrafinya terpajang di galeri sekolah.",
    },

    // --- Kelas 6 - Anas bin Malik ---
    {
      name: "Revan Al-Farizi Nugraha",
      email: "revan.alfarizi@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "L",
      nis: "202206011",
      kelas: "Kelas 6 - Anas bin Malik",
      appleid: "revan.alfarizi@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "81",
      address: "Jl. Basuki Rahmat No. 110, Palembang",
      skills: "Fotografi Sekolah, Editor Video",
      notes: "Membantu dokumentasi berbagai kegiatan sekolah.",
    },
    {
      name: "Keisha Almeera Putri",
      email: "keisha.almeera@siswa.alazhar.sch.id",
      password: hashSiswa,
      password1: "siswa123",
      status: "1",
      gender: "P",
      nis: "202206012",
      kelas: "Kelas 6 - Anas bin Malik",
      appleid: "keisha.almeera@icloud.com",
      passwordappleid: "AppleSiswa123!",
      point: "89",
      address: "Jl. Kapten Marzuki No. 44, Palembang",
      skills: "Matematika Nalaria Realistik, Menggambar",
      notes: "Rajin dan memiliki kemampuan analitis yang tajam.",
    },
  ];

  for (const s of studentsData) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {
        name: s.name,
        nis: s.nis,
        gender: s.gender,
        kelas: s.kelas,
        status: s.status,
        point: s.point,
        skills: s.skills,
        notes: s.notes,
        password: s.password,
        password1: s.password1,
        appleid: s.appleid,
        passwordappleid: s.passwordappleid,
        address: s.address,
      },
      create: s,
    });
  }
  console.log(`✅ ${studentsData.length} data Siswa berhasil disiapkan (password default: siswa123).`);

  // ---------------------------------------------------------------------------
  // 5. TAHUN AJAR
  // ---------------------------------------------------------------------------
  console.log("\n📅 Menyiapkan Tahun Pelajaran...");
  const existTahun = await prisma.tahunAjar.findFirst({
    where: { tahun: "2026/2027", semester: "Semester 1" },
  });
  if (!existTahun) {
    await prisma.tahunAjar.create({
      data: {
        tahun: "2026/2027",
        semester: "Semester 1",
      },
    });
  }
  console.log("✅ Tahun Pelajaran 2026/2027 Semester 1 disiapkan.");

  // ---------------------------------------------------------------------------
  // 6. PENGUMUMAN SEKOLAH
  // ---------------------------------------------------------------------------
  console.log("\n📢 Menyiapkan Pengumuman Sekolah...");
  const existAnnouncement = await prisma.pengumuman.findFirst({
    where: { title: "Selamat Datang di SISFO SDIA Cairo Palembang v2.0" },
  });
  if (!existAnnouncement) {
    await prisma.pengumuman.create({
      data: {
        from: "IT Al-Azhar",
        title: "Selamat Datang di SISFO SDIA Cairo Palembang v2.0",
        pengumuman: "<p>Alhamdulillah, Sistem Informasi Sekolah (SISFO) SD Islam Al-Azhar Cairo Palembang telah diperbarui ke versi modern. Seluruh civitas akademika dapat memantau kegiatan, absensi, checklist ibadah sholat, dan reward siswa dengan lebih mudah dan cepat.</p><p>Barakallahu fiikum.</p>",
        like: "25",
      },
    });
  }

  const existTahfidz = await prisma.pengumuman.findFirst({
    where: { title: "Jadwal Ujian Tasmi' & Tahfidz Al-Qur'an Semester Ganjil" },
  });
  if (!existTahfidz) {
    await prisma.pengumuman.create({
      data: {
        from: "Koordinator Keagamaan",
        title: "Jadwal Ujian Tasmi' & Tahfidz Al-Qur'an Semester Ganjil",
        pengumuman: "<p>Diberitahukan kepada seluruh Ananda kelas 4, 5, dan 6 bahwa Ujian Tasmi' Al-Qur'an Juz 30, 29, dan 28 akan dilaksanakan mulai pekan depan. Mohon Ayah/Bunda senantiasa memantau mutaba'ah sholat dan muroja'ah di rumah.</p>",
        like: "18",
      },
    });
  }
  console.log("✅ Pengumuman sekolah disiapkan.");

  // ---------------------------------------------------------------------------
  // 7. DATA SAMPLE CHECKLIST SHOLAT UNTUK SISWA
  // ---------------------------------------------------------------------------
  console.log("\n🕌 Menyiapkan sampel Checklist Sholat Siswa...");
  const studentUser = await prisma.user.findUnique({
    where: { email: "siswa@gmail.com" },
  });

  if (studentUser) {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const studentIdInt = Number(studentUser.id);

    await prisma.prayer.upsert({
      where: {
        id_date: {
          id: studentIdInt,
          date: todayStr,
        },
      },
      update: {
        subuh: "1",
        dhuha: "1",
        dzuhur: "1",
        ashar: "1",
        maghrib: "1",
        isya: "1",
        verified_otm: "verified",
        verified_guru: "verified",
      },
      create: {
        id: studentIdInt,
        date: todayStr,
        subuh: "1",
        dhuha: "1",
        dzuhur: "1",
        ashar: "1",
        maghrib: "1",
        isya: "1",
        verified_otm: "verified",
        verified_guru: "verified",
      },
    });
    console.log(`✅ Sample checklist sholat hari ini disiapkan untuk ${studentUser.name}.`);
  }

  console.log("\n=========================================");
  console.log("🎉 Seeding Database Selesai dengan Sukses!");
  console.log("=========================================");
  console.log("Akun Demo yang Siap Digunakan:");
  console.log("👑 Admin  : admin@gmail.com / admin123");
  console.log("👨‍🏫 Guru   : guru@gmail.com / guru123 (Ustadzah Fatimah - Wali Kelas 4 Mehmed Al Fatih)");
  console.log("🎓 Siswa  : siswa@gmail.com / siswa123 (Muhammad Rayhan - Kelas 4 Mehmed Al Fatih)");
  console.log(`Total Guru Ditambahkan  : ${teachersData.length}`);
  console.log(`Total Siswa Ditambahkan : ${studentsData.length}`);
  console.log("=========================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeder error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
