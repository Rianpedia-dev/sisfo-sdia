"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Maximize2,
  Minimize2,
  Tv,
  HelpCircle,
  LogOut,
  ExternalLink,
  Loader2,
  ScreenShare,
  StopCircle,
} from "lucide-react";
import type { DailyCall } from "@daily-co/daily-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useKelasOnline } from "./kelas-online-context";
import { ClassroomHelpModal } from "./classroom-help-modal";

export function PersistentVideoHost() {
  const pathname = usePathname();
  const {
    activeSession,
    viewState,
    isHelpOpen,
    isSharingScreen,
    setIsSharingScreen,
    toggleScreenShare,
    registerCallFrame,
    unregisterCallFrame,
    closeHelp,
    openHelp,
    restore,
    minimize,
    toggleFullscreen,
    toggleTheater,
    leaveSession,
  } = useKelasOnline();

  const [isLoading, setIsLoading] = useState(true);
  const [anchorRect, setAnchorRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const isRoomPage = activeSession
    ? pathname === `/guru/kelas-online/${activeSession.roomId}` ||
      pathname === `/siswa/kelas-online/${activeSession.roomId}`
    : false;

  const embedUrl = activeSession
    ? activeSession.token
      ? `${activeSession.roomUrl}?t=${activeSession.token}`
      : activeSession.roomUrl
    : "";

  // Track anchor position on the room page
  useEffect(() => {
    if (!activeSession) return;

    const updateAnchor = () => {
      const anchor = document.getElementById("kelas-video-anchor");
      if (anchor) {
        const rect = anchor.getBoundingClientRect();
        setAnchorRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      } else {
        setAnchorRect(null);
      }
    };

    updateAnchor();

    const resizeObserver = new ResizeObserver(() => {
      updateAnchor();
    });

    const anchorEl = document.getElementById("kelas-video-anchor");
    if (anchorEl) {
      resizeObserver.observe(anchorEl);
    }

    window.addEventListener("resize", updateAnchor);
    window.addEventListener("scroll", updateAnchor, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateAnchor);
      window.removeEventListener("scroll", updateAnchor, true);
    };
  }, [activeSession, pathname, viewState]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const callFrameRef = useRef<DailyCall | null>(null);

  // Setup DailyIframe wrapper and sync screen sharing
  useEffect(() => {
    if (!iframeRef.current) return;

    let callFrame: DailyCall | null = null;
    let isCancelled = false;

    const initDaily = async () => {
      try {
        const DailyModule = await import("@daily-co/daily-js");
        const Daily = DailyModule.default;

        if (isCancelled || !iframeRef.current) return;

        callFrame =
          Daily.getCallInstance() ||
          Daily.wrap(iframeRef.current, {
            url: embedUrl,
          });
        callFrameRef.current = callFrame;
        registerCallFrame(callFrame, iframeRef.current);

        const onJoinedMeeting = () => {
          setIsLoading(false);
        };
        const onScreenShareStarted = () => {
          setIsSharingScreen(true);
        };
        const onScreenShareStopped = () => {
          setIsSharingScreen(false);
        };
        const onLeftMeeting = () => {
          leaveSession();
        };

        callFrame.on("joined-meeting", onJoinedMeeting);
        callFrame.on("local-screen-share-started", onScreenShareStarted);
        callFrame.on("local-screen-share-stopped", onScreenShareStopped);
        callFrame.on("left-meeting", onLeftMeeting);

      } catch (err) {
        console.warn("Daily wrapper setup:", err);
      }
    };

    initDaily();

    return () => {
      isCancelled = true;
      unregisterCallFrame();
      if (callFrame) {
        try {
          callFrame.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [embedUrl, registerCallFrame, unregisterCallFrame, setIsSharingScreen, leaveSession, toggleScreenShare]);

  // Listen to Daily iframe postMessages (leave meeting, screen share started/stopped, etc.)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data) return;
      if (
        e.data.action === "joined-meeting" ||
        e.data.event === "joined-meeting" ||
        e.data.msg === "joined-meeting"
      ) {
        setIsLoading(false);
      }
      if (
        e.data.action === "left-meeting" ||
        e.data.event === "left-meeting" ||
        e.data.msg === "left-meeting"
      ) {
        leaveSession();
      }
      if (
        e.data.action === "local-screen-share-started" ||
        e.data.event === "local-screen-share-started"
      ) {
        setIsSharingScreen(true);
      }
      if (
        e.data.action === "local-screen-share-stopped" ||
        e.data.event === "local-screen-share-stopped"
      ) {
        setIsSharingScreen(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [leaveSession, setIsSharingScreen]);

  // Lock browser body and html scrollbar when in Fullscreen or Theater mode
  useEffect(() => {
    if (viewState === "fullscreen" || viewState === "theater") {
      const prevHtmlOverflow = document.documentElement.style.overflow;
      const prevBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";

      return () => {
        document.documentElement.style.overflow = prevHtmlOverflow;
        document.body.style.overflow = prevBodyOverflow;
      };
    }
  }, [viewState]);

  if (!activeSession) return null;

  // Determine container style and positioning based on viewState
  let containerStyle: React.CSSProperties = {};
  let containerClasses = "";

  if (viewState === "fullscreen") {
    containerClasses =
      "fixed inset-0 z-[9999] w-full h-full max-w-full max-h-full bg-slate-950 flex flex-col overflow-hidden";
    containerStyle = {
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
    };
  } else if (viewState === "theater") {
    containerClasses =
      "fixed inset-0 z-40 w-full h-full max-w-full max-h-full bg-slate-950 flex flex-col p-2 sm:p-4 overflow-hidden";
    containerStyle = {
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
    };
  } else if (viewState === "minimized" || !isRoomPage || !anchorRect) {
    // Floating Picture-in-Picture window at bottom right
    containerClasses =
      "fixed bottom-4 right-4 z-50 w-[330px] sm:w-[400px] h-[230px] sm:h-[270px] rounded-2xl shadow-2xl border-2 border-emerald-500/80 bg-slate-950 flex flex-col overflow-hidden transition-all duration-300 ease-out ring-4 ring-emerald-500/10";
    containerStyle = {};
  } else {
    // Normal in-page mode matching anchor position (z-10 so ClassroomTopBar and Navbar stay on top when scrolling)
    containerClasses =
      "fixed z-10 rounded-2xl overflow-hidden shadow-xl border border-slate-800 bg-slate-950 flex flex-col";
    containerStyle = {
      top: `${anchorRect.top}px`,
      left: `${anchorRect.left}px`,
      width: `${anchorRect.width}px`,
      height: `${anchorRect.height}px`,
    };
  }

  const isPip = viewState === "minimized" || !isRoomPage || !anchorRect;

  return (
    <>
      <div ref={containerRef} className={containerClasses} style={containerStyle}>
        {/* Top Header for Floating PIP or Fullscreen / Theater */}
        {isPip ? (
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-400 truncate leading-tight">
                  {activeSession.mataPelajaran || "Kelas Online"}
                </p>
                <p className="text-[10px] text-slate-400 truncate leading-tight">
                  {activeSession.kelas}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={restore}
                title="Perbesar ke Ruang Kelas"
                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={toggleFullscreen}
                title="Layar Penuh"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                <Tv className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={leaveSession}
                title="Keluar Kelas"
                className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : viewState === "fullscreen" || viewState === "theater" ? (
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shrink-0">
            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-600 text-white font-semibold">
                {activeSession.mataPelajaran || "Kelas Online"}
              </Badge>
              <span className="text-sm font-medium text-slate-300">
                {activeSession.kelas}
              </span>
              {activeSession.guruName && (
                <span className="text-xs text-slate-400 hidden sm:inline">
                  • {activeSession.guruName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Tombol Bagikan Layar - Khusus Tampilan Mobile & Tablet (Di Desktop sudah ada tombol Share bawaan video) */}
              <Button
                variant={isSharingScreen ? "destructive" : "outline"}
                size="sm"
                onClick={toggleScreenShare}
                className={`h-8 px-2.5 text-xs font-semibold rounded-lg cursor-pointer transition-all lg:hidden ${
                  isSharingScreen
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm ring-2 ring-rose-500/50 animate-pulse"
                    : "bg-emerald-700/80 hover:bg-emerald-600 border-emerald-500/50 text-emerald-100 hover:text-white"
                }`}
                title={isSharingScreen ? "Hentikan Berbagi Layar" : "Bagikan Layar Anda ke Semua Peserta"}
              >
                {isSharingScreen ? (
                  <>
                    <StopCircle className="h-3.5 w-3.5 mr-1 text-white" />
                    <span>Berhenti Berbagi</span>
                  </>
                ) : (
                  <>
                    <ScreenShare className="h-3.5 w-3.5 mr-1 text-emerald-300" />
                    <span>Bagikan Layar</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={openHelp}
                className="h-8 px-2.5 text-xs bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
              >
                <HelpCircle className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                Bantuan
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={minimize}
                className="h-8 px-2.5 text-xs bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
              >
                <Minimize2 className="h-3.5 w-3.5 mr-1" />
                Perkecil
              </Button>

              {viewState === "theater" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheater}
                  className="h-8 px-2.5 text-xs bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                >
                  <Tv className="h-3.5 w-3.5 mr-1" />
                  Keluar Teater
                </Button>
              )}

              {viewState === "fullscreen" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="h-8 px-2.5 text-xs bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                >
                  <Maximize2 className="h-3.5 w-3.5 mr-1" />
                  Keluar Layar Penuh (ESC)
                </Button>
              )}

              <Button
                variant="destructive"
                size="sm"
                onClick={leaveSession}
                className="h-8 px-3 text-xs font-bold"
              >
                <LogOut className="h-3.5 w-3.5 mr-1" />
                {activeSession.role === "guru" ? "Akhiri Kelas" : "Keluar"}
              </Button>
            </div>
          </div>
        ) : null}

        {/* Video Frame Body */}
        <div className="relative w-full flex-1 min-h-0 overflow-hidden bg-slate-950 flex flex-col">
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/95 text-white gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <p className="text-sm font-medium text-slate-300">
                Menghubungkan ke ruang kelas online...
              </p>
            </div>
          )}

          {/* Daily Prebuilt Iframe */}
          <iframe
            ref={iframeRef}
            src={embedUrl}
            allow="camera *; microphone *; fullscreen *; display-capture *; autoplay *"
            className="w-full h-full flex-1 border-0 block"
            scrolling="no"
            style={{ overflow: "hidden" }}
            onLoad={() => setIsLoading(false)}
            title="Ruang Kelas Online Al-Azhar"
          />

          {/* Helper Footer (only when not in minimized/PIP) */}
          {!isPip && (
            <div className="flex items-center justify-between gap-2 px-3.5 py-2 bg-slate-900/95 text-[11px] text-slate-400 border-t border-slate-800 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium truncate">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                  Kelas Online • SD Al-Azhar Cairo
                </span>
                {isSharingScreen && (
                  <button
                    type="button"
                    onClick={toggleScreenShare}
                    className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold flex items-center gap-1 shrink-0 animate-pulse hover:bg-rose-500/30 cursor-pointer transition-colors"
                    title="Klik untuk menghentikan berbagi layar"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
                    Sedang Berbagi Layar (Hentikan)
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={embedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors py-1 px-2 rounded-lg hover:bg-slate-800/60 text-xs font-medium"
                  title="Buka ruang kelas di tab peramban terpisah jika kamera atau layar terkendala"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Buka di Tab Terpisah</span>
                  <span className="sm:hidden">Tab Baru</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Child & Non-IT Friendly Help Modal */}
      <ClassroomHelpModal
        isOpen={isHelpOpen}
        onClose={closeHelp}
        role={activeSession.role}
      />
    </>
  );
}
