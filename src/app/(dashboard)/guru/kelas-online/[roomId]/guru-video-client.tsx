"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClassroomTopBar } from "@/components/kelas-online/classroom-top-bar";
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
    <div className="flex flex-col gap-3.5 min-h-[calc(100vh-130px)] pb-4">
      {/* Interactive Top Bar */}
      <ClassroomTopBar
        role="guru"
        onEndClass={handleEndClass}
        isEnding={isEnding}
      />

      {/* Video Anchor Slot: PersistentVideoHost tracks this element */}
      <div
        id="kelas-video-anchor"
        className="w-full flex-1 rounded-2xl min-h-[520px] sm:min-h-[580px] h-[calc(100vh-210px)] border border-dashed border-slate-200 dark:border-slate-800 bg-slate-950/5 relative"
      />
    </div>
  );
}
