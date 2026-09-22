"use client";

import { useState } from "react";
import { History, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface GuruEndedRoom {
  id: string;
  room_name: string;
  room_url: string;
  guru_name: string;
  kelas: string;
  mata_pelajaran: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  duration_minutes: number | null;
  total_attendance: number;
}

interface GuruHistorySectionProps {
  rooms: GuruEndedRoom[];
}

export function GuruHistorySection({ rooms }: GuruHistorySectionProps) {
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
            Riwayat Kelas Online
          </span>
          {rooms.length > 0 && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {rooms.length}
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
          {rooms.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {rooms.map((room) => (
                <Card key={room.id} className="border-slate-200 dark:border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">
                          {room.mata_pelajaran || "Kelas Online"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {room.started_at
                            ? new Date(room.started_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        ⚫ Selesai
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>
                        ⏱{" "}
                        {room.duration_minutes
                          ? room.duration_minutes < 60
                            ? `${room.duration_minutes} menit`
                            : `${Math.floor(room.duration_minutes / 60)}j ${room.duration_minutes % 60}m`
                          : "-"}
                      </span>
                      <span>👥 {room.total_attendance} hadir</span>
                    </div>
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
