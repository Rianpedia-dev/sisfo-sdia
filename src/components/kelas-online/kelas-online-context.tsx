"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

export type ClassViewState = "normal" | "minimized" | "fullscreen" | "theater";

export interface ActiveCallSession {
  roomId: string;
  roomName: string;
  roomUrl: string;
  token: string;
  userName: string;
  role: "guru" | "siswa" | "admin";
  kelas: string;
  mataPelajaran: string | null;
  guruName?: string;
  attendanceId?: string;
  startedAt?: string | null;
  activeParticipants?: number;
}

interface KelasOnlineContextType {
  activeSession: ActiveCallSession | null;
  viewState: ClassViewState;
  isHelpOpen: boolean;
  startSession: (session: ActiveCallSession) => void;
  endSession: () => void;
  leaveSession: () => Promise<void>;
  setViewState: (state: ClassViewState) => void;
  minimize: () => void;
  restore: () => void;
  toggleFullscreen: () => void;
  toggleTheater: () => void;
  openHelp: () => void;
  closeHelp: () => void;
  updateParticipants: (count: number) => void;
}

const KelasOnlineContext = createContext<KelasOnlineContextType | undefined>(undefined);

export function KelasOnlineProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [activeSession, setActiveSession] = useState<ActiveCallSession | null>(null);
  const [viewState, setViewState] = useState<ClassViewState>("normal");
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Check if current route is the room page
  const isCurrentlyInRoomPage = useCallback(() => {
    if (!activeSession) return false;
    const guruPath = `/guru/kelas-online/${activeSession.roomId}`;
    const siswaPath = `/siswa/kelas-online/${activeSession.roomId}`;
    return pathname === guruPath || pathname === siswaPath;
  }, [activeSession, pathname]);

  // If user navigates away from the room page while session is active, auto-minimize!
  useEffect(() => {
    if (activeSession && !isCurrentlyInRoomPage()) {
      if (viewState === "normal" || viewState === "theater" || viewState === "fullscreen") {
        setViewState("minimized");
        toast.info(
          `Kelas Online (${activeSession.mataPelajaran || "Kelas"}) tetap aktif di pojok layar.`,
          {
            duration: 4000,
            id: "kelas-minimized-toast",
          }
        );
      }
    }
  }, [pathname, activeSession, isCurrentlyInRoomPage, viewState]);

  // Listen to Fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && viewState === "fullscreen") {
        setViewState("normal");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [viewState]);

  const startSession = useCallback((session: ActiveCallSession) => {
    setActiveSession(session);
    setViewState("normal");
  }, []);

  const endSession = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setActiveSession(null);
    setViewState("normal");
  }, []);

  const leaveSession = useCallback(async () => {
    if (!activeSession) return;

    if (activeSession.role === "siswa" && activeSession.attendanceId) {
      try {
        await fetch("/api/kelas-online/leave-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attendanceId: activeSession.attendanceId }),
        });
      } catch (err) {
        console.error("Gagal mencatat keluar kelas:", err);
      }
    }

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    const redirectPath =
      activeSession.role === "guru" ? "/guru/kelas-online" : "/siswa/kelas-online";

    setActiveSession(null);
    setViewState("normal");
    router.push(redirectPath);
    toast.success("Anda telah keluar dari ruang kelas online.");
  }, [activeSession, router]);

  const minimize = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setViewState("minimized");
  }, []);

  const restore = useCallback(() => {
    if (!activeSession) return;
    setViewState("normal");
    const targetPath =
      activeSession.role === "guru"
        ? `/guru/kelas-online/${activeSession.roomId}`
        : `/siswa/kelas-online/${activeSession.roomId}`;

    if (pathname !== targetPath) {
      router.push(targetPath);
    }
  }, [activeSession, pathname, router]);

  const toggleFullscreen = useCallback(() => {
    if (viewState === "fullscreen") {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setViewState("normal");
    } else {
      setViewState("fullscreen");
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (e) {
        console.warn("Fullscreen request error:", e);
      }
    }
  }, [viewState]);

  const toggleTheater = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setViewState((prev) => (prev === "theater" ? "normal" : "theater"));
  }, []);

  const openHelp = useCallback(() => setIsHelpOpen(true), []);
  const closeHelp = useCallback(() => setIsHelpOpen(false), []);

  const updateParticipants = useCallback((count: number) => {
    setActiveSession((prev) => (prev ? { ...prev, activeParticipants: count } : null));
  }, []);

  return (
    <KelasOnlineContext.Provider
      value={{
        activeSession,
        viewState,
        isHelpOpen,
        startSession,
        endSession,
        leaveSession,
        setViewState,
        minimize,
        restore,
        toggleFullscreen,
        toggleTheater,
        openHelp,
        closeHelp,
        updateParticipants,
      }}
    >
      {children}
    </KelasOnlineContext.Provider>
  );
}

export function useKelasOnline() {
  const context = useContext(KelasOnlineContext);
  if (!context) {
    throw new Error("useKelasOnline must be used within a KelasOnlineProvider");
  }
  return context;
}
