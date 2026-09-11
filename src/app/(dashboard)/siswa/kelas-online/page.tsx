import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Video, History, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SiswaRoomList } from "./siswa-room-list";

export const dynamic = "force-dynamic";

interface SiswaActiveRoom {
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

interface SiswaHistoryRecord {
  id: string;
  mata_pelajaran: string;
  guru_name: string;
  joined_at: string | null;
  left_at: string | null;
  duration_minutes: number | null;
  date: string;
}

export default async function SiswaKelasOnlinePage() {
  const session = await getSession();
  if (!session || session.role !== "siswa") {
    redirect("/login");
  }

  const studentClass = session.kelas || "";

  let activeRooms: SiswaActiveRoom[] = [];
  let historyRecords: SiswaHistoryRecord[] = [];

  try {
    // Fetch active rooms for student's class
    const dbActive = await prisma.kelasOnline.findMany({
      where: {
        kelas: studentClass,
        status: "active",
      },
      include: {
        attendance: {
          where: { left_at: null },
          select: { id: true },
        },
      },
      orderBy: { started_at: "desc" },
    });

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

    // Fetch student's attendance history
    const isNum = /^\d+$/.test(session.id);
    if (isNum) {
      const dbHistory = await prisma.kelasOnlineAttendance.findMany({
        where: {
          user_id: BigInt(session.id),
        },
        include: {
          kelasOnline: {
            select: {
              mata_pelajaran: true,
              guru_name: true,
              kelas: true,
              started_at: true,
            },
          },
        },
        orderBy: { joined_at: "desc" },
        take: 20,
      });

      historyRecords = dbHistory.map((a) => ({
        id: a.id.toString(),
        mata_pelajaran: a.kelasOnline.mata_pelajaran || "Kelas Online",
        guru_name: a.kelasOnline.guru_name,
        joined_at: a.joined_at?.toISOString() || null,
        left_at: a.left_at?.toISOString() || null,
        duration_minutes: a.duration_minutes,
        date: a.kelasOnline.started_at?.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }) || "-",
      }));
    }
  } catch (e) {
    console.error("Error fetching siswa kelas online:", e);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Video className="h-6 w-6 text-emerald-600" />
          Kelas Online
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bergabung ke kelas online yang sedang berlangsung
        </p>
      </div>

      {/* Active Classes */}
      {activeRooms.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            Kelas Sedang Berlangsung
          </h2>
          <SiswaRoomList rooms={activeRooms} />
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Inbox className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-lg font-semibold text-muted-foreground">
              Tidak ada kelas online saat ini
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Tunggu guru memulai kelas ya! 😊
            </p>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5 text-slate-500" />
          Riwayat Kelas Sebelumnya
        </h2>
        {historyRecords.length > 0 ? (
          <div className="space-y-2">
            {historyRecords.map((rec) => (
              <Card key={rec.id} className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{rec.mata_pelajaran}</p>
                    <p className="text-xs text-muted-foreground">
                      👨‍🏫 {rec.guru_name} • {rec.date}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    ⏱{" "}
                    {rec.duration_minutes
                      ? rec.duration_minutes < 60
                        ? `${rec.duration_minutes} menit`
                        : `${Math.floor(rec.duration_minutes / 60)}j ${rec.duration_minutes % 60}m`
                      : "-"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <History className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>Belum ada riwayat kelas online</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
