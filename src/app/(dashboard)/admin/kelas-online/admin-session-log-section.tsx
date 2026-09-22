"use client";

import { useState } from "react";
import { BarChart3, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface SessionLogItem {
  id: string;
  guru_name: string;
  kelas: string;
  mata_pelajaran: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  duration_minutes: number | null;
  total_attendance: number;
}

interface AdminSessionLogSectionProps {
  sessions: SessionLogItem[];
}

export function AdminSessionLogSection({ sessions }: AdminSessionLogSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-all cursor-pointer text-left group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <BarChart3 className="h-5 w-5 text-slate-500 group-hover:text-primary transition-colors" />
          <span className="text-base font-semibold text-foreground">
            Log Semua Sesi
          </span>
          {sessions.length > 0 && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {sessions.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
          <span>{isOpen ? "Tutup" : "Buka Log Sesi"}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="pt-1 animate-in fade-in-50 duration-200">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50/80 dark:bg-slate-900/50">
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Guru</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Kelas</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Mapel</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Mulai</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Durasi</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Hadir</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                      >
                        <td className="py-2.5 px-4 font-medium">{s.guru_name}</td>
                        <td className="py-2.5 px-4 text-muted-foreground text-xs">{s.kelas}</td>
                        <td className="py-2.5 px-4">{s.mata_pelajaran || "-"}</td>
                        <td className="py-2.5 px-4 text-muted-foreground text-xs">
                          {s.started_at
                            ? new Date(s.started_at).toLocaleString("id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </td>
                        <td className="py-2.5 px-4 text-muted-foreground">
                          {s.duration_minutes
                            ? s.duration_minutes < 60
                              ? `${s.duration_minutes}m`
                              : `${Math.floor(s.duration_minutes / 60)}j ${s.duration_minutes % 60}m`
                            : "-"}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="font-medium">{s.total_attendance}</span>
                        </td>
                        <td className="py-2.5 px-4">
                          {s.status === "active" ? (
                            <Badge className="bg-emerald-500 text-white border-none text-xs">
                              Aktif
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Selesai
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                    {sessions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          Belum ada sesi kelas online bulan ini
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
