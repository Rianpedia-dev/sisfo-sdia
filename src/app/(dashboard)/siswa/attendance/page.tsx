import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Clock } from "lucide-react";
import { AttendanceHistoryClient } from "./attendance-history-client";

export const dynamic = "force-dynamic";

export default async function SiswaAttendancePage() {
  const session = await getSession();
  if (!session || session.role !== "siswa") {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Kehadiran Presensi</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Pantau catatan absensi harian dan rekapitulasi kehadiran Anda di sekolah.
        </p>
      </div>

      <AttendanceHistoryClient />
    </div>
  );
}
