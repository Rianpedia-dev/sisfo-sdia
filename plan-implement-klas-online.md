# Integrasi Kelas Virtual (Online Class) — Sisfo SD Al-Azhar Cairo

## Ringkasan

Menambahkan fitur **Kelas Virtual (Online Class)** ke Sisfo SD yang memungkinkan guru membuat ruang kelas video online dan siswa bergabung langsung dari dashboard mereka. Menggunakan **Daily.co (Daily Prebuilt)** sebagai infrastruktur WebRTC agar implementasi cepat dan stabil, tanpa perlu membangun UI video dari nol.

---

## Catatan Penting Sebelum Implementasi

> ⚠️ **Daily.co API Key diperlukan:** Anda harus mendaftar akun di [daily.co](https://www.daily.co/) dan mendapatkan API key. Free tier Daily.co mendukung hingga **100 participants/room** dan **2.000 participant-minutes/month**, cukup untuk MVP sekolah.

> ⚠️ **Perubahan Database:** Fitur ini menambahkan **2 tabel baru** ke database MySQL (`tbl_kelas_online` dan `tbl_kelas_online_attendance`). Pastikan untuk menjalankan `npx prisma db push` atau migrasi setelah schema diperbarui.

> ℹ️ **Pilihan Pendekatan Daily.co:** Plan ini menggunakan **Daily Prebuilt (iframe embed)** untuk MVP — ini memberikan UI video call lengkap (screen share, chat, participant list) tanpa koding tambahan. Jika di kemudian hari ingin custom UI penuh, bisa upgrade ke Daily Call Object + daily-react hooks.

---

## Pertanyaan Terbuka

1. **Apakah sudah punya akun Daily.co?** Jika belum, perlu panduan setup akun dan mendapatkan API key.
2. **Batas durasi kelas online per sesi?** PRD tidak menyebutkan batas waktu. Apakah ada batasan (misalnya maks 2 jam per sesi)?
3. **Fitur "Raise Hand"** — Daily Prebuilt sudah punya fitur raise hand bawaan. Apakah cukup menggunakan yang bawaan, atau butuh custom UI?
4. **Jadwal Pelajaran** — Saat ini belum ada tabel jadwal pelajaran di database. Apakah fitur ini diintegrasikan ke halaman terpisah (menu "Kelas Online"), atau nanti akan dihubungkan ke jadwal pelajaran yang akan dibuat?

---

## 1. Environment & Dependencies

### [MODIFY] `.env`

Tambah environment variable untuk Daily.co:

```env
DAILY_API_KEY="your-daily-co-api-key-here"
NEXT_PUBLIC_DAILY_DOMAIN="your-subdomain.daily.co"
```

### [MODIFY] `package.json`

Install dependencies baru:

```bash
npm install @daily-co/daily-react @daily-co/daily-js
```

---

## 2. Database Schema (Prisma)

### [MODIFY] `prisma/schema.prisma`

Menambah 2 model baru:

```prisma
model KelasOnline {
  id              BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  room_name       String    @map("room_name") @db.VarChar(255)       // nama room di Daily.co
  room_url        String    @map("room_url") @db.VarChar(500)         // URL lengkap room Daily.co
  daily_room_id   String?   @map("daily_room_id") @db.VarChar(255)   // ID room dari Daily API
  guru_id         BigInt    @map("guru_id") @db.UnsignedBigInt        // ID guru yang membuat
  guru_name       String    @map("guru_name") @db.VarChar(255)        // nama guru
  kelas           String    @db.VarChar(255)                           // kelas target (e.g. "Kelas 4 - Mehmed Al Fatih")
  mata_pelajaran  String?   @map("mata_pelajaran") @db.VarChar(255)   // opsional: mata pelajaran
  status          String    @default("active") @db.VarChar(50)        // active | ended
  started_at      DateTime? @map("started_at") @db.Timestamp(0)
  ended_at        DateTime? @map("ended_at") @db.Timestamp(0)
  max_participants Int?     @map("max_participants") @default(50)
  created_at      DateTime? @db.Timestamp(0)
  updated_at      DateTime? @updatedAt @db.Timestamp(0)

  attendance      KelasOnlineAttendance[]

  @@map("tbl_kelas_online")
}

model KelasOnlineAttendance {
  id              BigInt      @id @default(autoincrement()) @db.UnsignedBigInt
  kelas_online_id BigInt      @map("kelas_online_id") @db.UnsignedBigInt
  user_id         BigInt      @map("user_id") @db.UnsignedBigInt
  user_name       String      @map("user_name") @db.VarChar(255)
  user_role       String      @map("user_role") @db.VarChar(50)       // "guru" | "siswa"
  joined_at       DateTime?   @map("joined_at") @db.Timestamp(0)
  left_at         DateTime?   @map("left_at") @db.Timestamp(0)
  duration_minutes Int?       @map("duration_minutes")
  created_at      DateTime?   @db.Timestamp(0)
  updated_at      DateTime?   @updatedAt @db.Timestamp(0)

  kelasOnline     KelasOnline @relation(fields: [kelas_online_id], references: [id], onDelete: Cascade)

  @@index([kelas_online_id])
  @@index([user_id])
  @@map("tbl_kelas_online_attendance")
}
```

### Diagram Relasi Database

```
┌──────────────────────────────┐       ┌──────────────────────────────────┐
│       tbl_kelas_online       │       │  tbl_kelas_online_attendance     │
├──────────────────────────────┤       ├──────────────────────────────────┤
│ id (PK)                      │──┐    │ id (PK)                          │
│ room_name                    │  │    │ kelas_online_id (FK) ────────────┤
│ room_url                     │  └───>│ user_id                          │
│ daily_room_id                │       │ user_name                        │
│ guru_id                      │       │ user_role                        │
│ guru_name                    │       │ joined_at                        │
│ kelas                        │       │ left_at                          │
│ mata_pelajaran               │       │ duration_minutes                 │
│ status (active|ended)        │       │ created_at                       │
│ started_at                   │       │ updated_at                       │
│ ended_at                     │       └──────────────────────────────────┘
│ max_participants             │
│ created_at                   │
│ updated_at                   │
└──────────────────────────────┘
```

---

## 3. API Routes (Backend — Daily.co Integration)

### Arsitektur API

```
src/app/api/kelas-online/
├── create-room/route.ts    POST  — Guru buat room baru
├── join-room/route.ts      POST  — Siswa/guru bergabung ke room
├── end-room/route.ts       POST  — Guru akhiri kelas
├── leave-room/route.ts     POST  — Catat siswa keluar
└── active-rooms/route.ts   GET   — Ambil daftar room aktif
```

### [NEW] `src/lib/daily.ts` — Daily.co REST API Helper

Helper utility untuk berkomunikasi dengan Daily.co REST API:

```typescript
// Base URL: https://api.daily.co/v1
// Auth: Bearer token (DAILY_API_KEY)

export async function createDailyRoom(roomName: string, options?: {
  privacy?: "public" | "private";
  maxParticipants?: number;
  exp?: number; // unix timestamp
}): Promise<{ id: string; name: string; url: string }>;

export async function createMeetingToken(options: {
  room_name: string;
  user_name: string;
  is_owner?: boolean;
  exp?: number;
}): Promise<{ token: string }>;

export async function deleteDailyRoom(roomName: string): Promise<void>;
```

### [NEW] `src/app/api/kelas-online/create-room/route.ts`

**`POST /api/kelas-online/create-room`** — Guru membuat room baru

Alur:
1. Verifikasi session & role = guru
2. Generate nama room unik: `alazhar-{kelas}-{timestamp}`
3. Panggil Daily.co REST API `POST /rooms` → buat room `private`
4. Panggil Daily.co REST API `POST /meeting-tokens` → token guru (`is_owner: true`)
5. Simpan record ke `tbl_kelas_online` (status = "active", started_at = now)
6. Return `{ roomId, roomUrl, token }`

Request body:
```json
{
  "mata_pelajaran": "Matematika"
}
```

### [NEW] `src/app/api/kelas-online/join-room/route.ts`

**`POST /api/kelas-online/join-room`** — Siswa atau guru bergabung ke room

Alur:
1. Verifikasi session
2. Cek room masih `active` di database
3. Cek kelas siswa = kelas room (keamanan)
4. Generate Daily meeting token (`is_owner: false` untuk siswa, `true` untuk guru)
5. Catat attendance: INSERT ke `tbl_kelas_online_attendance` (joined_at = now)
6. Return `{ roomUrl, token, attendanceId }`

Request body:
```json
{
  "roomId": "123"
}
```

### [NEW] `src/app/api/kelas-online/end-room/route.ts`

**`POST /api/kelas-online/end-room`** — Guru mengakhiri kelas

Alur:
1. Verifikasi session & role = guru
2. Verifikasi guru adalah pemilik room (guru_id match)
3. Update status room → `"ended"`, set `ended_at = now`
4. Update semua attendance yang belum punya `left_at` → set `left_at = now`
5. (Opsional) Panggil Daily.co REST API `DELETE /rooms/:name` untuk cleanup
6. Return `{ success: true }`

### [NEW] `src/app/api/kelas-online/leave-room/route.ts`

**`POST /api/kelas-online/leave-room`** — Catat siswa keluar

Alur:
1. Verifikasi session
2. Update attendance record: set `left_at = now`, hitung `duration_minutes`
3. Return `{ success: true }`

Request body:
```json
{
  "attendanceId": "456"
}
```

### [NEW] `src/app/api/kelas-online/active-rooms/route.ts`

**`GET /api/kelas-online/active-rooms`** — Ambil daftar room aktif

Alur:
1. Verifikasi session
2. Query `tbl_kelas_online` WHERE `status = "active"`
3. Filter by kelas user (siswa hanya lihat kelas mereka, guru lihat kelas mereka, admin lihat semua)
4. Return array rooms dengan info guru, mata pelajaran, jumlah peserta saat ini

---

## 4. Halaman & Komponen Frontend

### Arsitektur Halaman

```
src/app/(dashboard)/
├── guru/
│   └── kelas-online/                 ← [NEW]
│       ├── page.tsx                   ← Dashboard kelas online guru
│       └── [roomId]/
│           └── page.tsx               ← Halaman video call guru (host)
│
├── siswa/
│   └── kelas-online/                 ← [NEW]
│       ├── page.tsx                   ← Daftar kelas online aktif
│       └── [roomId]/
│           └── page.tsx               ← Halaman video call siswa
│
├── admin/
│   └── kelas-online/                 ← [NEW]
│       └── page.tsx                   ← Log sesi + statistik monitoring
```

---

### [NEW] Komponen Shared

#### `src/components/kelas-online/video-room.tsx`

**Komponen utama embed Daily Prebuilt:**

```
Props:
- roomUrl: string         — URL room Daily.co
- token: string           — Meeting token
- userName: string        — Nama user
- isOwner: boolean        — Apakah host (guru)
- onLeave: () => void     — Callback saat keluar

Behavior:
- Menggunakan @daily-co/daily-react useCallFrame hook
- Embed Daily Prebuilt iframe full-width, full-height
- Handle events: joined-meeting, left-meeting, error
- Panggil onLeave saat user keluar (trigger API leave-room)
```

#### `src/components/kelas-online/room-card.tsx`

Card component untuk menampilkan info room:

```
Props:
- room: KelasOnline data
- variant: "active" | "ended"
- role: "guru" | "siswa"
- onJoin?: () => void
- onEnd?: () => void

Display:
- Badge status (🟢 AKTIF / ⚫ SELESAI)
- Nama guru, mata pelajaran, kelas
- Waktu mulai / durasi
- Jumlah peserta (jika aktif)
- Tombol aksi sesuai role dan status
```

#### `src/components/kelas-online/create-room-form.tsx`

Form untuk guru membuat room baru:

```
Fields:
- Mata Pelajaran (input text, opsional)

Actions:
- Tombol hijau besar "🎥 Buat Kelas Online"
- Loading state saat proses create
- Success → redirect ke halaman video call
```

#### `src/components/kelas-online/attendance-table.tsx`

Tabel kehadiran kelas online:

```
Columns:
- Nama Siswa
- Waktu Masuk
- Waktu Keluar
- Durasi (menit)

Used by:
- Halaman admin monitoring (detail per sesi)
- Halaman guru (riwayat kelas)
```

---

### [NEW] Halaman Guru — Kelas Online

#### `src/app/(dashboard)/guru/kelas-online/page.tsx`

**Guru Dashboard Kelas Online:**

```
Layout:
┌─────────────────────────────────────────────────────┐
│  📚 Kelas Online                                    │
│  Kelas: [Kelas 4 - Mehmed Al Fatih]                 │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  Buat Kelas Online Baru                      │    │
│  │  Mata Pelajaran: [________________]          │    │
│  │  ┌────────────────────────────────────────┐  │    │
│  │  │  🎥 BUAT KELAS ONLINE                 │  │    │
│  │  └────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  🟢 Kelas Aktif                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  Matematika — Dimulai 10 menit lalu          │    │
│  │  👥 12 peserta                               │    │
│  │  [Masuk Kelas]  [Akhiri Kelas]               │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  📋 Riwayat Kelas Online                             │
│  ┌──────────────────────────────────────────────┐    │
│  │  IPA — 08 Sep — 45 menit — 15 hadir          │    │
│  │  Matematika — 07 Sep — 60 menit — 12 hadir   │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

Data source (server component):
- Query `tbl_kelas_online` WHERE `guru_id = session.id`
- Separate active vs ended rooms
- Count attendance per room

#### `src/app/(dashboard)/guru/kelas-online/[roomId]/page.tsx`

**Halaman Video Call Guru (Host):**

```
Layout:
┌─────────────────────────────────────────────────────┐
│  ← Kembali   Matematika | Kelas 4 | 👥 12  ⏱ 25m  │
│  ──────────────────────────────────────────────────  │
│                                                      │
│                                                      │
│           ┌─────────────────────────┐                │
│           │                         │                │
│           │    DAILY PREBUILT       │                │
│           │    VIDEO CALL           │                │
│           │    (iframe embed)       │                │
│           │                         │                │
│           │                         │                │
│           └─────────────────────────┘                │
│                                                      │
│  ──────────────────────────────────────────────────  │
│                    [🛑 Akhiri Kelas]                 │
└─────────────────────────────────────────────────────┘
```

Behavior:
- Server component: fetch room data + generate meeting token (is_owner: true)
- Client component: embed Daily Prebuilt via `useCallFrame`
- Guru = host → bisa mute all, remove participants
- Tombol "Akhiri Kelas" → call API end-room → redirect ke list

---

### [NEW] Halaman Siswa — Kelas Online

#### `src/app/(dashboard)/siswa/kelas-online/page.tsx`

**Siswa Daftar Kelas Aktif:**

```
Layout:
┌─────────────────────────────────────────────────────┐
│  📚 Kelas Online                                    │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  🟢 SEDANG BERLANGSUNG                       │    │
│  │                                              │    │
│  │  📖 Matematika                               │    │
│  │  👨‍🏫 Ustadz Ahmad, S.Pd                      │    │
│  │  🏫 Kelas 4 - Mehmed Al Fatih                │    │
│  │  ⏰ Dimulai 10 menit lalu                    │    │
│  │                                              │    │
│  │  ┌────────────────────────────────────────┐  │    │
│  │  │    🎓 MULAI BELAJAR                    │  │    │
│  │  └────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  ── atau jika tidak ada kelas aktif ──               │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  📭 Tidak ada kelas online saat ini          │    │
│  │  Tunggu guru memulai kelas ya! 😊            │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  📋 Riwayat Kelas Sebelumnya                         │
│  ┌──────────────────────────────────────────────┐    │
│  │  IPA — 08 Sep 2026 — 45 menit               │    │
│  │  Matematika — 07 Sep 2026 — 60 menit        │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

Data source:
- Query `tbl_kelas_online` WHERE `kelas = session.kelas AND status = "active"`
- Query riwayat attendance siswa ini dari `tbl_kelas_online_attendance`

#### `src/app/(dashboard)/siswa/kelas-online/[roomId]/page.tsx`

**Halaman Video Call Siswa:**

```
Layout:
┌─────────────────────────────────────────────────────┐
│  ← Kembali   Matematika | 👨‍🏫 Ustadz Ahmad         │
│  ──────────────────────────────────────────────────  │
│                                                      │
│           ┌─────────────────────────┐                │
│           │                         │                │
│           │    DAILY PREBUILT       │                │
│           │    VIDEO CALL           │                │
│           │    (iframe embed)       │                │
│           │                         │                │
│           └─────────────────────────┘                │
│                                                      │
│  ──────────────────────────────────────────────────  │
│                  [📕 Keluar Kelas]                   │
└─────────────────────────────────────────────────────┘
```

Behavior:
- Siswa masuk dengan `is_owner: false`
- Tidak bisa mute orang lain
- Tombol "Keluar Kelas" → call API leave-room → redirect ke list

---

### [NEW] Halaman Admin — Monitoring

#### `src/app/(dashboard)/admin/kelas-online/page.tsx`

**Admin Monitoring Kelas Online:**

```
Layout:
┌─────────────────────────────────────────────────────┐
│  📊 Monitor Kelas Online                            │
│                                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│  │  📹  │ │  ⏱   │ │  📏  │ │  👥  │               │
│  │  24  │ │ 1080 │ │  45  │ │  18  │               │
│  │ Sesi │ │ Mnt  │ │ Avg  │ │ Avg  │               │
│  │Bulan │ │Total │ │Menit │ │Hadir │               │
│  └──────┘ └──────┘ └──────┘ └──────┘               │
│                                                      │
│  🟢 Kelas Aktif Sekarang                             │
│  ┌──────────────────────────────────────────────┐    │
│  │  Matematika — Kelas 4 — Ustadz Ahmad — 12👥 │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  📋 Log Semua Sesi                                   │
│  ┌──────────────────────────────────────────────┐    │
│  │ Guru    │ Kelas │ Mapel │ Mulai │ Durasi│Hadir│   │
│  │─────────┼───────┼───────┼───────┼───────┼─────│   │
│  │ Ahmad   │ K4    │ MTK   │ 08:00 │ 45m   │ 15  │   │
│  │ Fatimah │ K5    │ IPA   │ 09:00 │ 60m   │ 20  │   │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 5. Navigasi — Sidebar & Mobile

### [MODIFY] `src/components/layouts/sidebar.tsx`

Tambah menu item di setiap role:

```diff
+ import { Video, MonitorPlay } from "lucide-react";

 const adminMenu = [
   ...existing items...
+  { label: "Monitor Kelas Online", href: "/admin/kelas-online", icon: MonitorPlay },
 ];

 const guruMenu = [
   ...existing items...
+  { label: "Kelas Online", href: "/guru/kelas-online", icon: Video },
 ];

 const siswaMenu = [
   ...existing items...
+  { label: "Kelas Online", href: "/siswa/kelas-online", icon: Video },
 ];
```

### [MODIFY] `src/components/layouts/navbar.tsx`

Tambah menu yang sama di mobile navigation drawer.

---

## 6. Alur Sequence Diagram

### Alur "Guru Membuat Kelas Online"

```
Guru                  Frontend              API Route           Daily.co API        Database
 │                       │                      │                    │                  │
 │ Klik "Buat Kelas"     │                      │                    │                  │
 │──────────────────────>│                      │                    │                  │
 │                       │  POST /create-room   │                    │                  │
 │                       │─────────────────────>│                    │                  │
 │                       │                      │  POST /rooms       │                  │
 │                       │                      │───────────────────>│                  │
 │                       │                      │  { url, id, name } │                  │
 │                       │                      │<───────────────────│                  │
 │                       │                      │  POST /tokens      │                  │
 │                       │                      │───────────────────>│                  │
 │                       │                      │  { token }         │                  │
 │                       │                      │<───────────────────│                  │
 │                       │                      │  INSERT kelas_online                  │
 │                       │                      │─────────────────────────────────────>│
 │                       │  { roomId, url, tok }│                    │                  │
 │                       │<─────────────────────│                    │                  │
 │  Redirect ke video    │                      │                    │                  │
 │<──────────────────────│                      │                    │                  │
 │  Video call dimulai ✅ │                      │                    │                  │
```

### Alur "Siswa Masuk Kelas"

```
Siswa                 Frontend              API Route           Daily.co API        Database
 │                       │                      │                    │                  │
 │ Klik "Mulai Belajar"  │                      │                    │                  │
 │──────────────────────>│                      │                    │                  │
 │                       │  POST /join-room     │                    │                  │
 │                       │─────────────────────>│                    │                  │
 │                       │                      │  CHECK status=active                  │
 │                       │                      │─────────────────────────────────────>│
 │                       │                      │  POST /tokens      │                  │
 │                       │                      │───────────────────>│                  │
 │                       │                      │  { token }         │                  │
 │                       │                      │<───────────────────│                  │
 │                       │                      │  INSERT attendance                    │
 │                       │                      │─────────────────────────────────────>│
 │                       │  { url, token, attId}│                    │                  │
 │                       │<─────────────────────│                    │                  │
 │  Redirect ke video    │                      │                    │                  │
 │<──────────────────────│                      │                    │                  │
 │  Bergabung video ✅    │                      │                    │                  │
```

---

## 7. Desain UI/UX (Kid-Friendly)

### Prinsip Desain untuk Anak SD:
1. **Tombol besar** (min height 56px) dengan warna kontras (hijau cerah untuk aksi utama)
2. **Ikon jelas** — setiap tombol disertai emoji/ikon yang intuitif
3. **Teks sederhana** — "Mulai Belajar", "Masuk Kelas", bukan istilah teknis
4. **Status visual** — badge animasi pulse untuk kelas yang sedang berlangsung
5. **Feedback langsung** — loading spinner saat menunggu koneksi, toast notification saat berhasil/gagal
6. **Warna konsisten** — mengikuti design system emerald/green yang sudah ada di sidebar

---

## 8. Daftar Lengkap File yang Dibuat/Dimodifikasi

| # | Aksi | File | Deskripsi |
|---|------|------|-----------|
| 1 | MODIFY | `.env` | Tambah `DAILY_API_KEY` dan `NEXT_PUBLIC_DAILY_DOMAIN` |
| 2 | MODIFY | `package.json` | Install `@daily-co/daily-react` dan `@daily-co/daily-js` |
| 3 | MODIFY | `prisma/schema.prisma` | Tambah model `KelasOnline` + `KelasOnlineAttendance` |
| 4 | NEW | `src/lib/daily.ts` | Helper utility Daily.co REST API |
| 5 | NEW | `src/app/api/kelas-online/create-room/route.ts` | API buat room |
| 6 | NEW | `src/app/api/kelas-online/join-room/route.ts` | API join room |
| 7 | NEW | `src/app/api/kelas-online/end-room/route.ts` | API akhiri kelas |
| 8 | NEW | `src/app/api/kelas-online/leave-room/route.ts` | API catat keluar |
| 9 | NEW | `src/app/api/kelas-online/active-rooms/route.ts` | API list room aktif |
| 10 | NEW | `src/components/kelas-online/video-room.tsx` | Komponen embed Daily Prebuilt |
| 11 | NEW | `src/components/kelas-online/room-card.tsx` | Card info room |
| 12 | NEW | `src/components/kelas-online/create-room-form.tsx` | Form buat room |
| 13 | NEW | `src/components/kelas-online/attendance-table.tsx` | Tabel kehadiran |
| 14 | NEW | `src/app/(dashboard)/guru/kelas-online/page.tsx` | Halaman guru - list & buat |
| 15 | NEW | `src/app/(dashboard)/guru/kelas-online/[roomId]/page.tsx` | Halaman guru - video call |
| 16 | NEW | `src/app/(dashboard)/siswa/kelas-online/page.tsx` | Halaman siswa - list kelas aktif |
| 17 | NEW | `src/app/(dashboard)/siswa/kelas-online/[roomId]/page.tsx` | Halaman siswa - video call |
| 18 | NEW | `src/app/(dashboard)/admin/kelas-online/page.tsx` | Halaman admin - monitoring |
| 19 | MODIFY | `src/components/layouts/sidebar.tsx` | Tambah menu navigasi |
| 20 | MODIFY | `src/components/layouts/navbar.tsx` | Tambah menu mobile |

**Total: 16 file baru + 4 file dimodifikasi = 20 file**

---

## 9. Urutan Implementasi (Fase)

### Fase 1: Foundation (Database + API + Daily Helper)
1. Update `.env` dengan Daily.co credentials
2. Install npm dependencies (`@daily-co/daily-react`, `@daily-co/daily-js`)
3. Update Prisma schema → run `npx prisma db push`
4. Buat `src/lib/daily.ts` (helper)
5. Buat semua 5 API routes

### Fase 2: Komponen Shared
6. Buat `video-room.tsx` (Daily Prebuilt embed)
7. Buat `room-card.tsx`
8. Buat `create-room-form.tsx`
9. Buat `attendance-table.tsx`

### Fase 3: Halaman Guru
10. Buat halaman list & create (`/guru/kelas-online`)
11. Buat halaman video call (`/guru/kelas-online/[roomId]`)

### Fase 4: Halaman Siswa
12. Buat halaman list kelas aktif (`/siswa/kelas-online`)
13. Buat halaman video call (`/siswa/kelas-online/[roomId]`)

### Fase 5: Admin Monitoring
14. Buat halaman monitoring admin (`/admin/kelas-online`)

### Fase 6: Navigasi & Polish
15. Update `sidebar.tsx` + `navbar.tsx`
16. Testing end-to-end

---

## 10. Verification Plan

### Automated Tests
```bash
# Pastikan build berhasil tanpa error
npm run build

# Pastikan Prisma schema valid
npx prisma validate

# Pastikan database schema ter-sync
npx prisma db push
```

### Manual Verification
1. **Guru Flow:** Login guru → menu Kelas Online → Buat Kelas → Masuk video → Akhiri kelas
2. **Siswa Flow:** Login siswa → menu Kelas Online → Lihat kelas aktif → Mulai Belajar → Video call → Keluar
3. **Admin Flow:** Login admin → Monitor Kelas Online → Lihat log sesi + statistik
4. **Cross-test:** Guru buat kelas → siswa di kelas sama bisa lihat & join → attendance tercatat

---

## 11. Catatan Teknis Tambahan

### Daily.co Free Tier Limits
- 100 participants per room
- 2.000 participant-minutes/month
- Unlimited rooms
- Daily Prebuilt UI included

### Keamanan
- Room dibuat `private` → butuh meeting token untuk join
- Token di-generate server-side via API route (tidak exposed ke client)
- Token punya expiry time (exp)
- Guru = `is_owner: true` (bisa mute, kick)
- Siswa = `is_owner: false` (hanya bisa lihat & dengar)
- Kelas filter di API: siswa hanya bisa join room yang kelasnya sesuai

### Performance
- Daily Prebuilt di-embed sebagai iframe → tidak menambah bundle size signifikan
- API routes menggunakan existing Prisma client (singleton)
- Room cleanup otomatis saat guru akhiri kelas
