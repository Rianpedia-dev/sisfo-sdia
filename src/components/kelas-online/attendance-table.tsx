"use client";

import { Users, Clock, ArrowRightLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AttendanceRecord {
  id: string;
  user_name: string;
  user_role: string;
  joined_at: string | null;
  left_at: string | null;
  duration_minutes: number | null;
}

interface AttendanceTableProps {
  records: AttendanceRecord[];
  title?: string;
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(minutes: number | null): string {
  if (!minutes && minutes !== 0) return "-";
  if (minutes < 60) return `${minutes} menit`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}j ${m}m` : `${h} jam`;
}

export function AttendanceTable({ records, title = "Daftar Hadir" }: AttendanceTableProps) {
  const siswaRecords = records.filter((r) => r.user_role === "siswa");
  const guruRecords = records.filter((r) => r.user_role === "guru");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-emerald-600" />
          {title}
          <span className="text-sm font-normal text-muted-foreground">
            ({siswaRecords.length} siswa)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground">Nama</th>
                <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground">Role</th>
                <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground">
                  <Clock className="inline h-3.5 w-3.5 mr-1" />
                  Masuk
                </th>
                <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground">
                  <ArrowRightLeft className="inline h-3.5 w-3.5 mr-1" />
                  Keluar
                </th>
                <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground">Durasi</th>
              </tr>
            </thead>
            <tbody>
              {guruRecords.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20"
                >
                  <td className="py-2.5 px-3 font-medium">{r.user_name}</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                      Guru
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">{formatTime(r.joined_at)}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{formatTime(r.left_at)}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{formatDuration(r.duration_minutes)}</td>
                </tr>
              ))}
              {siswaRecords.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="py-2.5 px-3 font-medium">{r.user_name}</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                      Siswa
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">{formatTime(r.joined_at)}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{formatTime(r.left_at)}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{formatDuration(r.duration_minutes)}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Belum ada data kehadiran
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
