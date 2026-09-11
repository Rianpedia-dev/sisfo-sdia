import prisma from "@/lib/prisma";
import { Users, GraduationCap, UserCheck, UserX, ShieldAlert } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { AnnouncementTimeline } from "@/components/announcement-timeline";
import { CalendarWidget } from "@/components/calendar-widget";
import { AdminRestrictTable } from "./restrict-table";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let totalSiswa = 0;
  let totalGuru = 0;
  let totalAktif = 0;
  let totalNonAktif = 0;
  let formattedAnnouncements: any[] = [];
  let formattedRestricts: any[] = [];

  try {
    const [siswaCount, guruCount, aktifCount, nonAktifCount, pengumumanList, restricts] =
      await Promise.all([
        prisma.user.count({ where: { status: "1" } }),
        prisma.user.count({ where: { status: { in: ["2", "4"] } } }),
        prisma.user.count({ where: { status: { not: "0" } } }),
        prisma.user.count({ where: { status: "0" } }),
        prisma.pengumuman.findMany({
          orderBy: { created_at: "desc" },
          take: 10,
        }),
        prisma.restrict.findMany({
          orderBy: { nama_kelas: "asc" },
        }),
      ]);

    totalSiswa = siswaCount;
    totalGuru = guruCount;
    totalAktif = aktifCount;
    totalNonAktif = nonAktifCount;

    formattedAnnouncements = pengumumanList.map((p) => ({
      id: p.id.toString(),
      from: p.from,
      title: p.title,
      file: p.file,
      pengumuman: p.pengumuman,
      like: p.like,
      created_at: p.created_at,
    }));

    formattedRestricts = restricts.map((r) => ({
      id: r.id.toString(),
      nama_kelas: r.nama_kelas,
      code_restrict: r.code_restrict,
    }));
  } catch (e) {
    console.error("Database query error in Admin Dashboard:", e);
  }

  return (
    <div className="space-y-8">
      {/* Header Page */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Dashboard Administrator
        </h1>
        <p className="text-base text-muted-foreground mt-1 font-normal">
          Selamat datang di panel kontrol Sistem Informasi SD Islam Al-Azhar Cairo Palembang.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Jumlah Siswa"
          value={totalSiswa}
          icon={GraduationCap}
          description="Total siswa aktif"
          variant="emerald"
        />
        <StatCard
          title="Jumlah Guru"
          value={totalGuru}
          icon={Users}
          description="Total dewan pengajar"
          variant="blue"
        />
        <StatCard
          title="Akun Aktif"
          value={totalAktif}
          icon={UserCheck}
          description="Pengguna terverifikasi"
          variant="amber"
        />
        <StatCard
          title="Akun Non-Aktif"
          value={totalNonAktif}
          icon={UserX}
          description="Menunggu verifikasi admin"
          variant="rose"
        />
      </div>

      {/* Grid: Pengumuman (7 col) & Kalender (5 col) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Timeline Pengumuman */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Timeline Pengumuman</h2>
          </div>
          <AnnouncementTimeline
            announcements={formattedAnnouncements}
            userRole="admin"
            canManage={true}
          />
        </div>

        {/* Kalender Kegiatan */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Kalender Kegiatan</h2>
          </div>
          <CalendarWidget canManage={true} />
        </div>
      </div>

      {/* Tabel Code Restrict */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-emerald-600" />
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Kode Restrict iPad per Kelas</h2>
        </div>
        <AdminRestrictTable initialData={formattedRestricts} />
      </div>
    </div>
  );
}
