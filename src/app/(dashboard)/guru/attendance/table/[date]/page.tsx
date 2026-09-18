import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ArrowLeft, Table as TableIcon, Download, ChevronLeft, ChevronRight, School } from "lucide-react";
import { ClipboardListIcon } from "@/components/ui/clipboard-list-icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GuruAttendanceTablePage(props: {
  params: Promise<{ date: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "guru") {
    redirect("/login");
  }

  const { date } = await props.params;
  const guruClass = session.kelas || "";

  // Parse Year and Month from the URL param date (e.g. 2026-09-10)
  const [yearStr, monthStr] = date.split("-");
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const month = parseInt(monthStr, 10) || new Date().getMonth() + 1;

  const monthNames = [
    "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  let students: any[] = [];
  let allAbsen: any[] = [];

  try {
    const [dbStudents, dbAbsen] = await Promise.all([
      guruClass
        ? prisma.user.findMany({
            where: { kelas: guruClass, status: "1" },
            orderBy: { name: "asc" },
          })
        : [],
      guruClass
        ? prisma.absen.findMany({
            where: {
              kelas: guruClass,
              OR: [
                { date: { startsWith: `${year}-${month}-` } },
                { date: { startsWith: `${year}-${String(month).padStart(2, "0")}-` } },
                { month: String(month) },
              ],
            },
          })
        : [],
    ]);
    students = dbStudents;
    allAbsen = dbAbsen;
  } catch (e) {
    console.error("Database query error in attendance table:", e);
  }

  // Build lookup: studentId -> dayNumber -> status (H/S/I/A)
  const attendanceMatrix: Record<string, Record<number, string>> = {};
  students.forEach((s) => {
    attendanceMatrix[s.id.toString()] = {};
  });

  allAbsen.forEach((ab) => {
    const parts = (ab.date || "").split("-");
    if (parts.length === 3) {
      const dNum = parseInt(parts[2], 10);
      const mNum = parseInt(parts[1], 10);
      const yNum = parseInt(parts[0], 10);
      if (yNum === year && mNum === month && dNum >= 1 && dNum <= daysInMonth) {
        const userId = ab.user_id.toString();
        if (attendanceMatrix[userId]) {
          const ket = ab.keterangan || "Hadir";
          const shortCode = ket === "Hadir" ? "H" : ket === "Sakit" ? "S" : ket === "Izin" ? "I" : "A";
          attendanceMatrix[userId][dNum] = shortCode;
        }
      }
    }
  });

  // Calculate month navigation URLs
  const prevMonthDate = new Date(year, month - 2, 1);
  const nextMonthDate = new Date(year, month, 1);
  const prevUrl = `/guru/attendance/table/${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}-01`;
  const nextUrl = `/guru/attendance/table/${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}-01`;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/guru/attendance">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <ClipboardListIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tabel Presensi Bulanan</h1>
              <p className="text-xs text-muted-foreground">
                Kelas: <strong>{guruClass}</strong> • {monthNames[month]} {year}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/guru/attendance/recap">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs text-emerald-600 border-emerald-600/40 hover:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/40">
              <Download className="h-3.5 w-3.5" /> Download PDF
            </Button>
          </Link>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between rounded-xl border bg-card p-3 shadow-sm">
        <Link href={prevUrl}>
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            <ChevronLeft className="h-4 w-4" /> Bulan Sebelumnya
          </Button>
        </Link>
        <span className="font-bold text-sm text-foreground">
          {monthNames[month]} {year}
        </span>
        <Link href={nextUrl}>
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            Bulan Berikutnya <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Scroll Hint on Mobile */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground sm:hidden px-1 bg-muted/40 py-1.5 rounded-lg border">
        <span className="text-emerald-600 font-semibold px-1">↔</span>
        <span>Geser tabel ke samping untuk melihat seluruh tanggal & rekap</span>
      </div>

      {/* Big Matrix Table per PRD 7.3.7 */}
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-muted/70 border-b">
              <th className="p-2.5 font-bold text-center border-r w-10 sticky left-0 bg-muted/95 z-10">No</th>
              <th className="p-2.5 font-bold border-r w-28 sm:w-44 max-w-[110px] sm:max-w-[180px] sticky left-10 bg-muted/95 z-10 truncate shadow-[3px_0_5px_-2px_rgba(0,0,0,0.15)]">
                Nama Siswa
              </th>
              {daysArray.map((d) => {
                const isSunday = new Date(year, month - 1, d).getDay() === 0;
                return (
                  <th
                    key={d}
                    className={cn(
                      "p-1 font-bold text-center border-r min-w-[30px] max-w-[30px]",
                      isSunday
                        ? "text-rose-600 bg-rose-100/80 dark:bg-rose-500/15 dark:text-rose-400 font-extrabold"
                        : "text-foreground/80"
                    )}
                    title={isSunday ? `Hari Minggu (${d} ${monthNames[month]})` : `Tanggal ${d}`}
                  >
                    {d}
                  </th>
                );
              })}
              <th className="p-2 font-extrabold text-center border-r bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-border w-10" title="Total Hadir">H</th>
              <th className="p-2 font-extrabold text-center border-r bg-sky-100 text-sky-900 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-border w-10" title="Total Sakit">S</th>
              <th className="p-2 font-extrabold text-center border-r bg-amber-100 text-amber-950 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-border w-10" title="Total Izin">I</th>
              <th className="p-2 font-extrabold text-center bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-300 w-10" title="Total Alpha">A</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={daysInMonth + 6} className="text-center py-8 text-muted-foreground">
                  Belum ada siswa di kelas {guruClass}.
                </td>
              </tr>
            ) : (
              students.map((s, idx) => {
                const row = attendanceMatrix[s.id.toString()] || {};
                let countH = 0;
                let countS = 0;
                let countI = 0;
                let countA = 0;

                daysArray.forEach((d) => {
                  const val = row[d];
                  if (val === "H") countH++;
                  else if (val === "S") countS++;
                  else if (val === "I") countI++;
                  else if (val === "A") countA++;
                });

                return (
                  <tr key={s.id.toString()} className="group border-b hover:bg-muted/40 transition-colors">
                    <td className="p-2 text-center border-r font-medium sticky left-0 bg-card group-hover:bg-muted/60 z-10 transition-colors text-foreground">
                      {idx + 1}
                    </td>
                    <td className="p-2 border-r font-semibold truncate sticky left-10 bg-card group-hover:bg-muted/60 z-10 w-28 sm:w-44 max-w-[110px] sm:max-w-[180px] shadow-[3px_0_5px_-2px_rgba(0,0,0,0.15)] transition-colors text-foreground" title={s.name}>
                      {s.name}
                    </td>
                    {daysArray.map((d) => {
                      const code = row[d];
                      const isSunday = new Date(year, month - 1, d).getDay() === 0;

                      return (
                        <td
                          key={d}
                          className={cn(
                            "p-0.5 text-center border-r transition-colors",
                            !code && isSunday && "bg-rose-50/50 dark:bg-rose-500/[0.06]"
                          )}
                        >
                          {code ? (
                            <span
                              className={cn(
                                "inline-flex h-6 w-6 items-center justify-center rounded-md font-extrabold text-xs leading-none transition-transform select-none shadow-2xs",
                                code === "H" && "bg-emerald-100 text-emerald-800 border border-emerald-300/80 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40",
                                code === "S" && "bg-sky-100 text-sky-800 border border-sky-300/80 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40",
                                code === "I" && "bg-amber-100 text-amber-900 border border-amber-300/80 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
                                code === "A" && "bg-rose-100 text-rose-800 border border-rose-300/80 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40"
                              )}
                              title={`${s.name} - ${code === "H" ? "Hadir" : code === "S" ? "Sakit" : code === "I" ? "Izin" : "Alpha"} (${d} ${monthNames[month]})`}
                            >
                              {code}
                            </span>
                          ) : null}
                        </td>
                      );
                    })}
                    <td className="p-1 text-center border-r font-extrabold font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-500/10">
                      {countH}
                    </td>
                    <td className={cn(
                      "p-1 text-center border-r font-mono",
                      countS > 0
                        ? "font-extrabold text-sky-800 dark:text-sky-300 bg-sky-50/80 dark:bg-sky-500/10"
                        : "text-muted-foreground/35 font-medium bg-sky-50/30 dark:bg-sky-500/5"
                    )}>
                      {countS}
                    </td>
                    <td className={cn(
                      "p-1 text-center border-r font-mono",
                      countI > 0
                        ? "font-extrabold text-amber-900 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-500/10"
                        : "text-muted-foreground/35 font-medium bg-amber-50/30 dark:bg-amber-500/5"
                    )}>
                      {countI}
                    </td>
                    <td className={cn(
                      "p-1 text-center font-mono",
                      countA > 0
                        ? "font-extrabold text-rose-800 dark:text-rose-300 bg-rose-50/80 dark:bg-rose-500/10"
                        : "text-muted-foreground/35 font-medium bg-rose-50/30 dark:bg-rose-500/5"
                    )}>
                      {countA}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Student Attendance Cards (Quick Recap without horizontal panning) */}
      <div className="block sm:hidden space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
          Ringkasan Kehadiran Siswa Bulan Ini
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {students.map((s, idx) => {
            const row = attendanceMatrix[s.id.toString()] || {};
            let countH = 0;
            let countS = 0;
            let countI = 0;
            let countA = 0;

            daysArray.forEach((d) => {
              const val = row[d];
              if (val === "H") countH++;
              else if (val === "S") countS++;
              else if (val === "I") countI++;
              else if (val === "A") countA++;
            });

            return (
              <div
                key={`mobile-${s.id}`}
                className="flex items-center justify-between rounded-xl border bg-card p-3 shadow-xs"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                    {idx + 1}
                  </span>
                  <div className="overflow-hidden">
                    <p className="font-bold text-xs text-foreground truncate">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">NIS: {s.nis || "-"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 font-mono text-xs">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/80 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40" title="Hadir">
                    {countH} H
                  </span>
                  {countS > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300/80 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40" title="Sakit">
                      {countS} S
                    </span>
                  )}
                  {countI > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300/80 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40" title="Izin">
                      {countI} I
                    </span>
                  )}
                  {countA > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300/80 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40" title="Alpha">
                      {countA} A
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground p-3 border rounded-xl bg-card shadow-xs">
        <span className="font-semibold text-foreground">Keterangan:</span>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300/80 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 text-[11px] font-extrabold shadow-2xs">
            H
          </span>
          <span className="font-medium text-foreground/80">Hadir</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-sky-100 text-sky-800 border border-sky-300/80 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40 text-[11px] font-extrabold shadow-2xs">
            S
          </span>
          <span className="font-medium text-foreground/80">Sakit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-amber-100 text-amber-900 border border-amber-300/80 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 text-[11px] font-extrabold shadow-2xs">
            I
          </span>
          <span className="font-medium text-foreground/80">Izin</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-rose-100 text-rose-800 border border-rose-300/80 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 text-[11px] font-extrabold shadow-2xs">
            A
          </span>
          <span className="font-medium text-foreground/80">Alpha</span>
        </div>
      </div>
    </div>
  );
}
