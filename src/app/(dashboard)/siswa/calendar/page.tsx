import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CalendarClient } from "@/components/calendar/calendar-client";

export const dynamic = "force-dynamic";

export default async function SiswaCalendarPage() {
  const session = await getSession();
  if (!session || session.role !== "siswa") {
    redirect("/login");
  }

  const siswaClass = session.kelas || "Umum";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Kalender Kegiatan Sekolah</h1>
      </div>

      <div className="w-full">
        <CalendarClient
          canManage={false}
          categories={["Akademik", "Keagamaan", "Ujian", "Libur", "Ekstrakurikuler", siswaClass]}
        />
      </div>
    </div>
  );
}

