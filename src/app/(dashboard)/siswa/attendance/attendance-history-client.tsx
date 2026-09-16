"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AttendanceEvent {
  id: string;
  title: string;
  start: string;
  backgroundColor: string;
  extendedProps?: {
    keterangan: string;
    kelas: string;
  };
}

export function AttendanceHistoryClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAttendance() {
      try {
        const res = await fetch("/api/attendance/history");
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  // Count month stats
  let countHadir = 0;
  let countSakit = 0;
  let countIzin = 0;
  let countAlpha = 0;

  events.forEach((e) => {
    const parts = (e.start || "").split("-");
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      if (y === year && m === month) {
        const ket = e.extendedProps?.keterangan || e.title;
        if (ket === "Hadir") countHadir++;
        else if (ket === "Sakit") countSakit++;
        else if (ket === "Izin") countIzin++;
        else if (ket === "Alpha") countAlpha++;
      }
    }
  });

  const getAttendanceForDay = (d: number) => {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return events.find((e) => e.start === dStr);
  };

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards for this month's attendance */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 p-4 text-center dark:bg-emerald-950/30">
          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Hadir</p>
          <p className="font-mono text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{countHadir} Hari</p>
        </div>
        <div className="rounded-xl border border-sky-500/30 bg-sky-50/50 p-4 text-center dark:bg-sky-950/30">
          <p className="text-xs font-semibold text-sky-800 dark:text-sky-300">Sakit</p>
          <p className="font-mono text-2xl font-black text-sky-700 dark:text-sky-400 mt-1">{countSakit} Hari</p>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-50/50 p-4 text-center dark:bg-amber-950/30">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Izin</p>
          <p className="font-mono text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{countIzin} Hari</p>
        </div>
        <div className="rounded-xl border border-rose-500/30 bg-rose-50/50 p-4 text-center dark:bg-rose-950/30">
          <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">Alpha</p>
          <p className="font-mono text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">{countAlpha} Hari</p>
        </div>
      </div>

      {/* Calendar Card */}
      <Card className="border-emerald-500/20 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="text-base">
              Kalender Presensi: {monthNames[month]} {year}
            </CardTitle>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-muted-foreground pb-2">
            {dayNames.map((n) => (
              <div key={n} className="py-1">
                <span className="hidden sm:inline">{n}</span>
                <span className="sm:hidden text-[11px]">{n.substring(0, 3)}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((d, index) => {
              if (d === null) {
                return <div key={`empty-${index}`} className="min-h-[50px] sm:min-h-[76px] rounded-lg sm:rounded-xl bg-muted/10" />;
              }

              const att = getAttendanceForDay(d);
              const ket = att?.extendedProps?.keterangan || att?.title;

              return (
                <div
                  key={`day-${d}`}
                  className="flex flex-col justify-between min-h-[50px] sm:min-h-[76px] rounded-lg sm:rounded-xl border p-1 sm:p-2 text-left bg-card transition-colors hover:border-emerald-500/40"
                >
                  <span className="text-[11px] sm:text-xs font-bold text-foreground">{d}</span>
                  {ket ? (
                    <div
                      className="mt-1 rounded-md p-1 text-center font-bold text-white shadow-xs"
                      style={{ backgroundColor: att?.backgroundColor || "#198754" }}
                    >
                      <span className="hidden sm:inline text-[11px]">{ket}</span>
                      <span className="sm:hidden text-[10px] font-extrabold">{ket.charAt(0)}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/40 italic text-center pb-0.5">-</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Status Legend on Mobile */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 border-t pt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 shrink-0" />
              <span>H = Hadir</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-600 shrink-0" />
              <span>S = Sakit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
              <span>I = Izin</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-600 shrink-0" />
              <span>A = Alpha</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
