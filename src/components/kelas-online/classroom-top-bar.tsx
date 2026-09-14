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
  ScreenShare,
  StopCircle,
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
    isSharingScreen,
    toggleScreenShare,
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
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 shadow-xs p-3 sm:p-4 flex flex-col gap-3 sticky top-16 z-20 backdrop-blur-md">
        {/* Row 1: Class Information & Primary Leave/End Button */}
        <div className="flex items-center justify-between gap-3 min-w-0">
          {/* Left: Back Arrow + Info */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExitClick}
              title="Kembali / Keluar Kelas"
              className="shrink-0 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer rounded-xl h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              {activeSession.mataPelajaran && (
                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60 font-semibold px-2.5 py-1 text-xs sm:text-sm flex items-center gap-1.5 shrink-0 shadow-xs">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">
                    {activeSession.mataPelajaran}
                  </span>
                </Badge>
              )}

              <div className="flex items-center gap-1.5 text-xs sm:text-sm min-w-0">
                <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[130px] sm:max-w-[200px]">
                  {activeSession.kelas}
                </span>

                {activeSession.guruName && (
                  <>
                    <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                    <span className="text-slate-500 dark:text-slate-400 truncate hidden sm:inline max-w-[150px] md:max-w-[220px]">
                      {activeSession.guruName}
                    </span>
                  </>
                )}
              </div>

              {/* Live Indicator */}
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Users className="h-3 w-3" />
                <span>{activeSession.activeParticipants || 1}</span>
              </div>
            </div>
          </div>

          {/* Right: End Class (Guru) or Leave Class (Siswa) */}
          <div className="shrink-0">
            {role === "guru" ? (
              <Button
                onClick={handleExitClick}
                disabled={isEnding}
                variant="destructive"
                className="h-9 px-3.5 text-xs font-bold rounded-xl cursor-pointer shadow-xs bg-rose-600 hover:bg-rose-700 text-white"
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
                className="h-9 px-3.5 text-xs font-semibold rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/20 cursor-pointer shadow-xs"
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Keluar
              </Button>
            )}
          </div>
        </div>

        {/* Row 2: Classroom Action Toolbar (Screen Share, Help, View Modes) */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar touch-pan-x touch-pan-y">
          {/* Left Group: Interactive Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Tombol Bagikan Layar */}
            <Button
              variant={isSharingScreen ? "destructive" : "outline"}
              size="sm"
              onClick={toggleScreenShare}
              className={`h-8.5 sm:h-9 px-2.5 sm:px-3 text-xs font-semibold rounded-xl cursor-pointer transition-all duration-200 shrink-0 ${
                isSharingScreen
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md ring-2 ring-rose-400/50 animate-pulse"
                  : "border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200"
              }`}
              title={isSharingScreen ? "Hentikan Berbagi Layar" : "Mulai Bagikan Layar Anda ke Seluruh Peserta"}
            >
              {isSharingScreen ? (
                <>
                  <StopCircle className="h-4 w-4 sm:mr-1.5 text-white" />
                  <span className="hidden sm:inline">Berhenti Berbagi</span>
                  <span className="sm:hidden">Berhenti</span>
                </>
              ) : (
                <>
                  <ScreenShare className="h-4 w-4 sm:mr-1.5 text-emerald-700 dark:text-emerald-300" />
                  <span>Bagikan Layar</span>
                </>
              )}
            </Button>

            {/* Petunjuk Bantuan Non-IT / Siswa */}
            <Button
              variant="outline"
              size="sm"
              onClick={openHelp}
              className="h-8.5 sm:h-9 px-2.5 sm:px-3 text-xs font-medium border-slate-200 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 dark:border-slate-800 dark:text-slate-300 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/30 rounded-xl cursor-pointer shrink-0"
              title="Bantuan & Petunjuk Belajar"
            >
              <HelpCircle className="h-4 w-4 sm:mr-1.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Bantuan</span>
            </Button>
          </div>

          {/* Right Group: View Layout Modes */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Minimize / Perkecil */}
            <Button
              variant="outline"
              size="sm"
              onClick={minimize}
              className="h-8.5 sm:h-9 px-2.5 sm:px-3 text-xs font-medium border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer shrink-0"
              title="Perkecil ke pojok layar (Bisa sambil membuka menu lain)"
            >
              <Minimize2 className="h-3.5 w-3.5 sm:mr-1.5 text-slate-500" />
              <span className="hidden sm:inline">Perkecil</span>
            </Button>

            {/* Mode Teater / Fokus */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheater}
              className={`h-8.5 sm:h-9 px-2.5 sm:px-3 text-xs font-medium rounded-xl cursor-pointer transition-colors shrink-0 ${
                viewState === "theater"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
              title="Mode Fokus / Teater (Tampilan luas di browser)"
            >
              <Tv className="h-3.5 w-3.5 sm:mr-1.5 text-slate-500" />
              <span className="hidden sm:inline">{viewState === "theater" ? "Normal" : "Fokus"}</span>
            </Button>

            {/* Fullscreen / Layar Penuh */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className={`h-8.5 sm:h-9 px-2.5 sm:px-3 text-xs font-medium rounded-xl cursor-pointer transition-colors shrink-0 ${
                viewState === "fullscreen"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
              title="Layar Penuh (100% monitor)"
            >
              <Maximize2 className="h-3.5 w-3.5 sm:mr-1.5 text-slate-500" />
              <span className="hidden sm:inline">
                {viewState === "fullscreen" ? "Keluar Layar" : "Layar Penuh"}
              </span>
            </Button>
          </div>
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
