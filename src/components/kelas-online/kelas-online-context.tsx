"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import type { DailyCall } from "@daily-co/daily-js";

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
  isSharingScreen: boolean;
  setIsSharingScreen: (isSharing: boolean) => void;
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
  toggleScreenShare: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  registerCallFrame: (callFrame: DailyCall | null, iframe: HTMLIFrameElement | null) => void;
  unregisterCallFrame: () => void;
}

const KelasOnlineContext = createContext<KelasOnlineContextType | undefined>(undefined);

export function KelasOnlineProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [activeSession, setActiveSession] = useState<ActiveCallSession | null>(null);
  const [viewState, setViewState] = useState<ClassViewState>("normal");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);

  const callFrameRef = useRef<DailyCall | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const registerCallFrame = useCallback((callFrame: DailyCall | null, iframe: HTMLIFrameElement | null) => {
    callFrameRef.current = callFrame;
    iframeRef.current = iframe;
  }, []);

  const unregisterCallFrame = useCallback(() => {
    callFrameRef.current = null;
    iframeRef.current = null;
    setIsSharingScreen(false);
  }, []);

  const startScreenShare = useCallback(async () => {
    // 1. Periksa ketersediaan API getDisplayMedia pada peramban/perangkat
    const hasDisplayMedia =
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getDisplayMedia === "function";

    if (!hasDisplayMedia) {
      toast.error(
        "Perangkat atau peramban ini tidak mendukung fitur berbagi layar langsung. Buka kelas di tab terpisah atau gunakan PC/Laptop untuk presentasi materi.",
        { duration: 6000 }
      );
      return;
    }

    // 2. Periksa status koneksi panggilan Daily (meetingState)
    const callInstance = callFrameRef.current;
    if (callInstance && typeof callInstance.meetingState === "function") {
      const state = callInstance.meetingState();
      if (state !== "joined-meeting") {
        if (state === "new" || state === "loading" || state === "joining-meeting") {
          toast.warning(
            "Video kelas sedang menghubungkan. Harap tunggu sebentar hingga video tersambung sebelum membagikan layar.",
            { duration: 5000 }
          );
          return;
        }
        if (state === "left-meeting" || state === "error") {
          toast.error("Anda belum terhubung ke dalam ruang kelas online.");
          return;
        }
      }
    }

    try {
      if (
        callInstance &&
        typeof callInstance.startScreenShare === "function" &&
        (!callInstance.meetingState || callInstance.meetingState() === "joined-meeting")
      ) {
        await callInstance.startScreenShare();
        setIsSharingScreen(true);
        toast.success("Membagikan layar dimulai.");
        return;
      }

      // Fallback postMessage jika callFrame belum siap
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { what: "call-machine-command", action: "local-screen-start", captureOptions: {} },
          "*"
        );
        setIsSharingScreen(true);
        toast.success("Membagikan layar dimulai.");
        return;
      }

      toast.warning("Ruang kelas belum siap untuk berbagi layar.");
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      const msg = String(error?.message || err || "");

      if (
        msg.includes("requires preAuth") ||
        msg.includes("initialize call state")
      ) {
        toast.warning(
          "Panggilan video kelas belum siap untuk berbagi layar. Pastikan Anda sudah terhubung di dalam video kelas.",
          { duration: 5000 }
        );
      } else if (
        error?.name === "NotAllowedError" ||
        msg.includes("Permission denied") ||
        msg.includes("cancel") ||
        msg.includes("denied by system")
      ) {
        toast.info("Berbagi layar dibatalkan.");
      } else if (
        error?.name === "NotSupportedError" ||
        msg.includes("not supported")
      ) {
        toast.error(
          "Sistem tablet atau browser ini membatasi berbagi layar di dalam jendela video. Silakan buka kelas di tab terpisah untuk presentasi materi.",
          { duration: 6000 }
        );
      } else {
        toast.error(
          "Tidak dapat membagikan layar pada perangkat ini. Pastikan izin berbagi layar diberikan atau buka kelas di tab terpisah.",
          { duration: 6000 }
        );
      }
    }
  }, []);

  const stopScreenShare = useCallback(async () => {
    try {
      const callInstance = callFrameRef.current;
      if (
        callInstance &&
        typeof callInstance.stopScreenShare === "function" &&
        (!callInstance.meetingState || callInstance.meetingState() === "joined-meeting")
      ) {
        callInstance.stopScreenShare();
      } else if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { what: "call-machine-command", action: "local-screen-stop" },
          "*"
        );
      }
      setIsSharingScreen(false);
      toast.info("Berbagi layar telah dihentikan.");
    } catch (err: unknown) {
      console.warn("Gagal menghentikan berbagi layar:", err);
      setIsSharingScreen(false);
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (isSharingScreen) {
      await stopScreenShare();
    } else {
      await startScreenShare();
    }
  }, [isSharingScreen, startScreenShare, stopScreenShare]);

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
        const timer = setTimeout(() => {
          setViewState("minimized");
          toast.info(
            `Kelas Online (${activeSession.mataPelajaran || "Kelas"}) tetap aktif di pojok layar.`,
            {
              duration: 4000,
              id: "kelas-minimized-toast",
            }
          );
        }, 0);
        return () => clearTimeout(timer);
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
    if (isSharingScreen) {
      stopScreenShare().catch(() => {});
    }
    unregisterCallFrame();
    setActiveSession(null);
    setViewState("normal");
  }, [isSharingScreen, stopScreenShare, unregisterCallFrame]);

  const leaveSession = useCallback(async () => {
    if (!activeSession) return;

    if (isSharingScreen) {
      await stopScreenShare().catch(() => {});
    }
    unregisterCallFrame();

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
  }, [activeSession, isSharingScreen, stopScreenShare, unregisterCallFrame, router]);

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
        isSharingScreen,
        setIsSharingScreen,
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
        toggleScreenShare,
        startScreenShare,
        stopScreenShare,
        registerCallFrame,
        unregisterCallFrame,
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
