"use client";

import { useState, useEffect } from "react";
import { Loader2, ExternalLink, Maximize2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoRoomProps {
  roomUrl: string;
  token: string;
  userName: string;
  onLeave?: () => void;
}

export function VideoRoom({ roomUrl, token, onLeave }: VideoRoomProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Build the complete Daily Prebuilt URL with token
  const embedUrl = token ? `${roomUrl}?t=${token}` : roomUrl;

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Listen for Daily Prebuilt leave events
      if (
        e.data &&
        (e.data.action === "left-meeting" ||
          e.data.event === "left-meeting" ||
          e.data.msg === "left-meeting")
      ) {
        onLeave?.();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onLeave]);

  return (
    <div
      id="standalone-video-container"
      className="relative w-full flex-1 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col"
      style={{ minHeight: "560px", height: "100%" }}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/95 text-white gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-emerald-500" />
          <p className="text-sm font-medium text-slate-300">
            Menghubungkan ke ruang kelas online...
          </p>
        </div>
      )}

      {/* Daily Prebuilt Iframe */}
      <iframe
        src={embedUrl}
        allow="camera *; microphone *; fullscreen *; display-capture *; autoplay *"
        className="w-full h-full flex-1 border-0"
        style={{ minHeight: "560px" }}
        onLoad={() => setIsLoading(false)}
        title="Ruang Kelas Online SD Al-Azhar Cairo"
      />

      {/* Helper footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 backdrop-blur-md text-xs text-slate-400 border-t border-slate-800">
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          Daily Prebuilt Video Call • SD Al-Azhar Cairo
        </span>
        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
        >
          <ExternalLink className="h-3 w-3" />
          Buka di Tab Terpisah (Jika Kamera Terhalang)
        </a>
      </div>
    </div>
  );
}
