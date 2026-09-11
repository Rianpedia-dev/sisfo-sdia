"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AttendanceCalendarClientProps {
  filledDates: string[];
  guruClass: string;
}

export function AttendanceCalendarClient({ filledDates, guruClass }: AttendanceCalendarClientProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    router.push(`/guru/attendance/${dStr}`);
  };

  return (
    <Card className="border-emerald-500/20 shadow-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-emerald-600" />
            <span>Kalender Presensi Kelas {guruClass}</span>
          </CardTitle>
          <CardDescription>
            Klik tanggal untuk membuka lembar absensi harian. Tanggal bercentang menandakan absensi telah tercatat.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">
            {monthNames[month]} {year}
          </span>
          <div className="flex items-center gap-1 ml-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {/* Day Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-muted-foreground pb-2">
          {dayNames.map((name) => (
            <div key={name} className="py-1">
              <span className="hidden sm:inline">{name}</span>
              <span className="sm:hidden">{name.substring(0, 3)}</span>
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((d, index) => {
            if (d === null) {
              return <div key={`empty-${index}`} className="min-h-[85px] rounded-xl bg-muted/10" />;
            }

            const dStrStandard = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const dStrAlternative = `${year}-${month + 1}-${d}`;
            const isFilled = filledDates.includes(dStrStandard) || filledDates.includes(dStrAlternative);

            const isToday =
              new Date().getDate() === d &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <button
                key={`day-${d}`}
                onClick={() => handleDateClick(d)}
                className={`flex flex-col justify-between min-h-[85px] rounded-xl border p-2.5 text-left transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer ${
                  isToday
                    ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 dark:bg-emerald-950/30"
                    : isFilled
                    ? "border-emerald-200 bg-card hover:bg-emerald-50/30 dark:border-emerald-900/50"
                    : "border-border/60 bg-card hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      isToday
                        ? "bg-emerald-600 text-white"
                        : "text-foreground"
                    }`}
                  >
                    {d}
                  </span>
                  {isFilled && (
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white" title="Sudah diisi">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  {isFilled ? (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Tercatat
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-muted-foreground italic">Kosong</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
