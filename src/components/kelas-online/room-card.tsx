"use client";

import { Video, Users, Clock, BookOpen, User, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RoomData {
  id: string;
  room_name: string;
  guru_name: string;
  kelas: string;
  mata_pelajaran: string | null;
  status: string;
  started_at: string | null;
  active_participants?: number;
  ended_at?: string | null;
  duration_minutes?: number | null;
  total_attendance?: number;
}

interface RoomCardProps {
  room: RoomData;
  variant: "active" | "ended";
  role: "guru" | "siswa" | "admin";
  onJoin?: () => void;
  onEnd?: () => void;
  isLoading?: boolean;
}

function getTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  return `${hours} jam ${minutes % 60} menit lalu`;
}

function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return "-";
  if (minutes < 60) return `${minutes} menit`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} jam ${m} menit` : `${h} jam`;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RoomCard({
  room,
  variant,
  role,
  onJoin,
  onEnd,
  isLoading,
}: RoomCardProps) {
  const isActive = variant === "active";

  return (
    <Card
      className={`relative overflow-hidden rounded-2xl py-0 gap-0 transition-all duration-300 hover:scale-[1.01] ${
        isActive
          ? "border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-50/90 via-card/90 to-teal-50/50 shadow-liquid-glass dark:from-emerald-950/40 dark:via-slate-900/80 dark:to-teal-950/20 dark:border-emerald-700/60"
          : "border border-white/20 bg-card/80 dark:border-white/10 dark:bg-slate-900/60"
      }`}
    >
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-600" />
      )}

      <CardContent className="p-5 sm:p-6">
        {/* Status Header */}
        <div className="flex items-center justify-between mb-4">
          {isActive ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <Badge className="bg-emerald-600 text-white font-bold px-3 py-1 text-xs border-none tracking-wide shadow-xs">
                KELAS SEDANG AKTIF
              </Badge>
            </div>
          ) : (
            <Badge variant="secondary" className="text-xs font-medium px-3 py-1">
              ⚫ Selesai
            </Badge>
          )}

          {isActive && room.active_participants !== undefined && (
            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
              <Users className="h-3.5 w-3.5" />
              <span>{room.active_participants} peserta hadir</span>
            </div>
          )}
        </div>

        {/* Room Info */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-tight">
                {room.mata_pelajaran || "Kelas Online"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{room.kelas}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 truncate">
              <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{room.guru_name}</span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {isActive
                  ? `Mulai ${getTimeAgo(room.started_at)}`
                  : formatDuration(room.duration_minutes)}
              </span>
            </div>
          </div>

          {!isActive && room.total_attendance !== undefined && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>{room.total_attendance} siswa tercatat hadir</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isActive && (
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            {onJoin && (
              <Button
                onClick={onJoin}
                disabled={isLoading}
                variant={role === "siswa" ? "launch" : "default"}
                size="xl"
                className="flex-1"
              >
                {role === "siswa" ? (
                  <>
                    <Sparkles className="h-5 w-5 text-amber-950 fill-amber-950/20" />
                    <span>Mulai Belajar Sekarang</span>
                    <ArrowRight className="h-5 w-5 ml-1" />
                  </>
                ) : (
                  <>
                    <Video className="h-5 w-5" />
                    <span>Masuk ke Ruang Kelas</span>
                    <ArrowRight className="h-5 w-5 ml-1" />
                  </>
                )}
              </Button>
            )}

            {onEnd && role === "guru" && (
              <Button
                onClick={onEnd}
                disabled={isLoading}
                variant="destructive"
                size="xl"
                className="px-5 shrink-0"
              >
                Akhiri
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
