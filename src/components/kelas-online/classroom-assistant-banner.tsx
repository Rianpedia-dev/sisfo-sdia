"use client";

import React from "react";
import {
  Camera,
  Mic,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Maximize2,
  Tv,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKelasOnline } from "./kelas-online-context";

interface ClassroomAssistantBannerProps {
  userName: string;
  role: "guru" | "siswa" | "admin";
  guruName?: string;
  mataPelajaran?: string | null;
}

export function ClassroomAssistantBanner({
  userName,
  role,
  guruName,
  mataPelajaran,
}: ClassroomAssistantBannerProps) {
  const { viewState, restore, toggleFullscreen, openHelp } = useKelasOnline();

  const isMinimized = viewState === "minimized";

  if (isMinimized) {
    return (
      <div className="p-6 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-center space-y-4 my-4">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-200">
            Sesi Kelas Online Sedang Berjalan di Pojok Layar (Minimized)
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
            Anda dapat membuka menu lain di sebelah kiri (seperti Absensi atau Kalender) sambil tetap mendengarkan kelas.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={restore}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer rounded-xl px-5 h-11 shadow-md shadow-emerald-600/20"
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Perbesar Tampilan Kelas
          </Button>

          <Button
            variant="outline"
            onClick={toggleFullscreen}
            className="rounded-xl border-slate-300 dark:border-slate-700 h-11 cursor-pointer"
          >
            <Tv className="h-4 w-4 mr-2" />
            Layar Penuh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/60 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/20 p-3.5 sm:p-4 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Islamic Greeting & Child Friendly Message */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <h3 className="font-bold text-sm sm:text-base text-emerald-900 dark:text-emerald-200">
              {role === "siswa"
                ? `Assalamu'alaikum, Ananda ${userName}! Siap belajar ${mataPelajaran || "hari ini"}?`
                : `Assalamu'alaikum, ${userName}! Ruang kelas online siap digunakan.`}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            {role === "siswa" && guruName
              ? `Dibimbing oleh: ${guruName} • Periksa kamera & suara, lalu klik tombol hijau "Join".`
              : `Pastikan mikrofon dan kamera aktif agar siswa dapat melihat dan mendengar penjelasan dengan jelas.`}
          </p>
        </div>

        {/* Center: 3 Easy Steps for Kids/Non-IT */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shrink-0">
            <Camera className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium text-slate-700 dark:text-slate-300">1. Cek Kamera</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shrink-0">
            <Mic className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium text-slate-700 dark:text-slate-300">2. Cek Suara</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-bold shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>3. Klik &quot;Join&quot; Hijau</span>
          </div>

          <button
            onClick={openHelp}
            className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline font-semibold shrink-0 cursor-pointer ml-1"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Bantuan Izin 🔒</span>
          </button>
        </div>
      </div>
    </div>
  );
}
