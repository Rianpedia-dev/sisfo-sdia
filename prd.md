# PRD – Sistem Informasi Sekolah (SISFO) SD Islam Al-Azhar Cairo Palembang

> **Versi:** 2.0 (Rebuild) testing aja 
> **Tanggal:** 10 September 2026
> **Deskripsi:** Dokumen ini adalah Product Requirements Document lengkap untuk membangun ulang Sisfo Al-Azhar menggunakan stack modern: **Next.js (App Router) + Tailwind CSS + shadcn/ui + MySQL (Prisma ORM)**.
> Dokumen disusun berdasarkan reverse-engineering menyeluruh dari project Laravel 8 yang sudah berjalan.

---

## Daftar Isi

1. [Ringkasan Proyek](#1-ringkasan-proyek)
2. [Tujuan & Latar Belakang](#2-tujuan--latar-belakang)
3. [Tech Stack](#3-tech-stack)
4. [Arsitektur Sistem](#4-arsitektur-sistem)
5. [Role & Hak Akses (RBAC)](#5-role--hak-akses-rbac)
6. [Skema Database Lengkap](#6-skema-database-lengkap)
7. [Modul & Fitur Detail per Role](#7-modul--fitur-detail-per-role)
8. [Daftar Halaman & Routing](#8-daftar-halaman--routing)
9. [API Routes (Server Actions / Route Handlers)](#9-api-routes-server-actions--route-handlers)
10. [Integrasi Eksternal](#10-integrasi-eksternal)
11. [UI/UX Guidelines](#11-uiux-guidelines)
12. [Seeder & Data Awal](#12-seeder--data-awal)
13. [File Upload & Storage](#13-file-upload--storage)
14. [PDF Export](#14-pdf-export)
15. [Excel Import](#15-excel-import)
16. [Non-Functional Requirements](#16-non-functional-requirements)
17. [Status Kode User](#17-status-kode-user)
18. [Kalender Akademik (Tahun Pelajaran & Semester)](#18-kalender-akademik-tahun-pelajaran--semester)
19. [Catatan Migrasi dari Laravel](#19-catatan-migrasi-dari-laravel)

---

## 1. Ringkasan Proyek

**SISFO SDIA Cairo** adalah Sistem Informasi Sekolah untuk **SD Islam Al-Azhar Cairo Palembang** yang digunakan untuk mengelola data siswa, guru, absensi, pengumuman, checklist sholat, pelanggaran, keterlambatan, prestasi, poin siswa, best student, kalender kegiatan, dan iPad restrict code.

Sistem ini memiliki **3 role utama**: Admin, Guru (Wali Kelas), dan Siswa.

Sistem yang saat ini berjalan dibangun menggunakan **Laravel 8** dengan template AdminLTE 3 dan akan dibangun ulang menggunakan stack modern.

---

## 2. Tujuan & Latar Belakang

### Latar Belakang
- Sistem lama menggunakan Laravel 8 (PHP) dengan UI berbasis AdminLTE (server-side rendering).
- Membutuhkan modernisasi ke arsitektur yang lebih scalable, performa lebih baik, dan developer experience yang lebih baik.

### Tujuan Rebuild
1. Migrasi ke **full-stack JavaScript/TypeScript** (Next.js).
2. UI modern, responsif, dan premium menggunakan **Tailwind CSS + shadcn/ui**.
3. Mempertahankan **100% fitur** yang sudah ada di sistem lama.
4. Menambahkan fondasi untuk fitur-fitur baru di masa depan.
5. Tetap menggunakan **MySQL** sebagai database (kompatibel dengan data lama).

---

## 3. Tech Stack

| Layer         | Teknologi                                     |
|---------------|-----------------------------------------------|
| Framework     | **Next.js 15** (App Router, Server Components) |
| Bahasa        | **TypeScript**                                 |
| Styling       | **Tailwind CSS v4**                            |
| UI Components | **shadcn/ui**                                  |
| Database      | **MySQL 8** (via XAMPP atau standalone)         |
| ORM           | **Prisma**                                     |
| Authentication| **NextAuth.js v5** (Credentials Provider)      |
| Authorization | Custom RBAC middleware                         |
| State Mgmt    | React Server Components + `nuqs` (URL state)   |
| Forms         | **React Hook Form + Zod** validation           |
| Tables        | **@tanstack/react-table** + shadcn DataTable   |
| Calendar      | **FullCalendar React**                         |
| Rich Editor   | **TipTap** atau **CKEditor 5 React**           |
| PDF Export    | **@react-pdf/renderer** atau **jsPDF**         |
| Excel Import  | **xlsx (SheetJS)**                             |
| File Upload   | **uploadthing** atau custom multer             |
| Icons         | **Lucide React**                               |
| Notifications | **sonner** (toast) / **sweetalert2**           |
| Charts        | **recharts** (opsional, untuk dashboard stats) |

---

## 4. Arsitektur Sistem

```
Next.js App Router
├── Client Components (Interactive UI)
├── Server Components (Data Fetching, Layout)
├── Server Actions / API Route Handlers
├── Prisma ORM
└── MySQL Database (sisfo_alazhar)
```

### Struktur Folder Proyek

```
sisfo-alazhar-next/
├── prisma/
│   ├── schema.prisma          # Skema database
│   └── seed.ts                # Seeder data awal
├── public/
│   └── images/                # Logo sekolah, assets statis
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx                    # Dashboard Admin
│   │   │   │   ├── students/page.tsx           # Kelola Akun Siswa
│   │   │   │   ├── students/[id]/page.tsx      # Detail / Edit Siswa
│   │   │   │   ├── teachers/page.tsx           # Kelola Akun Guru
│   │   │   │   ├── teachers/[id]/page.tsx      # Detail / Edit Guru
│   │   │   │   ├── classes/page.tsx            # Kelola Kelas
│   │   │   │   ├── classes/[id]/page.tsx       # Detail Kelas
│   │   │   │   ├── announcements/page.tsx      # Pengumuman (Create)
│   │   │   │   ├── announcements/[id]/page.tsx # Edit Pengumuman
│   │   │   │   └── calendar/page.tsx           # Kalender Kegiatan
│   │   │   ├── guru/
│   │   │   │   ├── page.tsx                    # Dashboard Guru
│   │   │   │   ├── profile/page.tsx            # Profil Saya
│   │   │   │   ├── my-class/page.tsx           # Kelas Saya
│   │   │   │   ├── my-class/[id]/page.tsx      # Detail Siswa
│   │   │   │   ├── attendance/page.tsx         # Absen Kelas (Kalender)
│   │   │   │   ├── attendance/[date]/page.tsx  # Form Absen Harian
│   │   │   │   ├── attendance/recap/page.tsx   # Rekap Absen
│   │   │   │   ├── attendance/table/[date]/page.tsx # Tabel Absen Bulanan
│   │   │   │   ├── announcements/page.tsx      # Pengumuman (Create)
│   │   │   │   ├── announcements/[id]/page.tsx # Edit Pengumuman
│   │   │   │   ├── calendar/page.tsx           # Kalender Kegiatan
│   │   │   │   ├── best-student/page.tsx       # Best Student
│   │   │   │   ├── best-point/page.tsx         # Poin Murid Leaderboard
│   │   │   │   └── achievements/page.tsx       # Prestasi Siswa
│   │   │   ├── siswa/
│   │   │   │   ├── page.tsx                    # Dashboard Siswa
│   │   │   │   ├── profile/page.tsx            # Profil Siswa
│   │   │   │   ├── prayers/page.tsx            # Checklist Sholat
│   │   │   │   ├── prayers/history/page.tsx    # Riwayat Sholat
│   │   │   │   ├── calendar/page.tsx           # Kalender Kegiatan
│   │   │   │   ├── attendance/page.tsx         # Riwayat Kehadiran
│   │   │   │   ├── violations/page.tsx         # Data Pelanggaran
│   │   │   │   ├── lateness/page.tsx           # Data Keterlambatan
│   │   │   │   ├── best-point/page.tsx         # Leaderboard Poin
│   │   │   │   └── best-student/page.tsx       # Best Student
│   │   │   └── layout.tsx                      # Dashboard Layout (Sidebar)
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── events/route.ts                 # GET events (FullCalendar)
│   │   │   ├── events/[id]/route.ts            # DELETE event
│   │   │   └── attendance/history/route.ts     # GET history absen (calendar)
│   │   ├── layout.tsx
│   │   └── page.tsx                            # Redirect ke /login
│   ├── components/
│   │   ├── ui/                                 # shadcn/ui components
│   │   ├── layouts/
│   │   │   ├── sidebar.tsx
│   │   │   ├── navbar.tsx
│   │   │   └── footer.tsx
│   │   ├── data-table.tsx
│   │   ├── calendar-widget.tsx
│   │   ├── stat-card.tsx
│   │   ├── announcement-timeline.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── prisma.ts                           # Prisma client singleton
│   │   ├── auth.ts                             # NextAuth config
│   │   ├── utils.ts                            # cn(), helpers
│   │   └── validators/                         # Zod schemas
│   ├── actions/                                # Server Actions
│   │   ├── auth.ts
│   │   ├── admin.ts
│   │   ├── guru.ts
│   │   └── siswa.ts
│   ├── hooks/                                  # Custom React hooks
│   └── types/                                  # TypeScript types
├── .env
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

---

## 5. Role & Hak Akses (RBAC)

### 5.1 Role

| Role    | Kode Status | Deskripsi                       |
|---------|-------------|---------------------------------|
| `admin` | `3`         | Administrator sistem            |
| `guru`  | `2` atau `4`| Guru / Wali Kelas               |
| `siswa` | `1`         | Siswa aktif                     |
| -       | `0`         | Akun belum diverifikasi (non-aktif) |

### 5.2 Matriks Hak Akses

| Fitur                      | Admin | Guru | Siswa |
|----------------------------|:-----:|:----:|:-----:|
| Dashboard                  |  ✅   |  ✅  |  ✅   |
| Kelola Akun Siswa          |  ✅   |  ❌  |  ❌   |
| Kelola Akun Guru           |  ✅   |  ❌  |  ❌   |
| Verifikasi Akun            |  ✅   |  ❌  |  ❌   |
| Kelola Kelas               |  ✅   |  ❌  |  ❌   |
| Import Siswa (Excel)       |  ✅   |  ❌  |  ❌   |
| CRUD Pengumuman            |  ✅   |  ✅  |  ❌   |
| Lihat Pengumuman           |  ✅   |  ✅  |  ✅   |
| Kalender Kegiatan (CRUD)   |  ✅   |  ✅  |  ❌   |
| Kalender Kegiatan (View)   |  ✅   |  ✅  |  ✅   |
| Kelas Saya (Enroll siswa)  |  ❌   |  ✅  |  ❌   |
| Absensi Kelas (CRUD)       |  ❌   |  ✅  |  ❌   |
| Rekap Absen + PDF          |  ❌   |  ✅  |  ❌   |
| Catat Keterlambatan        |  ❌   |  ✅  |  ❌   |
| Catat Pelanggaran          |  ❌   |  ✅  |  ❌   |
| Catat Catatan Siswa        |  ❌   |  ✅  |  ❌   |
| Kelola Poin Siswa (+/-)    |  ❌   |  ✅  |  ❌   |
| Best Student (CRUD)        |  ❌   |  ✅  |  ❌   |
| Verifikasi Sholat Siswa    |  ❌   |  ✅  |  ❌   |
| Profil Diri (Edit)         |  ❌   |  ✅  |  ✅   |
| Checklist Sholat           |  ❌   |  ❌  |  ✅   |
| Riwayat Sholat             |  ❌   |  ❌  |  ✅   |
| Riwayat Kehadiran          |  ❌   |  ❌  |  ✅   |
| Lihat Pelanggaran Sendiri  |  ❌   |  ❌  |  ✅   |
| Lihat Keterlambatan Sendiri|  ❌   |  ❌  |  ✅   |
| Best Point (Leaderboard)   |  ❌   |  ✅  |  ✅   |
| Best Student (View)        |  ❌   |  ✅  |  ✅   |
| Prestasi Siswa (Admin+Guru)|  ✅   |  ✅  |  ❌   |
| Code Restrict (Edit)       |  ✅   |  ❌  |  ❌   |

---

## 6. Skema Database Lengkap

### 6.1 Tabel: `users`

| Kolom              | Tipe            | Null | Keterangan                                   |
|--------------------|-----------------|------|----------------------------------------------|
| `id`               | BIGINT UNSIGNED | NO   | PK, auto_increment                           |
| `name`             | VARCHAR(255)    | NO   | Nama lengkap                                 |
| `nis`              | VARCHAR(255)    | YES  | Nomor Induk Siswa (khusus siswa)             |
| `nip`              | VARCHAR(255)    | YES  | NIP (khusus guru)                            |
| `guru_bidang`      | VARCHAR(255)    | YES  | Bidang / mata pelajaran guru                 |
| `email`            | VARCHAR(255)    | NO   | UNIQUE, untuk login                          |
| `appleid`          | VARCHAR(255)    | YES  | Apple ID siswa (pengelolaan iPad)            |
| `email_verified_at`| TIMESTAMP       | YES  | Waktu verifikasi email                       |
| `password`         | VARCHAR(255)    | NO   | Password ter-hash (bcrypt)                   |
| `password1`        | VARCHAR(255)    | YES  | Password plaintext (legacy, untuk display admin)|
| `passwordappleid`  | VARCHAR(255)    | YES  | Password Apple ID                            |
| `gender`           | VARCHAR(255)    | YES  | 'L' / 'P'                                   |
| `kelas`            | VARCHAR(255)    | YES  | Nama kelas tempat user terdaftar             |
| `status`           | VARCHAR(255)    | NO   | 0=non-aktif, 1=siswa aktif, 2=guru, 3=admin, 4=guru+wali |
| `ctt_iPad`         | TEXT            | YES  | Catatan iPad siswa                           |
| `image`            | VARCHAR(255)    | YES  | Path foto profil (storage)                   |
| `address`          | VARCHAR(255)    | YES  | Alamat                                       |
| `notes`            | VARCHAR(255)    | YES  | Catatan umum tentang siswa                   |
| `skills`           | VARCHAR(255)    | YES  | Keterampilan siswa                           |
| `point`            | VARCHAR(255)    | YES  | Poin reward siswa                            |
| `remember_token`   | VARCHAR(100)    | YES  | Token remember me                            |
| `created_at`       | TIMESTAMP       | YES  |                                              |
| `updated_at`       | TIMESTAMP       | YES  |                                              |

### 6.2 Tabel: `tbl_kelas`

| Kolom           | Tipe            | Null | Keterangan            |
|-----------------|-----------------|------|-----------------------|
| `id`            | BIGINT UNSIGNED | NO   | PK, auto_increment    |
| `nama_kelas`    | VARCHAR(255)    | NO   | Contoh: "Kelas 4 - Mehmed Al Fatih" |
| `wali_kelas`    | VARCHAR(255)    | YES  | Nama wali kelas       |
| `jumlah_siswa`  | VARCHAR(255)    | YES  | Jumlah siswa          |
| `code_restrict` | VARCHAR(255)    | YES  | Kode restrict iPad    |
| `created_at`    | TIMESTAMP       | YES  |                       |
| `updated_at`    | TIMESTAMP       | YES  |                       |

### 6.3 Tabel: `tbl_pengumuman`

| Kolom        | Tipe            | Null | Keterangan                |
|--------------|-----------------|------|---------------------------|
| `id`         | BIGINT UNSIGNED | NO   | PK, auto_increment        |
| `from`       | VARCHAR(255)    | YES  | Pengirim (nama kelas / "IT") |
| `title`      | VARCHAR(255)    | NO   | Judul pengumuman          |
| `file`       | VARCHAR(255)    | YES  | Path file lampiran        |
| `pengumuman` | TEXT            | NO   | Konten pengumuman (HTML)  |
| `like`       | VARCHAR(255)    | YES  | Jumlah like (legacy)      |
| `created_at` | TIMESTAMP       | YES  |                           |
| `updated_at` | TIMESTAMP       | YES  |                           |

### 6.4 Tabel: `tbl_absen`

| Kolom        | Tipe            | Null | Keterangan                                   |
|--------------|-----------------|------|----------------------------------------------|
| `id`         | BIGINT UNSIGNED | NO   | PK, auto_increment                           |
| `user_id`    | BIGINT UNSIGNED | NO   | FK ke users.id                               |
| `kelas`      | VARCHAR(255)    | NO   | Nama kelas                                   |
| `keterangan` | VARCHAR(255)    | YES  | "Hadir" / "Sakit" / "Izin" / "Alpha"        |
| `date`       | VARCHAR(255)    | YES  | Format: Y-m-j (contoh: 2026-9-10)           |
| `month`      | VARCHAR(255)    | YES  | Bulan (angka)                                |
| `created_at` | TIMESTAMP       | YES  |                                              |
| `updated_at` | TIMESTAMP       | YES  |                                              |

### 6.5 Tabel: `prayers`

| Kolom           | Tipe            | Null | Keterangan                     |
|-----------------|-----------------|------|--------------------------------|
| `id`            | INT             | NO   | FK ke users.id (bukan auto_inc)|
| `date`          | VARCHAR(255)    | YES  | Format: Y-m-d                  |
| `subuh`         | VARCHAR(255)    | YES  | Status checklist subuh          |
| `dhuha`         | VARCHAR(255)    | YES  | Status checklist dhuha          |
| `dzuhur`        | VARCHAR(255)    | YES  | Status checklist dzuhur         |
| `ashar`         | VARCHAR(255)    | YES  | Status checklist ashar          |
| `maghrib`       | VARCHAR(255)    | YES  | Status checklist maghrib        |
| `isya`          | VARCHAR(255)    | YES  | Status checklist isya           |
| `verified_otm`  | VARCHAR(255)    | YES  | Verifikasi orang tua            |
| `verified_guru` | VARCHAR(255)    | YES  | Verifikasi guru ("verified")    |
| `created_at`    | TIMESTAMP       | YES  |                                |
| `updated_at`    | TIMESTAMP       | YES  |                                |

### 6.6 Tabel: `tbl_keterlambatan`

| Kolom        | Tipe            | Null | Keterangan        |
|--------------|-----------------|------|--------------------|
| `id`         | BIGINT UNSIGNED | NO   | PK, auto_increment |
| `user_id`    | BIGINT UNSIGNED | NO   | FK ke users.id     |
| `nama`       | VARCHAR(255)    | NO   | Nama siswa         |
| `kelas`      | VARCHAR(255)    | NO   | Nama kelas         |
| `waktu`      | VARCHAR(255)    | NO   | Jam terlambat      |
| `keterangan` | VARCHAR(255)    | NO   | Alasan             |
| `created_at` | TIMESTAMP       | YES  |                    |
| `updated_at` | TIMESTAMP       | YES  |                    |

### 6.7 Tabel: `tbl_pelanggaran`

| Kolom        | Tipe            | Null | Keterangan              |
|--------------|-----------------|------|--------------------------|
| `id`         | BIGINT UNSIGNED | NO   | PK, auto_increment       |
| `user_id`    | VARCHAR(255)    | NO   | ID siswa                 |
| `nama`       | VARCHAR(255)    | YES  | Nama siswa               |
| `kelas`      | VARCHAR(255)    | YES  | Nama kelas               |
| `kategori`   | VARCHAR(255)    | YES  | Kategori pelanggaran     |
| `keterangan` | VARCHAR(255)    | YES  | Deskripsi pelanggaran    |
| `created_at` | TIMESTAMP       | YES  |                          |
| `updated_at` | TIMESTAMP       | YES  |                          |

### 6.8 Tabel: `tb_prestasi`

| Kolom       | Tipe            | Null | Keterangan           |
|-------------|-----------------|------|----------------------|
| `id`        | BIGINT UNSIGNED | NO   | PK, auto_increment   |
| `id_user`   | VARCHAR(255)    | NO   | ID siswa             |
| `nama`      | VARCHAR(255)    | NO   | Nama siswa           |
| `kelas`     | VARCHAR(255)    | NO   | Nama kelas           |
| `fotoanak`  | VARCHAR(255)    | NO   | Path foto prestasi   |
| `prestasi`  | VARCHAR(255)    | NO   | Deskripsi prestasi   |
| `created_at`| TIMESTAMP       | YES  |                      |
| `updated_at`| TIMESTAMP       | YES  |                      |

### 6.9 Tabel: `tbl_beststudent`

| Kolom       | Tipe            | Null | Keterangan            |
|-------------|-----------------|------|-----------------------|
| `id`        | BIGINT UNSIGNED | NO   | PK, auto_increment    |
| `name`      | VARCHAR(255)    | NO   | Nama siswa            |
| `foto`      | VARCHAR(255)    | YES  | Path foto             |
| `kelas`     | VARCHAR(255)    | NO   | Nama kelas            |
| `kategori`  | VARCHAR(255)    | NO   | Kategori penghargaan  |
| `created_at`| TIMESTAMP       | YES  |                       |
| `updated_at`| TIMESTAMP       | YES  |                       |

### 6.10 Tabel: `tb_events`

| Kolom             | Tipe            | Null | Keterangan                   |
|-------------------|-----------------|------|------------------------------|
| `id`              | BIGINT UNSIGNED | NO   | PK, auto_increment           |
| `title`           | VARCHAR(255)    | NO   | Judul event                  |
| `kelas`           | VARCHAR(255)    | NO   | Kelas terkait                |
| `from`            | VARCHAR(255)    | YES  | Pembuat event (nama guru / "admin") |
| `start`           | DATE            | NO   | Tanggal mulai                |
| `end`             | DATE            | YES  | Tanggal selesai              |
| `deskripsi`       | VARCHAR(255)    | YES  | Keterangan event             |
| `backgroundColor` | VARCHAR(255)    | YES  | Warna event di kalender      |
| `created_at`      | TIMESTAMP       | YES  |                              |
| `updated_at`      | TIMESTAMP       | YES  |                              |

### 6.11 Tabel: `tbl_restrict`

| Kolom           | Tipe            | Null | Keterangan             |
|-----------------|-----------------|------|------------------------|
| `id`            | BIGINT UNSIGNED | NO   | PK, auto_increment     |
| `nama_kelas`    | VARCHAR(255)    | NO   | Nama kelas             |
| `code_restrict` | VARCHAR(255)    | NO   | Kode restrict iPad     |
| `created_at`    | TIMESTAMP       | YES  |                        |
| `updated_at`    | TIMESTAMP       | YES  |                        |

### 6.12 Tabel: `tbl_ipad`

| Kolom       | Tipe            | Null | Keterangan           |
|-------------|-----------------|------|----------------------|
| `id`        | BIGINT UNSIGNED | NO   | PK, auto_increment   |
| `type_ipad` | VARCHAR(255)    | NO   | Tipe iPad            |
| `created_at`| TIMESTAMP       | YES  |                      |
| `updated_at`| TIMESTAMP       | YES  |                      |

### 6.13 Tabel: `table_likes`

| Kolom       | Tipe            | Null | Keterangan           |
|-------------|-----------------|------|----------------------|
| `id`        | BIGINT UNSIGNED | NO   | PK, auto_increment   |
| `user_id`   | VARCHAR(255)    | NO   | ID user yg like      |
| `post_id`   | VARCHAR(255)    | NO   | ID pengumuman        |
| `created_at`| TIMESTAMP       | YES  |                      |
| `updated_at`| TIMESTAMP       | YES  |                      |

### 6.14 Tabel: `tbl_tahunajar`

| Kolom       | Tipe            | Null | Keterangan           |
|-------------|-----------------|------|----------------------|
| `id`        | BIGINT UNSIGNED | NO   | PK, auto_increment   |
| `semester`  | VARCHAR(255)    | NO   | "Semester 1" / "Semester 2" |
| `tahun`     | VARCHAR(255)    | NO   | "2025/2026"          |
| `created_at`| TIMESTAMP       | YES  |                      |
| `updated_at`| TIMESTAMP       | YES  |                      |

### 6.15 Tabel Spatie Permission (Role & Permission)

Tabel `roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions` — akan digantikan oleh field `role` pada tabel `users` (enum: `admin`, `guru`, `siswa`) di versi baru karena tidak membutuhkan granular permission selain 3 role ini.

---

## 7. Modul & Fitur Detail per Role

### 7.1 Modul Autentikasi (Guest)

#### 7.1.1 Halaman Login (`/login`)
- Form input: **Email** dan **Password**
- Validasi: required
- Logika autentikasi:
  - Cek email + password (bcrypt compare)
  - Cek status user: jika `0` → tolak login (belum diverifikasi)
  - Redirect berdasarkan role:
    - `admin` (status `3`) → `/admin`
    - `guru` (status `2` atau `4`) → `/guru`
    - `siswa` (status `1`) → `/siswa`
- Alert error jika kredensial salah
- Alert sukses setelah registrasi (flash)
- Jika sudah login, redirect otomatis ke dashboard sesuai role

#### 7.1.2 Halaman Registrasi Guru (`/register`)
- Hanya untuk **pendaftaran guru baru**
- Form input:
  - Nama (`name`) — required
  - Email (`email`) — required
  - Apple ID (`appleid`) — required
  - Password (`password`) — required
  - Password Apple ID (`passwordappleid`) — required
  - Bidang / Mata Pelajaran (`guru-bidang`) — required
  - Jenis Kelamin (`gender`) — required (L/P)
  - NIP (`nip`) — opsional
  - Kelas yang diampu (`kelas`) — dropdown dari daftar kelas
- Akun yang terdaftar langsung mendapat role `guru` dengan status `0` (perlu diverifikasi admin)
- Setelah registrasi → redirect ke login dengan flash "Registrasi berhasil"

#### 7.1.3 Logout
- Hapus session
- Redirect ke `/login`
- Konfirmasi SweetAlert sebelum logout

---

### 7.2 Dashboard Admin

#### 7.2.1 Halaman Utama Dashboard (`/admin`)
- **4 Stat Cards** (summary):
  1. Jumlah Siswa (total user role `siswa`)
  2. Jumlah Guru (total user role `guru`)
  3. Akun Aktif (status != 0)
  4. Akun Non-Aktif (status = 0)
- **Timeline Pengumuman**: Menampilkan semua pengumuman (semua kelas + IT), urutkan terbaru. Setiap pengumuman menampilkan:
  - Tanggal dan waktu posting
  - Judul pengumuman
  - Konten (render HTML)
  - Lampiran file (embed viewer / download link)
  - Tombol: Edit, Delete
  - Delete menggunakan konfirmasi SweetAlert + AJAX
- **Kalender Kegiatan**: FullCalendar (dayGridMonth) menampilkan semua event.
  - Klik event → modal detail (title, start, end, deskripsi)
- **Tabel Code Restrict**: DataTable menampilkan daftar kode restrict per kelas.
  - Kolom: No, Nama Kelas, Code Restrict, Action (Edit)
  - Edit muncul dalam modal popup

#### 7.2.2 Kelola Akun Siswa (`/admin/students`)
- **DataTable** dengan kolom: No, Nama, Kelas, Email, Apple ID, Status, Action
- **Search / Filter** berdasarkan nama atau kelas
- **Pagination**: 10 per halaman
- **Action per row**:
  - Lihat Detail → `/admin/students/[id]`
  - Hapus (confirm SweetAlert)
  - Verifikasi (set status = 1)
- **Tombol Tambah Siswa**: Form modal dengan field:
  - Nama, Kelas (dropdown), Email, Password, Apple ID, Password Apple ID, Role (pilih siswa/guru)
- **Tombol Import Excel**: Upload file `.xlsx` untuk bulk import siswa
  - Format kolom Excel: Email, Password (hash), Password (plain), Nama, Apple ID, Password Apple ID, Status, Gender

#### 7.2.3 Detail / Edit Siswa (`/admin/students/[id]`)
- Menampilkan informasi lengkap siswa
- Form edit: Nama, Kelas, Email, Password, Apple ID, Password Apple ID, Catatan iPad
- Tombol simpan → update data
- Menampilkan daftar **prestasi siswa** terkait (dari tabel `tb_prestasi`)
- Tombol hapus prestasi

#### 7.2.4 Kelola Akun Guru (`/admin/teachers`)
- **DataTable** dengan kolom: No, Nama, Email, Status, Action
- **Search / Filter** berdasarkan nama
- **Pagination**: 10 per halaman
- **Action per row**:
  - Lihat Detail → `/admin/teachers/[id]`
  - Hapus (confirm SweetAlert)
  - Verifikasi → modal untuk pilih status: Guru biasa (status=2) atau Wali Kelas (status=4)

#### 7.2.5 Kelola Kelas (`/admin/classes`)
- **DataTable** dengan kolom: No, Nama Kelas, Wali Kelas, Jumlah Siswa, Action
- **Pagination**: 10 per halaman
- **Action per row**:
  - Detail Kelas → `/admin/classes/[namaKelas]`
  - Hapus (confirm SweetAlert)
- **Tombol Tambah Kelas**: Form dengan field:
  - Nama Kelas — required
  - Wali Kelas — opsional
  - Jumlah Siswa — opsional

#### 7.2.6 Detail Kelas (`/admin/classes/[id]`)
- Info kelas (nama, wali kelas)
- Daftar siswa terdaftar di kelas tersebut (paginated, 15 per halaman)
- Info guru wali kelas

#### 7.2.7 Buat Pengumuman (`/admin/announcements`)
- Form:
  - Judul (`title`) — required
  - Konten Pengumuman (`pengumuman`) — required, **Rich Text Editor** (TipTap)
  - Dari (`from`) — required (isi nama kelas tujuan, atau "IT" untuk semua)
- Redirect ke dashboard setelah berhasil

#### 7.2.8 Edit Pengumuman (`/admin/announcements/[id]`)
- Pre-fill form dengan data pengumuman yang ada
- Simpan perubahan

#### 7.2.9 Kalender Kegiatan Admin (`/admin/calendar`)
- Form tambah event:
  - Judul, Tanggal Mulai, Tanggal Selesai, Deskripsi, Warna
- FullCalendar menampilkan semua event
- Tombol hapus event

#### 7.2.10 Prestasi Siswa (dalam halaman detail siswa)
- Admin bisa tambah prestasi siswa: id_user, nama, kelas, foto, deskripsi prestasi
- Upload foto anak (max 2MB, jpg/jpeg/png)
- Hapus prestasi

---

### 7.3 Dashboard Guru

#### 7.3.1 Halaman Utama Dashboard (`/guru`)
- **4 Stat Cards**:
  1. **Kelas Saya**: Jumlah siswa aktif di kelas guru
  2. **Absensi Hari Ini**: Jumlah siswa yang sudah hadir hari ini (atau "Belum diisi")
  3. **Best Point**: Nama siswa dengan poin tertinggi di kelas
  4. **Best Student**: Link ke halaman best student
- **Timeline Pengumuman**: Sama seperti admin, tapi filter hanya pengumuman milik kelas guru + pengumuman dari "IT"
- **Best Student Carousel/Grid**: Menampilkan daftar best student di kelas guru (foto + kategori)
- **Prestasi Siswa Section**: Menampilkan semua prestasi siswa

#### 7.3.2 Profil Saya (`/guru/profile`)
- Informasi profil guru: nama, email, kelas, bidang, NIP, dll.
- Upload foto profil (max 1MB)
- Form edit: Nama, Alamat, Kelas (dropdown dari daftar kelas)

#### 7.3.3 Kelas Saya (`/guru/my-class`)
- **DataTable** siswa aktif di kelas guru
- Kolom: No, Nama, NIS, Gender, Status Sholat Hari Ini (icon per waktu sholat), Action
- **Info**: Tahun Pelajaran, Semester
- **Search / Filter** berdasarkan nama
- **Pagination**: 10 per halaman
- **Action per row**:
  - Profil Siswa → modal menampilkan info singkat + checklist sholat
  - Detail Siswa → `/guru/my-class/[id]` (full detail)
  - Tambah/Kurangi Poin → modal input poin
- **Tombol Tambah Murid**: Mendaftarkan siswa ke kelas guru
- **Tombol Hapus Murid** (bulk): Checkbox multi-select → keluarkan dari kelas (set kelas = '')

#### 7.3.4 Detail Siswa (`/guru/my-class/[id]`)
- Informasi lengkap: Nama, NIS, Email, Kelas, Gender, Apple ID, Point, Catatan
- **Tab/Section Catatan Siswa**: Form tambah catatan (`notes`)
- **Tab/Section Keterlambatan**:
  - Daftar keterlambatan siswa ini
  - Form tambah: Nama, Waktu, Keterangan
  - Tombol hapus per record
- **Tab/Section Pelanggaran**:
  - Daftar pelanggaran siswa ini
  - Form tambah: Nama, Kelas, Kategori, Keterangan
  - Tombol hapus per record

#### 7.3.5 Absensi Kelas (`/guru/attendance`)
- **Kalender bulanan** (styled calendar, bukan FullCalendar)
- Menampilkan tahun pelajaran dan semester
- Klik tanggal → navigasi ke Form Absen (`/guru/attendance/[date]`)
- Link ke Tabel Absen Bulanan (`/guru/attendance/table/[date]`)

#### 7.3.6 Form Absen Harian (`/guru/attendance/[date]`)
- Daftar semua siswa aktif di kelas (urut nama ASC)
- Per siswa: Dropdown/Radio pilih keterangan: **Hadir** / **Sakit** / **Izin** / **Alpha**
- Jika absen tanggal itu sudah ada, pre-fill data → mode update
- Jika belum ada → mode create
- Tombol simpan → redirect ke tabel absen
- Tombol hapus absen tanggal tersebut

#### 7.3.7 Tabel Absen Bulanan (`/guru/attendance/table/[date]`)
- Tabel besar: **Baris = Siswa**, **Kolom = Tanggal 1..31**
- Setiap sel berisi keterangan singkat: H (Hadir), S (Sakit), I (Izin), A (Alpha), atau kosong
- Kolom rekap di kanan: Total Hadir, Total Sakit, Total Izin, Total Alpha
- Info: Tahun Pelajaran, Semester

#### 7.3.8 Rekap Absen + Export PDF (`/guru/attendance/recap`)
- Pilih bulan → generate rekap absen bulanan
- Tombol **Download PDF** (landscape A4):
  - Format PDF: header sekolah, tabel absen bulanan lengkap, rekap per siswa
  - Info: Kelas, Tahun Pelajaran, Semester, Bulan

#### 7.3.9 Pengumuman Guru (`/guru/announcements`)
- Form buat pengumuman:
  - Judul — required
  - Dari (auto-fill kelas guru) — required
  - Lampiran file (pdf/jpg/jpeg/png, max 2MB) — opsional
  - Konten — required, **Rich Text Editor**
- Daftar pengumuman yang sudah dibuat oleh guru
- Edit / Hapus pengumuman

#### 7.3.10 Kalender Kegiatan Guru (`/guru/calendar`)
- Sama dengan admin: FullCalendar + form tambah event + hapus event
- Event yang ditampilkan: milik kelas guru + event dari admin

#### 7.3.11 Best Student (`/guru/best-student`)
- Daftar best student di kelas guru (urut terbaru)
- Form tambah:
  - Nama siswa (dropdown dari siswa di kelas) — required
  - Kelas (auto-fill) — required
  - Kategori penghargaan — required
  - Foto (jpg/jpeg/png, max 2MB) — opsional
- Edit: ubah kategori dan foto
- Hapus

#### 7.3.12 Poin Murid / Leaderboard (`/guru/best-point`)
- Daftar semua siswa di kelas guru, urut poin tertinggi ke terendah
- Tampilkan: No, Nama, Poin

#### 7.3.13 Prestasi Siswa (`/guru/achievements`)
- Daftar prestasi semua siswa
- Form tambah prestasi: nama, kelas, foto anak, deskripsi prestasi

#### 7.3.14 Verifikasi Sholat Siswa
- Dalam halaman profil siswa / checklist sholat
- Guru bisa klik "Verified" untuk menandai checklist sholat siswa pada tanggal tertentu

---

### 7.4 Dashboard Siswa

#### 7.4.1 Halaman Utama Dashboard (`/siswa`)
- **Header**: Nama kelas siswa + nama wali kelas
- **4 Stat Cards**:
  1. **Pelanggaran**: Jumlah total pelanggaran siswa di kelas ini
  2. **Keterlambatan**: Jumlah total keterlambatan siswa di kelas ini
  3. **Best Point**: Nama siswa poin tertinggi di kelas
  4. **Best Student**: Link ke halaman best student
- **Timeline Pengumuman**: Filter pengumuman kelas siswa + pengumuman "IT"
- **Jadwal Sholat Hari Ini**: Integrasi API jadwal sholat (Subuh, Dzuhur, Ashar, Maghrib, Isya)
- **Best Student Carousel**: Menampilkan best student kelas
- **Prestasi Siswa**: Menampilkan semua prestasi

#### 7.4.2 Profil Siswa (`/siswa/profile`)
- Informasi: Nama, NIS, Email, Kelas, Gender, Alamat, Skills, Catatan, Point
- Upload foto profil (max 1MB)
- Form edit: Alamat, Skills, Catatan
- Daftar prestasi siswa sendiri

#### 7.4.3 Checklist Sholat (`/siswa/prayers`)
- **Form checklist harian** (hari ini):
  - 6 waktu sholat: Subuh, Dhuha, Dzuhur, Ashar, Maghrib, Isya
  - Per waktu: Checkbox / Toggle (Ya/Tidak)
  - Tanggal diisi otomatis (hari ini)
- Gunakan `upsert` → jika sudah diisi hari ini, update; jika belum, create
- Status verifikasi guru ditampilkan (jika sudah "verified" oleh guru)

#### 7.4.4 Riwayat Sholat (`/siswa/prayers/history`)
- **Tabel** daftar checklist sholat per tanggal, urut terbaru
- Kolom: Tanggal, Subuh, Dhuha, Dzuhur, Ashar, Maghrib, Isya, Status Verifikasi
- **Pagination**: 7 per halaman

#### 7.4.5 Kalender Kegiatan Siswa (`/siswa/calendar`)
- FullCalendar menampilkan event kelas siswa + event admin
- View only (tidak bisa tambah/hapus)

#### 7.4.6 Riwayat Kehadiran (`/siswa/attendance`)
- **FullCalendar** menampilkan riwayat absensi siswa
- Setiap tanggal yang ada absennya ditampilkan sebagai event:
  - **Hadir** → hijau (#198754)
  - **Sakit** → biru (#0d6efd)
  - **Izin** → kuning (#ffc107)
  - **Alpha** → merah (#dc3545)

#### 7.4.7 Data Pelanggaran (`/siswa/violations`)
- **DataTable**: daftar pelanggaran siswa sendiri di kelas saat ini
- Kolom: No, Nama, Kategori, Keterangan, Tanggal
- Pagination: 10 per halaman
- **View only** (siswa tidak bisa edit/hapus)

#### 7.4.8 Data Keterlambatan (`/siswa/lateness`)
- **DataTable**: daftar keterlambatan siswa sendiri di kelas saat ini
- Kolom: No, Nama, Waktu, Keterangan, Tanggal
- Pagination: 10 per halaman
- **View only**

#### 7.4.9 Best Point Leaderboard (`/siswa/best-point`)
- Daftar siswa di kelas, urut poin tertinggi
- Tampilkan: Ranking, Nama, Poin
- Highlight diri sendiri

#### 7.4.10 Best Student (`/siswa/best-student`)
- Daftar best student di kelas siswa (paginated, 10 per halaman)
- Kolom: No, Nama, Kelas, Kategori, Foto
- View only

---

## 8. Daftar Halaman & Routing

| Route                             | Role    | Halaman                        |
|-----------------------------------|---------|--------------------------------|
| `/login`                          | Guest   | Login                          |
| `/register`                       | Guest   | Registrasi Guru                |
| `/admin`                          | Admin   | Dashboard Admin                |
| `/admin/students`                 | Admin   | Kelola Akun Siswa              |
| `/admin/students/[id]`            | Admin   | Detail / Edit Siswa            |
| `/admin/teachers`                 | Admin   | Kelola Akun Guru               |
| `/admin/teachers/[id]`            | Admin   | Detail / Edit Guru             |
| `/admin/classes`                  | Admin   | Kelola Kelas                   |
| `/admin/classes/[id]`             | Admin   | Detail Kelas                   |
| `/admin/announcements`            | Admin   | Buat Pengumuman                |
| `/admin/announcements/[id]`       | Admin   | Edit Pengumuman                |
| `/admin/calendar`                 | Admin   | Kalender Kegiatan              |
| `/guru`                           | Guru    | Dashboard Guru                 |
| `/guru/profile`                   | Guru    | Profil Saya                    |
| `/guru/my-class`                  | Guru    | Kelas Saya                     |
| `/guru/my-class/[id]`             | Guru    | Detail Siswa                   |
| `/guru/attendance`                | Guru    | Absen Kelas (Kalender)         |
| `/guru/attendance/[date]`         | Guru    | Form Absen Harian              |
| `/guru/attendance/table/[date]`   | Guru    | Tabel Absen Bulanan            |
| `/guru/attendance/recap`          | Guru    | Rekap Absen                    |
| `/guru/announcements`             | Guru    | Buat Pengumuman                |
| `/guru/announcements/[id]`        | Guru    | Edit Pengumuman                |
| `/guru/calendar`                  | Guru    | Kalender Kegiatan              |
| `/guru/best-student`              | Guru    | Best Student                   |
| `/guru/best-point`                | Guru    | Poin Murid Leaderboard         |
| `/guru/achievements`              | Guru    | Prestasi Siswa                 |
| `/siswa`                          | Siswa   | Dashboard Siswa                |
| `/siswa/profile`                  | Siswa   | Profil Siswa                   |
| `/siswa/prayers`                  | Siswa   | Checklist Sholat               |
| `/siswa/prayers/history`          | Siswa   | Riwayat Sholat                 |
| `/siswa/calendar`                 | Siswa   | Kalender Kegiatan              |
| `/siswa/attendance`               | Siswa   | Riwayat Kehadiran              |
| `/siswa/violations`               | Siswa   | Data Pelanggaran               |
| `/siswa/lateness`                 | Siswa   | Data Keterlambatan             |
| `/siswa/best-point`               | Siswa   | Best Point Leaderboard         |
| `/siswa/best-student`             | Siswa   | Best Student                   |

---

## 9. API Routes (Server Actions / Route Handlers)

### 9.1 Route Handlers (GET JSON untuk FullCalendar)

| Method | Endpoint                      | Deskripsi                                                    |
|--------|-------------------------------|--------------------------------------------------------------|
| GET    | `/api/events`                 | Daftar event kalender (filter: kelas user + admin events)     |
| DELETE | `/api/events/[id]`            | Hapus event                                                  |
| GET    | `/api/attendance/history`     | Riwayat absensi siswa (format FullCalendar events JSON)       |

### 9.2 Server Actions (Form Submissions)

| Action                   | Deskripsi                                              |
|--------------------------|--------------------------------------------------------|
| `loginAction`            | Autentikasi user                                       |
| `registerAction`         | Registrasi guru baru                                   |
| `logoutAction`           | Logout user                                            |
| `createUserAction`       | Admin: tambah siswa/guru                               |
| `importUsersAction`      | Admin: import siswa dari Excel                         |
| `updateUserAction`       | Admin/Guru: edit data user                             |
| `deleteUserAction`       | Admin: hapus user                                      |
| `verifyUserAction`       | Admin: verifikasi akun user                            |
| `createClassAction`      | Admin: tambah kelas                                    |
| `deleteClassAction`      | Admin: hapus kelas                                     |
| `createAnnouncementAction`| Admin/Guru: buat pengumuman                           |
| `updateAnnouncementAction`| Admin/Guru: edit pengumuman                           |
| `deleteAnnouncementAction`| Admin/Guru: hapus pengumuman                          |
| `updateRestrictAction`   | Admin: edit code restrict                              |
| `createEventAction`      | Admin/Guru: tambah event kalender                      |
| `deleteEventAction`      | Admin/Guru: hapus event kalender                       |
| `enrollStudentAction`    | Guru: daftarkan siswa ke kelas                         |
| `removeStudentsAction`   | Guru: keluarkan siswa dari kelas (bulk)                |
| `createAttendanceAction` | Guru: buat/update absensi harian                       |
| `deleteAttendanceAction` | Guru: hapus absensi per tanggal                        |
| `addPointAction`         | Guru: tambah poin siswa                                |
| `subtractPointAction`    | Guru: kurangi poin siswa                               |
| `createLatenessAction`   | Guru: catat keterlambatan                              |
| `deleteLatenessAction`   | Guru: hapus keterlambatan                              |
| `createViolationAction`  | Guru: catat pelanggaran                                |
| `deleteViolationAction`  | Guru: hapus pelanggaran                                |
| `updateNotesAction`      | Guru: update catatan siswa                             |
| `verifyPrayerAction`     | Guru: verifikasi checklist sholat siswa                |
| `createBestStudentAction`| Guru: tambah best student                              |
| `updateBestStudentAction`| Guru: update best student                              |
| `deleteBestStudentAction`| Guru: hapus best student                               |
| `createAchievementAction`| Admin/Guru: tambah prestasi siswa                      |
| `deleteAchievementAction`| Admin/Guru: hapus prestasi siswa                       |
| `updateProfileAction`    | Guru/Siswa: update profil diri                         |
| `uploadPhotoAction`      | Guru/Siswa: upload foto profil                         |
| `savePrayerChecklistAction`| Siswa: simpan checklist sholat harian                |
| `updateStudentProfileAction`| Siswa: update alamat, skills, notes                 |
| `downloadAttendancePdfAction` | Guru: generate dan download PDF rekap absen        |

---

## 10. Integrasi Eksternal

### 10.1 API Jadwal Sholat
- **Endpoint**: `https://api.myquran.com/v2/sholat/jadwal/0816/{tahun}/{bulan}/{tanggal}`
- **Kode Kota**: `0816` (Palembang)
- **Digunakan di**: Dashboard Siswa
- **Data yang diambil**: jadwal sholat harian (Subuh, Dzuhur, Ashar, Maghrib, Isya, dll.)
- **Timeout**: 10 detik
- **Fallback**: Tampilkan pesan "Gagal memuat jadwal sholat" jika API tidak merespons

---

## 11. UI/UX Guidelines

### 11.1 Tema & Branding
- **Nama Aplikasi**: SISFO SDIA Cairo
- **Logo**: Logo SD Islam Al-Azhar Cairo Palembang (file: `LogoSekolah.png`)
- **Warna Utama**: Hijau islami / Biru teal (sesuai identitas sekolah)
- **Footer**: "Developed By Team IT SD Al Azhar Cairo Palembang"

### 11.2 Layout Dashboard
- **Sidebar** (collapsible): Logo + nama user + menu navigasi sesuai role
- **Navbar** (top): Toggle sidebar, notifikasi bell, fullscreen toggle
- **Content Area**: Responsif, container fluid
- **Footer**: Copyright + versi

### 11.3 Komponen UI (gunakan shadcn/ui)
- **Stat Cards** → shadcn `Card` dengan ikon, angka besar, warna background
- **DataTable** → `@tanstack/react-table` + shadcn table (search, pagination, sorting)
- **Timeline** → Custom component untuk pengumuman
- **Modal** → shadcn `Dialog`
- **Form** → shadcn `Form` + React Hook Form + Zod
- **Dropdown** → shadcn `Select` atau `Combobox`
- **Toast/Alert** → `sonner` atau `sweetalert2`
- **Calendar** → FullCalendar React
- **Rich Text Editor** → TipTap Editor
- **Tabs** → shadcn `Tabs`
- **Badge** → shadcn `Badge` (untuk label role, status)

### 11.4 Responsivitas
- Semua halaman harus responsif (mobile-first)
- Sidebar collapse otomatis di layar kecil
- Tabel horizontal scroll di layar kecil

---

## 12. Seeder & Data Awal

### 12.1 Roles
- `admin`, `guru`, `siswa`

### 12.2 Users Default

| Nama  | Email              | Password  | Role  | Status |
|-------|--------------------|-----------|-------|--------|
| admin | admin@gmail.com    | admin123  | admin | 3      |
| Guru  | guru@gmail.com     | guru123   | guru  | 2      |
| Siswa | siswa@gmail.com    | siswa123  | siswa | 1      |

### 12.3 Daftar Kelas
- Kelas 4: Mehmed Al Fatih, Sayfuddin Al Quthuz, Sholahuddin Al Ayubi, Sulaiman Al Qanuni, Mushab bin Umair
- Kelas 5: An Nasa'i, Abu Daud, Al Bukhari, Muslim, Tirmidzi
- Kelas 6: Tholhah bin Ubaidillah, Anas bin Malik, Jabir bin Abdillah, Mu'adz bin Jabal, Urwah bin Zubair

### 12.4 Code Restrict (per Kelas)

| Kelas                       | Code Restrict   |
|-----------------------------|-----------------|
| Kelas 3 - Ibnu Hayyan      | 2739            |
| Kelas 3 - Ibnu Rusyd       | 2957            |
| Kelas 3 - Ibnu Nafis       | 3419            |
| Kelas 3 - Ibnu Kholdun     | 3458            |
| Kelas 3 - Ibnu Batutah     | 2816            |
| Kelas 5 - Al Bukhari       | 9375, 1989      |
| Kelas 5 - Muslim           | 1890, 2371      |
| Kelas 5 - Abu Daud         | 1690, 2560      |
| Kelas 5 - Tirmidzi         | 1990, 7373      |
| Kelas 5 - An Nasai         | 1996, 2203      |
| Kelas 6 - Tholha           | 6183            |
| Kelas 6 - Anas             | 6843            |
| Kelas 6 - Jabir            | 1204            |
| Kelas 6 - Muadz            | 4952            |
| Kelas 6 - Urwah            | 1972            |

---

## 13. File Upload & Storage

| Konteks               | Tipe File Diterima     | Max Size | Storage Path        |
|------------------------|------------------------|----------|---------------------|
| Foto Profil (Guru/Siswa) | jpg, jpeg, png       | 1 MB     | `/uploads/images/`  |
| Lampiran Pengumuman    | pdf, jpg, jpeg, png    | 2 MB     | `/uploads/files/`   |
| Foto Prestasi Siswa    | jpg, jpeg, png         | 2 MB     | `/uploads/images/`  |
| Foto Best Student      | jpg, jpeg, png         | 2 MB     | `/uploads/images/`  |
| Import Excel Siswa     | xlsx                   | -        | Temporary (process only) |

### Strategi Storage di Next.js
- Gunakan folder `public/uploads/` atau layanan storage (Cloudinary / uploadthing)
- File yang di-upload di-serve secara statis
- Simpan path relatif di database

---

## 14. PDF Export

### Rekap Absen Kelas (Guru)
- **Format**: A4 Landscape
- **Header**: Logo + Nama Sekolah + "Rekap Absen Kelas [nama_kelas]"
- **Info**: Tahun Pelajaran, Semester, Bulan
- **Tabel**:
  - Baris = Nama Siswa (urut ASC)
  - Kolom = Tanggal 1..N (sesuai hari dalam bulan)
  - Sel = Keterangan singkat (H/S/I/A)
  - Kolom rekap: Total H, S, I, A
- **Library**: `@react-pdf/renderer` (server-side) atau `jsPDF + autoTable`

---

## 15. Excel Import

### Import Data Siswa
- **Format file**: `.xlsx`
- **Kolom (urutan)**:
  1. Email
  2. Password (akan di-hash)
  3. Password Plain (disimpan di kolom `password1`)
  4. Nama
  5. Apple ID
  6. Password Apple ID
  7. Status (integer)
  8. Gender (L/P)
- **Baris pertama**: Header (di-skip)
- **Proses**: Setiap baris → create User + assign role `siswa`
- **Library**: `xlsx` (SheetJS) untuk parsing di server

---

## 16. Non-Functional Requirements

| Aspek           | Requirement                                                |
|-----------------|-------------------------------------------------------------|
| Performance     | Time to First Byte < 500ms, halaman interaktif < 1s         |
| Security        | Password di-hash (bcrypt), CSRF protection, session-based auth |
| Scalability     | Arsitektur modular, bisa deploy ke Vercel / VPS             |
| Availability    | Target uptime 99.5% (untuk deployment production)           |
| Accessibility   | Minimal WCAG 2.1 Level A                                   |
| Browser Support | Chrome, Firefox, Safari, Edge (2 versi terakhir)            |
| Mobile          | Responsif, minimal usable di viewport 375px                 |
| Bahasa UI       | **Bahasa Indonesia** (primary), beberapa label dalam English |
| Database        | MySQL 8.x, kompatibel dengan XAMPP                          |
| Backup          | Database backup terjadwal (manual/script)                    |

---

## 17. Status Kode User

| Status | Keterangan                                     | Bisa Login? |
|--------|-------------------------------------------------|:-----------:|
| `0`    | Akun baru, belum diverifikasi                   |     ❌      |
| `1`    | Siswa aktif (sudah diverifikasi)                |     ✅      |
| `2`    | Guru aktif (sudah diverifikasi)                 |     ✅      |
| `3`    | Admin                                           |     ✅      |
| `4`    | Guru + Wali Kelas (sudah diverifikasi)          |     ✅      |

### Alur Verifikasi
1. Guru registrasi → status `0` (non-aktif)
2. Admin masuk ke halaman akun guru
3. Admin klik "Verifikasi" → pilih: Guru biasa (`2`) atau Wali Kelas (`4`)
4. Siswa dibuat oleh admin (manual/import) → bisa langsung status `1`
5. Siswa yang status `0` perlu diverifikasi admin → set status `1`

---

## 18. Kalender Akademik (Tahun Pelajaran & Semester)

### Logika Penentuan Otomatis

```
Jika bulan saat ini >= Juli (7):
  Tahun Pelajaran = {tahun_sekarang}/{tahun_sekarang + 1}
  Semester = "Semester 1"

Jika bulan saat ini < Juli (7):
  Tahun Pelajaran = {tahun_sekarang - 1}/{tahun_sekarang}
  Semester = "Semester 2"
```

Contoh:
- September 2026 → Tahun Pelajaran: **2026/2027**, **Semester 1**
- Maret 2027 → Tahun Pelajaran: **2026/2027**, **Semester 2**

Logika ini digunakan di:
- Halaman Kelas Saya (Guru)
- Halaman Absensi
- Tabel Absen Bulanan
- Rekap Absen PDF

---

## 19. Catatan Migrasi dari Laravel

### 19.1 Hal yang Perlu Diperhatikan

1. **Nama kolom dengan tanda hubung**: Di sistem lama, beberapa kolom menggunakan tanda hubung (contoh: `nama-kelas`, `wali-kelas`, `code-restrict`, `guru-bidang`). Di Prisma/MySQL baru, gunakan **underscore** sebagai pengganti (contoh: `nama_kelas`, `wali_kelas`, `code_restrict`, `guru_bidang`). Jika ingin kompatibel dengan database lama, gunakan `@map("nama-kelas")` di Prisma schema.

2. **Password plaintext** (`password1`): Sistem lama menyimpan password plaintext di kolom `password1` agar admin bisa melihat password siswa. Di sistem baru, **pertahankan fitur ini** karena ini adalah kebutuhan operasional sekolah (admin perlu menginformasikan password ke siswa/guru baru).

3. **Kolom `status` sebagai string**: Di sistem lama, status disimpan sebagai VARCHAR. Di sistem baru, pertimbangkan menggunakan **enum** untuk tipe safety.

4. **Tabel `prayers` menggunakan `id` user sebagai key**: Bukan auto_increment. Ini adalah composite key `(id, date)`. Perlu di-handle khusus di Prisma (`@@id([id, date])`).

5. **Spatie Permission**: Digantikan oleh field `role` pada tabel `users` (enum: `ADMIN`, `GURU`, `SISWA`) + middleware Next.js.

6. **FullCalendar events endpoint**: Perlu disediakan sebagai API route handler GET yang mengembalikan JSON array format FullCalendar.

7. **AdminLTE → shadcn/ui**: Semua komponen AdminLTE (small-box, timeline, card, sidebar, DataTable) perlu di-mapping ke komponen shadcn/ui yang setara.

### 19.2 Data Migration
- Jika ingin mempertahankan data lama, buat script migrasi untuk:
  1. Export data dari MySQL lama
  2. Transform nama kolom (hyphen → underscore)
  3. Import ke schema Prisma baru
- Atau koneksi langsung ke database `sisfo_alazhar` yang sudah ada

---

> **Dokumen ini mencakup 100% fitur dari sistem Sisfo Al-Azhar yang sudah berjalan di Laravel 8.** Gunakan dokumen ini sebagai acuan lengkap untuk membangun ulang seluruh sistem menggunakan Next.js + Tailwind CSS + shadcn/ui + MySQL.
