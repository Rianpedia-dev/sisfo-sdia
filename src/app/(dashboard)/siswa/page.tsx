import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  AlertTriangle,
  Clock,
  Trophy,
  Award,
  School,
  User,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { AnnouncementTimeline } from "@/components/announcement-timeline";
import { PrayerScheduleWidget } from "@/components/prayer-schedule-widget";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SiswaDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "siswa") {
    redirect("/login");
  }

  const studentClass = session.kelas || "";

  let kelasInfo: any = null;
  let totalViolations = 0;
  let totalLateness = 0;
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
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  try {
    const isNum = /^\d+$/.test(session.id);
    const [dbUser, dbKelas, dbVio, dbLate, dbClassmates, dbBest, dbPrestasi, dbAnnounce, dbPrayer] =
      await Promise.all([
        isNum
          ? prisma.user.findUnique({
              where: { id: BigInt(session.id) },
              select: { image: true, point: true, nis: true, name: true },
            })
          : null,
        studentClass
          ? prisma.kelas.findFirst({
              where: { nama_kelas: studentClass },
            })
          : null,
        prisma.pelanggaran.count({
          where: { user_id: session.id },
        }),
        isNum
          ? prisma.keterlambatan.count({
              where: { user_id: BigInt(session.id) },
            })
          : 0,
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
          orderBy: { created_at: "desc" },
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
    dbClassmates.forEach((u) => {
      if (u.image) {
        photoMap.set(normalizeName(u.name), u.image);
      }
    });

    kelasInfo = dbKelas;
    totalViolations = dbVio;
    totalLateness = dbLate;
    classmates = dbClassmates;
    bestStudents = dbBest.map((bs) => ({
      ...bs,
      foto: bs.foto || photoMap.get(normalizeName(bs.name)) || null,
    }));
    achievements = dbPrestasi;
    announcements = dbAnnounce;
    prayerToday = dbPrayer;

    // Student identity info
    studentImage = dbUser?.image || session.image || null;
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Assalamu&apos;alaikum,{" "}
              <span className="bg-gradient-to-r from-emerald-200 via-teal-100 to-white bg-clip-text text-transparent">
                {studentName}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/85 font-normal leading-relaxed">
              Selamat datang kembali di portal pembelajaran SD Islam Al-Azhar Cairo Palembang. Semangat belajar dan raih prestasi terbaik hari ini!
            </p>
          </div>

          {/* Right: Glassmorphic Status Card (Kelas, Wali, Poin, NIS) */}
          <div className="flex flex-col gap-2 rounded-2xl bg-white/10 hover:bg-white/[0.12] backdrop-blur-md border border-white/15 p-4 sm:p-4.5 shadow-xl transition-all duration-300 shrink-0 lg:min-w-[260px]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-200">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/30 border border-emerald-400/30 text-emerald-300">
                  <School className="h-4 w-4" />
                </div>
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

            <div className="flex items-center justify-between gap-3 pt-2.5 mt-1 border-t border-white/10 text-xs">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>{studentPoint} Poin Reward</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-200/70">
                NIS: {studentNis}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Banner: Status Sholat Hari Ini */}
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-background to-background shadow-sm overflow-hidden">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground">Mutaba&apos;ah Sholat Hari Ini</p>
                <Badge className={completedPrayers === 6 ? "bg-emerald-600 font-mono text-xs" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono text-xs"}>
                  {completedPrayers}/6 Selesai
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedPrayers === 6
                  ? "Alhamdulillah, seluruh checklist ibadah hari ini telah lengkap!"
                  : `Ada ${6 - completedPrayers} sholat yang belum dicatat. Sentuh tombol untuk mengisi.`
                }
              </p>
            </div>
          </div>
          <Link href="/siswa/prayers" className="w-full sm:w-auto shrink-0">
            <Button variant="launch" size="lg" className="w-full sm:w-auto">
              {completedPrayers === 6 ? "Lihat Catatan Sholat" : "Buka Checklist Sholat"}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* 4 Stat Cards per PRD 7.4.1 */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Pelanggaran"
          value={totalViolations}
          icon={AlertTriangle}
          description="Total catatan kedisiplinan"
          variant={totalViolations > 0 ? "rose" : "emerald"}
        />
        <StatCard
          title="Keterlambatan"
          value={totalLateness}
          icon={Clock}
          description="Catatan hadir terlambat"
          variant={totalLateness > 0 ? "amber" : "blue"}
        />
        <StatCard
          title="Best Point"
          value={studentWithMaxPoints?.name ? studentWithMaxPoints.name.split(" ")[0] : "-"}
          icon={Trophy}
          description={studentWithMaxPoints ? `${studentWithMaxPoints.point || 0} Poin Tertinggi` : "Belum ada poin"}
          variant="amber"
        />
        <StatCard
          title="Poin Saya"
          value={`${session.role === "siswa" ? (classmates.find((c) => c.id.toString() === session.id)?.point || "0") : "0"} Poin`}
          icon={Award}
          description="Poin reward Anda"
          variant="purple"
        />
      </div>

      {/* Jadwal Sholat Hari Ini (API Palembang) per PRD Section 10.1 */}
      <PrayerScheduleWidget />

      {/* 2 Columns: Announcements + Best Student / Prestasi */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Timeline Pengumuman */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Pengumuman Sekolah & Kelas</h2>
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
          <Card className="border-purple-500/20 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-base">Best Student Kelas</CardTitle>
                </div>
                <Link
                  href="/siswa/best-student"
                  className="text-xs font-semibold text-purple-600 hover:underline"
                >
                  Lihat Semua
                </Link>
              </div>
              <CardDescription>Siswa teladan kelas {studentClass}</CardDescription>
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
                      className="flex flex-col items-center justify-center rounded-xl border bg-card p-3 text-center transition-all hover:shadow-sm"
                    >
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-base mb-2 overflow-hidden border border-purple-200">
                        {bs.foto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={bs.foto} alt={bs.name} className="h-full w-full object-cover" />
                        ) : (
                          bs.name.substring(0, 2).toUpperCase()
                        )}
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
          <Card className="border-amber-500/20 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
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
