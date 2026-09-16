import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import { ClipboardListIcon } from "@/components/ui/clipboard-list-icon";
import { DailyAttendanceForm } from "./daily-attendance-form";
import { formatDateIndo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GuruDailyAttendancePage(props: {
  params: Promise<{ date: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "guru") {
    redirect("/login");
  }

  const { date } = await props.params;
  const guruClass = session.kelas || "";

  let students: any[] = [];
  let existingAbsen: any[] = [];

  try {
    const [dbStudents, dbAbsen] = await Promise.all([
      guruClass
        ? prisma.user.findMany({
            where: { kelas: guruClass, status: "1" },
            orderBy: { name: "asc" },
          })
        : [],
      prisma.absen.findMany({
        where: {
          kelas: guruClass,
          date: date,
        },
      }),
    ]);
    students = dbStudents;
    existingAbsen = dbAbsen;
  } catch (e) {
    console.error("Database query error in daily attendance:", e);
  }

  const absenMap = new Map();
  existingAbsen.forEach((a) => {
    absenMap.set(a.user_id.toString(), a.keterangan || "Hadir");
  });

  const initialRecords = students.map((s) => ({
    user: {
      id: s.id.toString(),
      name: s.name,
      nis: s.nis,
      gender: s.gender,
      email: s.email,
      status: s.status,
    },
    keterangan: absenMap.get(s.id.toString()) || "Hadir",
  }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/guru/attendance"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Kalender Presensi
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <ClipboardListIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Form Presensi Harian: {formatDateIndo(date)}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelas: <strong>{guruClass}</strong> • Jumlah Siswa: <strong>{students.length}</strong>
          </p>
        </div>
      </div>

      <DailyAttendanceForm
        dateStr={date}
        guruClass={guruClass}
        initialRecords={initialRecords}
        isAlreadyFilled={existingAbsen.length > 0}
      />
    </div>
  );
}
