import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build where clause based on role
    const whereClause: Record<string, unknown> = {
      status: "active",
    };

    if (session.role === "siswa") {
      // Siswa can only see rooms for their class
      whereClause.kelas = session.kelas || "";
    } else if (session.role === "guru") {
      // Guru sees rooms they created
      whereClause.guru_id = BigInt(session.id);
    }
    // Admin sees all active rooms (no additional filter)

    const rooms = await prisma.kelasOnline.findMany({
      where: whereClause,
      include: {
        attendance: {
          where: { left_at: null },
          select: { id: true },
        },
      },
      orderBy: { started_at: "desc" },
    });

    const serialized = rooms.map((room) => ({
      id: room.id.toString(),
      room_name: room.room_name,
      room_url: room.room_url,
      guru_name: room.guru_name,
      kelas: room.kelas,
      mata_pelajaran: room.mata_pelajaran,
      status: room.status,
      started_at: room.started_at?.toISOString() || null,
      max_participants: room.max_participants,
      active_participants: room.attendance.length,
    }));

    return NextResponse.json(serialized);
  } catch (error: unknown) {
    console.error("Error fetching active rooms:", error);
    return NextResponse.json([], { status: 200 });
  }
}
