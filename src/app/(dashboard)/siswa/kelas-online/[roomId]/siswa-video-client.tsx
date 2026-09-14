"use client";

import React, { useEffect } from "react";
import { ClassroomTopBar } from "@/components/kelas-online/classroom-top-bar";
import { useKelasOnline } from "@/components/kelas-online/kelas-online-context";

interface RoomData {
  id: string;
  room_name: string;
  room_url: string;
  guru_name: string;
  kelas: string;
  mata_pelajaran: string | null;
}

interface SiswaVideoCallClientProps {
  room: RoomData;
  token: string;
  userName: string;
  attendanceId: string;
}

export function SiswaVideoCallClient({
  room,
  token,
  userName,
  attendanceId,
}: SiswaVideoCallClientProps) {
  const { activeSession, startSession } = useKelasOnline();

  // Initialize or synchronize active call session in global context
  useEffect(() => {
    if (!activeSession || activeSession.roomId !== room.id) {
      startSession({
        roomId: room.id,
        roomName: room.room_name,
        roomUrl: room.room_url,
        token: token,
        userName: userName,
        role: "siswa",
        kelas: room.kelas,
        mataPelajaran: room.mata_pelajaran,
        guruName: room.guru_name,
        attendanceId: attendanceId,
      });
    }
  }, [activeSession, room, token, userName, attendanceId, startSession]);

  return (
    <div className="flex flex-col gap-3.5 min-h-[calc(100vh-130px)] pb-4">
      {/* Interactive Top Bar */}
      <ClassroomTopBar role="siswa" />

      {/* Video Anchor Slot: PersistentVideoHost tracks this element */}
      <div
        id="kelas-video-anchor"
        className="w-full flex-1 rounded-2xl min-h-[520px] sm:min-h-[580px] h-[calc(100vh-210px)] border border-dashed border-slate-200 dark:border-slate-800 bg-slate-950/5 relative"
      />
    </div>
  );
}
