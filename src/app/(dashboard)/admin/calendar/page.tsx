import prisma from "@/lib/prisma";
import { CalendarClient } from "@/components/calendar/calendar-client";

export const dynamic = "force-dynamic";

export default async function AdminCalendarPage() {
  const classes = await prisma.kelas.findMany({
    orderBy: { nama_kelas: "asc" },
  });

  const categories = [
    "Akademik",
    "Keagamaan",
    "Ujian",
    "Libur",
    "Ekstrakurikuler",
    "Meeting",
    "Semua Kelas",
    ...classes.map((c) => c.nama_kelas),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Kalender Kegiatan Akademik</h1>
        <p className="text-sm text-muted-foreground">
          Kelola agenda kegiatan sekolah, jadwal ujian, field trip, dan kegiatan khusus per jenjang kelas.
        </p>
      </div>

      <div className="w-full">
        <CalendarClient canManage={true} categories={categories} />
      </div>
    </div>
  );
}

