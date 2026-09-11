"use client";

import React, { useEffect } from "react";
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
    <div className="flex flex-col gap-3.5 -mx-3.5 sm:-mx-5 md:-mx-6 lg:-mx-8 -mt-3.5 sm:-mt-5 md:-mt-6 lg:-mt-8 min-h-[calc(100vh-140px)]">
      {/* Interactive Top Bar */}
      <ClassroomTopBar role="siswa" />

      {/* Main Classroom Area */}
      <div className="flex-1 px-3 sm:px-5 md:px-6 flex flex-col gap-3 pb-4">
        {/* Child & Non-IT Friendly Guidance Banner */}
        <ClassroomAssistantBanner
          userName={userName}
          role="siswa"
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
