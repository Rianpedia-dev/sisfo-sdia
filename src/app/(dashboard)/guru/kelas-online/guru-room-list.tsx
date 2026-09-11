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

interface GuruRoomListProps {
  rooms: RoomData[];
  variant: "active" | "ended";
}

export function GuruRoomList({ rooms, variant }: GuruRoomListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleJoin = (roomId: string) => {
    router.push(`/guru/kelas-online/${roomId}`);
  };

  const handleEnd = async (roomId: string) => {
    if (!confirm("Yakin ingin mengakhiri kelas ini?")) return;

    setLoadingId(roomId);
    try {
      const res = await fetch("/api/kelas-online/end-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengakhiri kelas");

      toast.success("Kelas online telah diakhiri.");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          variant={variant}
          role="guru"
          onJoin={() => handleJoin(room.id)}
          onEnd={() => handleEnd(room.id)}
          isLoading={loadingId === room.id}
        />
      ))}
    </div>
  );
}
