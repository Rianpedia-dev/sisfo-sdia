import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Video, Clock, Users, BarChart3, Wifi } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminSessionLogSection } from "./admin-session-log-section";

export const dynamic = "force-dynamic";

interface ActiveRoomItem {
  id: string;
  guru_name: string;
  kelas: string;
  mata_pelajaran: string | null;
  started_at: string | null;
  active_participants: number;
}

interface SessionLogItem {
  id: string;
  guru_name: string;
  kelas: string;
  mata_pelajaran: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  duration_minutes: number | null;
  total_attendance: number;
}

export default async function AdminKelasOnlinePage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  let totalSessions = 0;
  let totalMinutes = 0;
  let avgDuration = 0;
  let avgParticipants = 0;
  let activeRooms: ActiveRoomItem[] = [];
  let allSessions: SessionLogItem[] = [];

  try {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Stats
    const allRooms = await prisma.kelasOnline.findMany({
      where: {
        created_at: { gte: firstOfMonth },
      },
      include: {
        attendance: {
          select: {
            user_role: true,
            duration_minutes: true,
            left_at: true,
          },
        },
      },
      orderBy: { started_at: "desc" },
    });

    totalSessions = allRooms.length;

    let totalDuration = 0;
    let totalParticipantsSum = 0;
    let countedSessions = 0;

    for (const room of allRooms) {
      if (room.started_at && room.ended_at) {
        const dur = Math.round(
          (room.ended_at.getTime() - room.started_at.getTime()) / 60000
        );
        totalDuration += dur;
        countedSessions++;
      }

      const siswaCount = room.attendance.filter((a) => a.user_role === "siswa").length;
      totalParticipantsSum += siswaCount;

      // Sum student minutes
      for (const att of room.attendance) {
        if (att.duration_minutes) {
          totalMinutes += att.duration_minutes;
        }
      }
    }

    avgDuration = countedSessions > 0 ? Math.round(totalDuration / countedSessions) : 0;
    avgParticipants = totalSessions > 0 ? Math.round(totalParticipantsSum / totalSessions) : 0;

    // Active rooms
    const dbActive = await prisma.kelasOnline.findMany({
      where: { status: "active" },
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
      guru_name: r.guru_name,
      kelas: r.kelas,
      mata_pelajaran: r.mata_pelajaran,
      started_at: r.started_at?.toISOString() || null,
      active_participants: r.attendance.length,
    }));

    // All sessions log (latest 30)
    allSessions = allRooms.slice(0, 30).map((r) => {
      const dur = r.started_at && r.ended_at
        ? Math.round((r.ended_at.getTime() - r.started_at.getTime()) / 60000)
        : null;
      const siswaCount = r.attendance.filter((a) => a.user_role === "siswa").length;

      return {
        id: r.id.toString(),
        guru_name: r.guru_name,
        kelas: r.kelas,
        mata_pelajaran: r.mata_pelajaran,
        status: r.status,
        started_at: r.started_at?.toISOString() || null,
        ended_at: r.ended_at?.toISOString() || null,
        duration_minutes: dur,
        total_attendance: siswaCount,
      };
    });
  } catch (e) {
    console.error("Error fetching admin kelas online data:", e);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Monitor Kelas Online
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pantau aktivitas kelas online bulan ini
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Sesi"
          value={totalSessions.toString()}
          icon={Video}
          description="Bulan ini"
          variant="emerald"
        />
        <StatCard
          title="Total Menit"
          value={totalMinutes.toLocaleString("id-ID")}
          icon={Clock}
          description="Menit belajar siswa"
          variant="blue"
        />
        <StatCard
          title="Rata-rata Durasi"
          value={`${avgDuration}m`}
          icon={BarChart3}
          description="Per sesi"
          variant="amber"
        />
        <StatCard
          title="Rata-rata Peserta"
          value={avgParticipants.toString()}
          icon={Users}
          description="Per sesi"
          variant="purple"
        />
      </div>

      {/* Active Now */}
      {activeRooms.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Wifi className="h-5 w-5 text-emerald-500" />
            Kelas Aktif Sekarang
            <Badge className="bg-emerald-500 text-white border-none text-xs">
              {activeRooms.length}
            </Badge>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeRooms.map((room) => (
              <Card
                key={room.id}
                className="border-emerald-200/50 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-emerald-500 text-white border-none animate-pulse text-xs">
                      🟢 AKTIF
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                      <Users className="h-3.5 w-3.5" />
                      {room.active_participants}
                    </div>
                  </div>
                  <p className="font-semibold">{room.mata_pelajaran || "Kelas Online"}</p>
                  <p className="text-sm text-muted-foreground">
                    👨‍🏫 {room.guru_name} • {room.kelas}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Log Table */}
      <AdminSessionLogSection sessions={allSessions} />
    </div>
  );
}
