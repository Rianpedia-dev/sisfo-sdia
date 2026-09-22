"use client";

import { useState } from "react";
import { History, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface SiswaHistoryRecord {
  id: string;
  mata_pelajaran: string;
  guru_name: string;
  joined_at: string | null;
  left_at: string | null;
  duration_minutes: number | null;
  date: string;
}

interface SiswaHistorySectionProps {
  records: SiswaHistoryRecord[];
}

export function SiswaHistorySection({ records }: SiswaHistorySectionProps) {
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
          <History className="h-5 w-5 text-slate-500 group-hover:text-primary transition-colors" />
          <span className="text-base font-semibold text-foreground">
            Riwayat Kelas Sebelumnya
          </span>
          {records.length > 0 && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {records.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
          <span>{isOpen ? "Tutup" : "Buka Riwayat"}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="pt-1 animate-in fade-in-50 duration-200">
          {records.length > 0 ? (
            <div className="space-y-2">
              {records.map((rec) => (
                <Card key={rec.id} className="border-slate-200 dark:border-slate-800">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{rec.mata_pelajaran}</p>
                      <p className="text-xs text-muted-foreground">
                        👨‍🏫 {rec.guru_name} • {rec.date}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      ⏱{" "}
                      {rec.duration_minutes
                        ? rec.duration_minutes < 60
                          ? `${rec.duration_minutes} menit`
                          : `${Math.floor(rec.duration_minutes / 60)}j ${rec.duration_minutes % 60}m`
                        : "-"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <History className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>Belum ada riwayat kelas online</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
