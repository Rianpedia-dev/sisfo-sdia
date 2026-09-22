import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateRoomForm } from "@/components/kelas-online/create-room-form";
import { GuruRoomList } from "./guru-room-list";
import { GuruHistorySection } from "./guru-history-section";

export const dynamic = "force-dynamic";

interface GuruActiveRoom {
  id: string;
  room_name: string;
  room_url: string;
  guru_name: string;
  kelas: string;
  mata_pelajaran: string | null;
  status: string;
  started_at: string | null;
  active_participants: number;
}

interface GuruEndedRoom {
  id: string;
  room_name: string;
  room_url: string;
  guru_name: string;
  kelas: string;
  mata_pelajaran: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  duration_minutes: number | null;
  total_attendance: number;
}

export default async function GuruKelasOnlinePage() {
  const session = await getSession();
  if (!session || session.role !== "guru") {
    redirect("/login");
  }

  const guruClass = session.kelas || "";

  // Fetch active rooms for this guru
  let activeRooms: GuruActiveRoom[] = [];
  let endedRooms: GuruEndedRoom[] = [];

  try {
    const [dbActive, dbEnded] = await Promise.all([
      prisma.kelasOnline.findMany({
        where: {
          guru_id: BigInt(session.id),
          status: "active",
        },
        include: {
          attendance: {
            where: { left_at: null },
            select: { id: true },
          },
        },
        orderBy: { started_at: "desc" },
      }),
      prisma.kelasOnline.findMany({
        where: {
          guru_id: BigInt(session.id),
          status: "ended",
        },
        include: {
          attendance: {
            where: { user_role: "siswa" },
            select: { id: true },
          },
        },
        orderBy: { ended_at: "desc" },
        take: 20,
      }),
    ]);

    activeRooms = dbActive.map((r) => ({
      id: r.id.toString(),
      room_name: r.room_name,
      room_url: r.room_url,
      guru_name: r.guru_name,
      kelas: r.kelas,
      mata_pelajaran: r.mata_pelajaran,
      status: r.status,
      started_at: r.started_at?.toISOString() || null,
      active_participants: r.attendance.length,
    }));

    endedRooms = dbEnded.map((r) => {
      const startMs = r.started_at?.getTime() || 0;
      const endMs = r.ended_at?.getTime() || 0;
      const durationMinutes = startMs && endMs ? Math.round((endMs - startMs) / 60000) : null;
      return {
        id: r.id.toString(),
        room_name: r.room_name,
        room_url: r.room_url,
        guru_name: r.guru_name,
        kelas: r.kelas,
        mata_pelajaran: r.mata_pelajaran,
        status: r.status,
        started_at: r.started_at?.toISOString() || null,
        ended_at: r.ended_at?.toISOString() || null,
        duration_minutes: durationMinutes,
        total_attendance: r.attendance.length,
      };
    });
  } catch (e) {
    console.error("Error fetching kelas online data:", e);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kelas Online
          </h1>
        </div>
        {guruClass && (
          <Badge className="w-fit bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/30">
            {guruClass}
          </Badge>
        )}
      </div>

      {/* Create Room Form */}
      <CreateRoomForm kelas={guruClass} />

      {/* Active Rooms */}
      {activeRooms.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Wifi className="h-5 w-5 text-emerald-500" />
            Kelas Aktif
            <Badge className="bg-emerald-500 text-white border-none text-xs">
              {activeRooms.length}
            </Badge>
          </h2>
          <GuruRoomList rooms={activeRooms} variant="active" />
        </div>
      )}

      {/* History */}
      <GuruHistorySection rooms={endedRooms} />
    </div>
  );
}
