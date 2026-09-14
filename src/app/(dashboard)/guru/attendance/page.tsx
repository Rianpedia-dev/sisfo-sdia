import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Table as TableIcon, FileText, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAcademicYear } from "@/lib/utils";
import { AttendanceCalendarClient } from "./attendance-calendar-client";

export const dynamic = "force-dynamic";

export default async function GuruAttendancePage() {
  const session = await getSession();
  if (!session || session.role !== "guru") {
    redirect("/login");
  }

  const guruClass = session.kelas || "";
  const academic = getAcademicYear();
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  let filledDatesSet: string[] = [];
  try {
    const recordedDates = guruClass
      ? await prisma.absen.findMany({
          where: { kelas: guruClass },
          select: { date: true },
          distinct: ["date"],
        })
      : [];
    filledDatesSet = recordedDates.map((r) => r.date).filter(Boolean) as string[];
  } catch (e) {
    console.warn("DB error in attendance calendar dates:", e);
    filledDatesSet = [todayFormatted];
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Presensi Absensi Kelas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pilih tanggal pada kalender untuk mengisi atau memperbarui kehadiran siswa kelas {guruClass}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-emerald-600/30 bg-emerald-50 text-emerald-800 text-xs py-1 px-2.5 dark:bg-emerald-950 dark:text-emerald-300">
            TP {academic.tahunPelajaran}
          </Badge>
          <Badge className="bg-emerald-600 text-xs py-1 px-2.5">
            {academic.semester}
          </Badge>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href={`/guru/attendance/${todayFormatted}`}>
          <Card className="hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-emerald-500/10 via-background to-background">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Isi Cepat Hari Ini</p>
                <p className="text-sm font-bold text-foreground">Form Absen Hari Ini</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/guru/attendance/table/${todayFormatted}`}>
          <Card className="hover:border-sky-500 hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-sky-500/10 via-background to-background">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                <TableIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tampilan Matriks</p>
                <p className="text-sm font-bold text-foreground">Tabel Absen Bulanan</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/guru/attendance/recap">
          <Card className="hover:border-amber-500 hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-amber-500/10 via-background to-background">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Export Dokumen</p>
                <p className="text-sm font-bold text-foreground">Rekap Absen & PDF</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Monthly Attendance Calendar */}
      <AttendanceCalendarClient
        filledDates={filledDatesSet}
        guruClass={guruClass}
      />
    </div>
  );
}
