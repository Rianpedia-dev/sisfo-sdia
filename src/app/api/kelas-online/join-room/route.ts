import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createMeetingToken } from "@/lib/daily";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { roomId?: string };
    const roomId = body.roomId;

    if (!roomId) {
      return NextResponse.json({ error: "roomId diperlukan" }, { status: 400 });
    }

    // Find the room
    const room = await prisma.kelasOnline.findUnique({
      where: { id: BigInt(roomId) },
    });

    if (!room) {
      return NextResponse.json({ error: "Kelas online tidak ditemukan." }, { status: 404 });
    }

    if (room.status !== "active") {
      return NextResponse.json({ error: "Kelas online sudah berakhir." }, { status: 400 });
    }

    // Security: siswa can only join rooms matching their class
    if (session.role === "siswa" && session.kelas !== room.kelas) {
      return NextResponse.json(
        { error: "Anda tidak dapat bergabung ke kelas ini." },
        { status: 403 }
      );
    }

    // Generate meeting token
    const isOwner = session.role === "guru";
    const expTimestamp = Math.floor(Date.now() / 1000) + 60 * 60 * 4;

    const tokenResponse = await createMeetingToken({
      room_name: room.room_name,
      user_name: session.name,
      is_owner: isOwner,
      exp: expTimestamp,
    });

    // Record attendance
    const attendance = await prisma.kelasOnlineAttendance.create({
      data: {
        kelas_online_id: room.id,
        user_id: BigInt(session.id),
        user_name: session.name,
        user_role: session.role,
        joined_at: new Date(),
        created_at: new Date(),
      },
    });

    return NextResponse.json({
      roomUrl: room.room_url,
      roomName: room.room_name,
      token: tokenResponse.token,
      attendanceId: attendance.id.toString(),
    });
  } catch (error: unknown) {
    console.error("Error joining room:", error);
    const message = error instanceof Error ? error.message : "Gagal bergabung ke kelas online.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
