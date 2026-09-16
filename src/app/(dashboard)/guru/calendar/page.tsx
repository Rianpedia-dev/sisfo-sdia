import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CalendarClient } from "@/components/calendar/calendar-client";

export const dynamic = "force-dynamic";

export default async function GuruCalendarPage() {
  const session = await getSession();
  if (!session || session.role !== "guru") {
    redirect("/login");
  }

  const guruClass = session.kelas || "Umum";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Kalender Kegiatan Kelas</h1>
      </div>

      <div className="w-full">
        <CalendarClient
          canManage={true}
          categories={["Akademik", "Keagamaan", "Ujian", "Libur", "Ekstrakurikuler", guruClass]}
        />
      </div>
    </div>
  );
}

