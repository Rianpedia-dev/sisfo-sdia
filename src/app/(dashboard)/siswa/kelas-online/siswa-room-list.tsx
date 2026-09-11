"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoomCard } from "@/components/kelas-online/room-card";
import { toast } from "sonner";

interface RoomData {
  id: string;
  room_name: string;
  guru_name: string;
  kelas: string;
  mata_pelajaran: string | null;
  status: string;
  started_at: string | null;
  active_participants?: number;
}

interface SiswaRoomListProps {
  rooms: RoomData[];
}

export function SiswaRoomList({ rooms }: SiswaRoomListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleJoin = async (roomId: string) => {
    setLoadingId(roomId);
    try {
      // Pre-join via API (to record attendance and get token)
      const res = await fetch("/api/kelas-online/join-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal bergabung ke kelas");

      router.push(`/siswa/kelas-online/${roomId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(message);
      setLoadingId(null);
    }
  };

  return (
    <div className="grid gap-3">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          variant="active"
          role="siswa"
          onJoin={() => handleJoin(room.id)}
          isLoading={loadingId === room.id}
        />
      ))}
    </div>
  );
}
