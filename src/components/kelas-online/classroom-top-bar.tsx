"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Maximize2,
  Minimize2,
  Tv,
  HelpCircle,
  Loader2,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useKelasOnline } from "./kelas-online-context";

interface ClassroomTopBarProps {
  role: "guru" | "siswa" | "admin";
  onEndClass?: () => Promise<void>;
  isEnding?: boolean;
}

export function ClassroomTopBar({
  role,
  onEndClass,
  isEnding = false,
}: ClassroomTopBarProps) {
  const {
    activeSession,
    viewState,
    minimize,
    toggleFullscreen,
    toggleTheater,
    openHelp,
    leaveSession,
  } = useKelasOnline();

  const [confirmExitOpen, setConfirmExitOpen] = useState(false);

  if (!activeSession) return null;

  const handleExitClick = () => {
    setConfirmExitOpen(true);
  };

  const handleConfirmExit = async () => {
    setConfirmExitOpen(false);
    if (role === "guru" && onEndClass) {
      await onEndClass();
    } else {
      await leaveSession();
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b bg-background/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        {/* Left: Class Info & Back */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExitClick}
            title="Keluar Kelas"
            className="shrink-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-xl h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {activeSession.mataPelajaran && (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50 font-semibold px-2.5 py-1 text-xs sm:text-sm flex items-center gap-1.5 shadow-xs">
                <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate max-w-[160px] sm:max-w-[220px]">
                  {activeSession.mataPelajaran}
                </span>
              </Badge>
            )}

            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="font-medium text-foreground truncate max-w-[120px] sm:max-w-[180px]">
                {activeSession.kelas}
              </span>

              {activeSession.guruName && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="truncate hidden md:inline">
                    {activeSession.guruName}
                  </span>
                </>
              )}
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Users className="h-3 w-3" />
              <span>{activeSession.activeParticipants || 1}</span>
            </div>
          </div>
        </div>

        {/* Right: Controls (Minimize, Theater, Fullscreen, Help, Exit) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-end sm:self-auto">
          {/* Petunjuk Bantuan Non-IT / Siswa */}
          <Button
            variant="outline"
            size="sm"
            onClick={openHelp}
            className="h-9 px-2.5 sm:px-3 text-xs font-medium border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/30 rounded-xl cursor-pointer"
            title="Bantuan & Petunjuk Belajar"
          >
            <HelpCircle className="h-4 w-4 mr-1 text-emerald-600" />
            <span className="hidden sm:inline">Bantuan</span>
          </Button>

          {/* Minimize / Perkecil */}
          <Button
            variant="outline"
            size="sm"
            onClick={minimize}
            className="h-9 px-2.5 sm:px-3 text-xs font-medium border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            title="Perkecil ke pojok layar (Bisa sambil membuka menu lain)"
          >
            <Minimize2 className="h-4 w-4 sm:mr-1 text-slate-600 dark:text-slate-400" />
            <span className="hidden sm:inline">Perkecil</span>
          </Button>

          {/* Mode Teater / Fokus */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheater}
            className={`h-9 px-2.5 sm:px-3 text-xs font-medium rounded-xl cursor-pointer transition-colors ${
              viewState === "theater"
                ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Mode Fokus / Teater (Tampilan luas di browser)"
          >
            <Tv className="h-4 w-4 sm:mr-1 text-slate-600 dark:text-slate-400" />
            <span className="hidden sm:inline">
              {viewState === "theater" ? "Normal" : "Fokus"}
            </span>
          </Button>

          {/* Fullscreen / Layar Penuh */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className={`h-9 px-2.5 sm:px-3 text-xs font-medium rounded-xl cursor-pointer transition-colors ${
              viewState === "fullscreen"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Layar Penuh (100% monitor)"
          >
            <Maximize2 className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">
              {viewState === "fullscreen" ? "Keluar Layar" : "Layar Penuh"}
            </span>
          </Button>

          {/* End Class (Guru) or Leave Class (Siswa) */}
          {role === "guru" ? (
            <Button
              onClick={handleExitClick}
              disabled={isEnding}
              variant="destructive"
              className="h-9 px-3 text-xs font-bold rounded-xl cursor-pointer shadow-xs"
            >
              {isEnding ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Mengakhiri...
                </>
              ) : (
                <>
                  <LogOut className="mr-1.5 h-3.5 w-3.5" />
                  Akhiri Kelas
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleExitClick}
              variant="outline"
              className="h-9 px-3 text-xs font-semibold rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer shadow-xs"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Keluar
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmExitOpen} onOpenChange={setConfirmExitOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              {role === "guru" ? "Akhiri Kelas Online?" : "Keluar dari Ruang Belajar?"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              {role === "guru"
                ? "Semua siswa akan dikeluarkan dari ruangan dan durasi pembelajaran akan dicatat secara otomatis."
                : "Ananda akan meninggalkan kelas online ini. Jika ingin membuka menu lain tanpa keluar, Ananda bisa memilih tombol 'Perkecil' saja."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmExitOpen(false);
                minimize();
              }}
              className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 cursor-pointer"
            >
              <Minimize2 className="h-4 w-4 mr-1.5" />
              Perkecil Saja (Tetap Terhubung)
            </Button>

            <Button
              variant={role === "guru" ? "destructive" : "default"}
              onClick={handleConfirmExit}
              className={`rounded-xl font-bold cursor-pointer ${
                role === "siswa"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : ""
              }`}
            >
              {role === "guru" ? "Ya, Akhiri Kelas" : "Ya, Keluar Kelas"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
