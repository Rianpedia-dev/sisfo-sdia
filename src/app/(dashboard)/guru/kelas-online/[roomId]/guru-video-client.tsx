"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClassroomTopBar } from "@/components/kelas-online/classroom-top-bar";
import { ClassroomAssistantBanner } from "@/components/kelas-online/classroom-assistant-banner";
import { useKelasOnline } from "@/components/kelas-online/kelas-online-context";

interface RoomData {
  id: string;
  room_name: string;
  room_url: string;
  guru_name: string;
  kelas: string;
  mata_pelajaran: string | null;
  started_at: string | null;
  active_participants: number;
}

interface GuruVideoCallClientProps {
  room: RoomData;
  token: string;
  userName: string;
}

export function GuruVideoCallClient({
  room,
  token,
  userName,
}: GuruVideoCallClientProps) {
  const router = useRouter();
  const { activeSession, startSession, endSession } = useKelasOnline();
  const [isEnding, setIsEnding] = useState(false);

  // Initialize or synchronize active call session in global context
  useEffect(() => {
    if (!activeSession || activeSession.roomId !== room.id) {
      startSession({
        roomId: room.id,
        roomName: room.room_name,
        roomUrl: room.room_url,
        token: token,
        userName: userName,
        role: "guru",
        kelas: room.kelas,
        mataPelajaran: room.mata_pelajaran,
        guruName: room.guru_name,
        startedAt: room.started_at,
        activeParticipants: room.active_participants,
      });
    }
  }, [activeSession, room, token, userName, startSession]);

  const handleEndClass = async () => {
    setIsEnding(true);
    try {
      const res = await fetch("/api/kelas-online/end-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: room.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengakhiri kelas");

      toast.success("Kelas online telah berhasil diakhiri.");
      endSession();
      router.push("/guru/kelas-online");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(message);
      setIsEnding(false);
    }
  };

  return (
    <div className="flex flex-col gap-3.5 -mx-3.5 sm:-mx-5 md:-mx-6 lg:-mx-8 -mt-3.5 sm:-mt-5 md:-mt-6 lg:-mt-8 min-h-[calc(100vh-140px)]">
      {/* Interactive Top Bar */}
      <ClassroomTopBar
        role="guru"
        onEndClass={handleEndClass}
        isEnding={isEnding}
      />

      {/* Main Classroom Area */}
      <div className="flex-1 px-3 sm:px-5 md:px-6 flex flex-col gap-3 pb-4">
        {/* Child & Non-IT Friendly Guidance Banner */}
        <ClassroomAssistantBanner
          userName={userName}
          role="guru"
          guruName={room.guru_name}
          mataPelajaran={room.mata_pelajaran}
        />

        {/* Video Anchor Slot: PersistentVideoHost tracks this element */}
        <div
          id="kelas-video-anchor"
          className="w-full flex-1 rounded-2xl min-h-[560px] h-[calc(100vh-250px)] border border-dashed border-slate-200 dark:border-slate-800 bg-slate-950/5 relative"
        />
      </div>
    </div>
  );
}
