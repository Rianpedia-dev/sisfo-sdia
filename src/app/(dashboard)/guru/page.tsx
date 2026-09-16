import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Users, Trophy, Award, Sparkles, School } from "lucide-react";
import { ClipboardListIcon } from "@/components/ui/clipboard-list-icon";
import { StatCard } from "@/components/stat-card";
import { AnnouncementTimeline } from "@/components/announcement-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getDefaultProfileImage } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GuruDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "guru") {
    redirect("/login");
  }

  const guruClass = session.kelas || "";
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  let students: any[] = [];
  let attendanceToday = 0;
  let totalAbsenToday = 0;
  let bestStudents: any[] = [];
  let achievements: any[] = [];
  let announcements: any[] = [];

  try {
    const [dbStudents, dbAttHadir, dbAttTotal, dbBest, dbAchieve, dbAnnounce] =
      await Promise.all([
        guruClass
          ? prisma.user.findMany({
              where: { kelas: guruClass, status: "1" },
              orderBy: { name: "asc" },
            })
          : [],
        guruClass
          ? prisma.absen.count({
              where: {
                kelas: guruClass,
                date: todayStr,
                keterangan: "Hadir",
              },
            })
          : 0,
        guruClass
          ? prisma.absen.count({
              where: { kelas: guruClass, date: todayStr },
            })
          : 0,
        guruClass
          ? prisma.bestStudent.findMany({
              where: { kelas: guruClass },
              orderBy: { created_at: "desc" },
              take: 6,
            })
          : [],
        prisma.prestasi.findMany({
          orderBy: { created_at: "desc" },
          take: 5,
        }),
        prisma.pengumuman.findMany({
          where: {
            OR: [{ from: "IT" }, { from: guruClass }],
          },
          orderBy: { id: "desc" },
          take: 10,
        }),
      ]);

    const normalizeName = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
    const photoMap = new Map<string, string | null>();
    const genderMap = new Map<string, string | null>();
    dbStudents.forEach((u) => {
      if (u.image) {
        photoMap.set(normalizeName(u.name), u.image);
      }
      genderMap.set(normalizeName(u.name), u.gender);
    });

    students = dbStudents;
    attendanceToday = dbAttHadir;
    totalAbsenToday = dbAttTotal;
    bestStudents = dbBest.map((bs) => {
      const g = genderMap.get(normalizeName(bs.name));
      return {
        ...bs,
        gender: g,
        foto: bs.foto || photoMap.get(normalizeName(bs.name)) || getDefaultProfileImage(g),
      };
    });
    achievements = dbAchieve;
    announcements = dbAnnounce;
  } catch (e) {
    console.error("Database query error in guru dashboard:", e);
  }

  // 3. Best Point student in this class
  const studentWithMaxPoints = [...students].sort(
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

  const todayFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Assalamu&apos;alaikum, {session.name}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1 font-normal">
            <span>Wali Kelas: <strong className="text-foreground font-medium">{guruClass || "Belum ditentukan"}</strong></span>
          </p>
        </div>
      </div>

      {/* Quick Action Banner: Status Absensi Hari Ini (Hanya muncul jika belum melakukan absensi hari ini) */}
      {totalAbsenToday === 0 && (
        <Card className="border border-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20 overflow-hidden rounded-xl">
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-xs bg-amber-500">
                <ClipboardListIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm sm:text-base font-bold text-foreground">Presensi Kelas Hari Ini</p>
                  <Badge className="bg-amber-500 text-white font-mono text-xs px-2 py-0.5">
                    Belum Diisi
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Link href={`/guru/attendance/${todayFormatted}`} className="flex-1 sm:flex-none">
                <Button variant="default" size="default" className="w-full sm:w-auto">
                  Isi Presensi Sekarang
                </Button>
              </Link>
              <Link href={`/guru/attendance/table/${todayFormatted}`} className="hidden sm:inline-flex">
                <Button variant="outline" size="default">
                  Tabel Matriks
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4 Stat Cards per PRD 7.3.1 */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Kelas Saya"
          value={`${students.length} Siswa`}
          icon={Users}
          description={guruClass || "Belum ada kelas"}
          variant="primary"
          href="/guru/my-class"
        />
        <StatCard
          title="Absensi Hari Ini"
          value={totalAbsenToday > 0 ? `${attendanceToday} Hadir` : "Belum diisi"}
          icon={ClipboardListIcon}
          description={totalAbsenToday > 0 ? `Dari ${students.length} siswa` : "Buka form absen"}
          variant="accent"
          href={`/guru/attendance/${todayFormatted}`}
        />
        <StatCard
          title="Best Point"
          value={studentWithMaxPoints?.name || "-"}
          icon={Trophy}
          description={studentWithMaxPoints ? `${studentWithMaxPoints.point || 0} Poin Reward` : "Belum ada poin"}
          variant="secondary"
          href="/guru/best-point"
          valueClassName="text-base sm:text-lg lg:text-xl font-bold leading-snug line-clamp-2 break-words"
        />
        <StatCard
          title="Best Student"
          value={`${bestStudents.length} Siswa`}
          icon={Award}
          description="Siswa teladan kelas"
          variant="amber"
          href="/guru/best-student"
        />
      </div>

      {/* 2 Columns: Announcements + Best Student & Prestasi */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Timeline Pengumuman */}
        <div className="space-y-3.5 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Timeline Pengumuman</h2>
          </div>
          <AnnouncementTimeline
            announcements={formattedAnnouncements}
            userRole="guru"
            canManage={false}
          />
        </div>

        {/* Right side: Best Student Carousel & Prestasi Siswa */}
        <div className="space-y-6 lg:col-span-5">
          {/* Best Student Box */}
          <Card className="border border-purple-500/20 rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Best Student Kelas</CardTitle>
                <Link
                  href="/guru/best-student"
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Kelola
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {bestStudents.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4 italic">
                  Belum ada Best Student yang ditambahkan.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bestStudents.map((bs) => (
                    <div
                      key={bs.id.toString()}
                      className="flex flex-col items-center justify-center rounded-xl border bg-card p-3 text-center transition-all hover:shadow-sm"
                    >
                      <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg mb-2 overflow-hidden border border-purple-200">
                        <UserAvatar
                          src={bs.foto}
                          gender={bs.gender}
                          alt={bs.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="font-bold text-xs truncate w-full">{bs.name}</p>
                      <Badge variant="secondary" className="mt-1 text-[10px] bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        {bs.kategori}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prestasi Siswa Section */}
          <Card className="border border-amber-500/20 rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Prestasi Terkini</CardTitle>
                <Link
                  href="/guru/achievements"
                  className="text-xs font-semibold text-amber-600 hover:underline"
                >
                  Lihat Semua
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4 italic">
                  Belum ada prestasi siswa dicatat.
                </p>
              ) : (
                achievements.map((ach) => (
                  <div
                    key={ach.id.toString()}
                    className="flex items-center gap-3 rounded-lg border p-2.5 text-xs transition-colors hover:bg-muted/30"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
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
