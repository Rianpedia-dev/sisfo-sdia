import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  Trophy,
  Award,
  User,
  Sparkles,
} from "lucide-react";
import { ClipboardListIcon } from "@/components/ui/clipboard-list-icon";
import { CalendarDaysIcon } from "@/components/ui/calendar-days-icon";
import { StatCard } from "@/components/stat-card";
import { AnnouncementTimeline } from "@/components/announcement-timeline";
import { PrayerScheduleWidget } from "@/components/prayer-schedule-widget";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getDefaultProfileImage, getUserProfileImage } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SiswaDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "siswa") {
    redirect("/login");
  }

  const studentClass = session.kelas || "";

  let kelasInfo: any = null;
  let totalHadirMonth = 0;
  let totalEventsMonth = 0;
  let classmates: any[] = [];
  let bestStudents: any[] = [];
  let achievements: any[] = [];
  let announcements: any[] = [];
  let prayerToday: any = null;
  let studentImage: string | null = session.image || null;
  let studentPoint = (session as any).point || "0";
  let studentNis = session.nis || "-";
  let studentName = session.name || "Siswa";

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;
  const currentMonthStr = String(currentMonthNum).padStart(2, "0");
  const todayStr = `${currentYear}-${currentMonthStr}-${String(now.getDate()).padStart(2, "0")}`;
  const currentYearMonth = `${currentYear}-${currentMonthStr}`;

  const startOfMonth = new Date(currentYear, now.getMonth(), 1, 0, 0, 0, 0);
  const endOfMonth = new Date(currentYear, now.getMonth() + 1, 0, 23, 59, 59, 999);

  try {
    const isNum = /^\d+$/.test(session.id);
    const userIdBigInt = isNum ? BigInt(session.id) : null;
    const [dbUser, dbKelas, dbHadirMonth, dbEventsMonth, dbClassmates, dbBest, dbPrestasi, dbAnnounce, dbPrayer] =
      await Promise.all([
        userIdBigInt
          ? prisma.user.findUnique({
              where: { id: userIdBigInt },
              select: { image: true, point: true, nis: true, name: true, gender: true },
            })
          : null,
        studentClass
          ? prisma.kelas.findFirst({
              where: { nama_kelas: studentClass },
            })
          : null,
        userIdBigInt
          ? prisma.absen.count({
              where: {
                user_id: userIdBigInt,
                date: { startsWith: currentYearMonth },
                keterangan: { in: ["Hadir", "hadir", "H"] },
              },
            })
          : 0,
        prisma.event.count({
          where: {
            AND: [
              {
                OR: [
                  { kelas: "Semua Kelas" },
                  ...(studentClass ? [{ kelas: studentClass }] : []),
                  { from: "admin" },
                  { kelas: "Umum" },
                ],
              },
              {
                start: { lte: endOfMonth },
              },
              {
                OR: [
                  { end: { gte: startOfMonth } },
                  { end: null, start: { gte: startOfMonth } },
                ],
              },
            ],
          },
        }),
        studentClass
          ? prisma.user.findMany({
              where: { kelas: studentClass, status: "1" },
            })
          : [],
        studentClass
          ? prisma.bestStudent.findMany({
              where: { kelas: studentClass },
              orderBy: { created_at: "desc" },
              take: 4,
            })
          : [],
        prisma.prestasi.findMany({
          orderBy: { created_at: "desc" },
          take: 5,
        }),
        prisma.pengumuman.findMany({
          where: {
            OR: [{ from: "IT" }, { from: studentClass }],
          },
          orderBy: { id: "desc" },
          take: 10,
        }),
        isNum
          ? prisma.prayer.findUnique({
              where: {
                id_date: {
                  id: parseInt(session.id, 10),
                  date: todayStr,
                },
              },
            })
          : null,
      ]);

    const normalizeName = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
    const photoMap = new Map<string, string | null>();
    const genderMap = new Map<string, string | null>();
    dbClassmates.forEach((u) => {
      if (u.image) {
        photoMap.set(normalizeName(u.name), u.image);
      }
      genderMap.set(normalizeName(u.name), u.gender);
    });

    kelasInfo = dbKelas;
    totalHadirMonth = dbHadirMonth;
    totalEventsMonth = dbEventsMonth;
    classmates = dbClassmates;
    bestStudents = dbBest.map((bs) => {
      const g = genderMap.get(normalizeName(bs.name));
      return {
        ...bs,
        gender: g,
        foto: bs.foto || photoMap.get(normalizeName(bs.name)) || getDefaultProfileImage(g),
      };
    });
    achievements = dbPrestasi;
    announcements = dbAnnounce;
    prayerToday = dbPrayer;

    // Student identity info
    studentImage = getUserProfileImage(dbUser?.image || session.image, dbUser?.gender || (session as any).gender);
    studentPoint = dbUser?.point || (session as any).point || "0";
    studentNis = dbUser?.nis || session.nis || "-";
    studentName = dbUser?.name || session.name || "Siswa";
  } catch (e) {
    console.error("Database query error in siswa dashboard:", e);
  }

  let completedPrayers = 0;
  if (prayerToday) {
    if (prayerToday.subuh === "1") completedPrayers++;
    if (prayerToday.dhuha === "1") completedPrayers++;
    if (prayerToday.dzuhur === "1") completedPrayers++;
    if (prayerToday.ashar === "1") completedPrayers++;
    if (prayerToday.maghrib === "1") completedPrayers++;
    if (prayerToday.isya === "1") completedPrayers++;
  }

  if (!kelasInfo) {
    kelasInfo = { wali_kelas: "-", nama_kelas: studentClass || "Belum ditentukan" };
  }

  let waliKelas = kelasInfo?.wali_kelas;
  if ((!waliKelas || waliKelas === "-" || waliKelas === "Belum ditentukan") && studentClass) {
    try {
      const teacher = await prisma.user.findFirst({
        where: {
          kelas: studentClass,
          status: { in: ["2", "4"] },
        },
        select: { name: true },
      });
      if (teacher?.name) {
        waliKelas = teacher.name;
      }
    } catch (e) {
      console.error("Error fetching teacher wali_kelas fallback:", e);
    }
  }

  // 3. Best point in class
  const studentWithMaxPoints = [...classmates].sort(
    (a, b) => (parseInt(b.point || "0", 10) || 0) - (parseInt(a.point || "0", 10) || 0)
  )[0];

  const formattedAnnouncements = announcements.map((p) => ({
    id: p.id.toString(),
    from: p.from,
    title: p.title,
    file: p.file,
    pengumuman: p.pengumuman,
    like: p.like,
    created_at: p.created_at,
  }));

  return (
    <div className="space-y-8">
      {/* Premium Hero Banner Siswa */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 p-5 sm:p-7 md:p-8 text-white shadow-xl border border-emerald-500/30">
        {/* Decorative Ambient Lighting & Glows */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-teal-400/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        {/* Decorative subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Greeting */}
          <div className="space-y-2 max-w-2xl">
            <h1 dir="ltr" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              <span dir="rtl" className="inline-block">السَّلاَمُ عَلَيْكُمْ</span>,{" "}
              <span className="bg-gradient-to-r from-emerald-200 via-teal-100 to-white bg-clip-text text-transparent">
                {studentName}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/85 font-normal leading-relaxed">
              Selamat datang kembali di portal pembelajaran SD Islam Al-Azhar Cairo Palembang. Semangat belajar dan raih prestasi terbaik hari ini!
            </p>
          </div>

          {/* Right: Glassmorphic Status Card (Kelas, Wali, NIS) */}
          <div className="flex flex-col gap-2 rounded-2xl bg-white/10 hover:bg-white/[0.12] backdrop-blur-md border border-white/15 p-4 sm:p-4.5 shadow-xl transition-all duration-300 shrink-0 lg:min-w-[260px]">
            <div className="flex items-center justify-between gap-3">
              <div className="font-bold text-sm text-emerald-200">
                <span className="truncate">{studentClass || "Rombel Umum"}</span>
              </div>
              <Badge variant="outline" className="bg-emerald-500/20 border-emerald-400/30 text-[10px] text-emerald-300 py-0.5">
                Aktif
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-100/75 pt-1">
              <User className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Wali: <strong className="text-white font-medium">{waliKelas || "Belum ditentukan"}</strong></span>
            </div>

            <div className="pt-2 mt-0.5 border-t border-white/10 text-xs">
              <span className="text-[11px] font-mono text-emerald-200/70">
                NIS: {studentNis}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Banner: Status Sholat Hari Ini */}
      <Card className="border border-border bg-card overflow-hidden rounded-xl">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm sm:text-base font-bold text-foreground">Mutaba&apos;ah Sholat Hari Ini</p>
              <Badge className={completedPrayers === 6 ? "bg-primary text-primary-foreground font-mono text-xs px-2 py-0.5 rounded-md" : "bg-muted text-muted-foreground font-mono text-xs px-2 py-0.5 rounded-md"}>
                {completedPrayers}/6 Selesai
              </Badge>
            </div>
          </div>
          <Link href="/siswa/prayers" className="w-full sm:w-auto shrink-0">
            <Button variant="default" size="default" className="w-full sm:w-auto">
              {completedPrayers === 6 ? "Lihat Catatan Sholat" : "Buka Checklist Sholat"}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* 4 Stat Cards per PRD 7.4.1 */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Hadir Bulan Ini"
          value={`${totalHadirMonth} Hari`}
          icon={ClipboardListIcon}
          description="Total kehadiran bulan ini"
          variant="primary"
          href="/siswa/attendance"
        />
        <StatCard
          title="Kegiatan Bulan Ini"
          value={`${totalEventsMonth} Kegiatan`}
          icon={CalendarDaysIcon}
          description="Agenda kalender sekolah"
          variant="accent"
          href="/siswa/calendar"
        />
        <StatCard
          title="Best Point"
          value={studentWithMaxPoints?.name || "-"}
          icon={Trophy}
          description={studentWithMaxPoints ? `${studentWithMaxPoints.point || 0} Poin Tertinggi` : "Belum ada poin"}
          variant="secondary"
          href="/siswa/best-point"
          valueClassName="text-base sm:text-lg lg:text-xl font-bold leading-snug line-clamp-2 break-words"
        />
        <StatCard
          title="Poin Saya"
          value={`${session.role === "siswa" ? (classmates.find((c) => c.id.toString() === session.id)?.point || "0") : "0"} Poin`}
          icon={Award}
          description="Poin reward Anda"
          variant="amber"
          href="/siswa/best-student"
        />
      </div>

      {/* Jadwal Sholat Hari Ini (API Palembang) per PRD Section 10.1 */}
      <PrayerScheduleWidget />

      {/* 2 Columns: Announcements + Best Student / Prestasi */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Timeline Pengumuman */}
        <div className="space-y-3.5 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Pengumuman Sekolah & Kelas</h2>
          </div>
          <AnnouncementTimeline
            announcements={formattedAnnouncements}
            userRole="siswa"
            canManage={false}
          />
        </div>

        {/* Best Student Carousel & Prestasi Siswa */}
        <div className="space-y-6 lg:col-span-5">
          {/* Best Student Box */}
          <Card className="border border-purple-500/20 rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Best Student Kelas</CardTitle>
                <Link
                  href="/siswa/best-student"
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Lihat Semua
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {bestStudents.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4 italic">
                  Belum ada Best Student di kelas ini.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {bestStudents.map((bs) => (
                    <div
                      key={bs.id.toString()}
                      className="flex flex-col items-center justify-center rounded-xl border bg-card p-3 text-center transition-all hover:shadow-xs"
                    >
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-base mb-2 overflow-hidden border border-purple-200">
                        <UserAvatar
                          src={bs.foto}
                          gender={bs.gender}
                          alt={bs.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="font-bold text-xs truncate w-full">{bs.name}</p>
                      <Badge variant="secondary" className="mt-1 text-[10px] bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 truncate w-full">
                        {bs.kategori}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prestasi Siswa */}
          <Card className="border border-amber-500/20 rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Prestasi Teman Sekolah</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4 italic">
                  Belum ada catatan prestasi.
                </p>
              ) : (
                achievements.map((ach) => (
                  <div
                    key={ach.id.toString()}
                    className="flex items-center gap-3 rounded-lg border p-2.5 text-xs transition-colors hover:bg-muted/30"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                      🏆
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground truncate">{ach.prestasi}</p>
                      <p className="text-muted-foreground truncate">{ach.nama} • {ach.kelas}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
