import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ClipboardListIcon } from "@/components/ui/clipboard-list-icon";
import { AttendanceHistoryClient } from "./attendance-history-client";

export const dynamic = "force-dynamic";

export default async function SiswaAttendancePage() {
  const session = await getSession();
  if (!session || session.role !== "siswa") {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <ClipboardListIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Kehadiran Presensi</h1>
          <p className="text-xs text-muted-foreground">Catatan presensi dan kehadiran bulanan Anda</p>
        </div>
      </div>

      <AttendanceHistoryClient />
    </div>
  );
}
