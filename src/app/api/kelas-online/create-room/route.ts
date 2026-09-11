import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createDailyRoom, createMeetingToken, generateRoomName } from "@/lib/daily";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "guru") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { mata_pelajaran?: string };
    const mataPelajaran = body.mata_pelajaran || "";
    const kelas = session.kelas || "";

    if (!kelas) {
      return NextResponse.json(
        { error: "Guru belum memiliki kelas yang terdaftar." },
        { status: 400 }
      );
    }

    // Generate unique room name
    const roomName = generateRoomName(kelas);

    // Create room on Daily.co (private)
    // Room expires in 4 hours
    const expTimestamp = Math.floor(Date.now() / 1000) + 60 * 60 * 4;
    const dailyRoom = await createDailyRoom(roomName, {
      privacy: "private",
      exp: expTimestamp,
    });

    // Generate meeting token for the guru (owner)
    const tokenResponse = await createMeetingToken({
      room_name: dailyRoom.name,
      user_name: session.name,
      is_owner: true,
      exp: expTimestamp,
    });

    // Save to database
    const kelasOnline = await prisma.kelasOnline.create({
      data: {
        room_name: dailyRoom.name,
        room_url: dailyRoom.url,
        daily_room_id: dailyRoom.id,
        guru_id: BigInt(session.id),
        guru_name: session.name,
        kelas: kelas,
        mata_pelajaran: mataPelajaran || null,
        status: "active",
        started_at: new Date(),
        max_participants: dailyRoom.config?.max_participants ?? 20,
        created_at: new Date(),
      },
    });

    // Also record guru attendance
    await prisma.kelasOnlineAttendance.create({
      data: {
        kelas_online_id: kelasOnline.id,
        user_id: BigInt(session.id),
        user_name: session.name,
        user_role: "guru",
        joined_at: new Date(),
        created_at: new Date(),
      },
    });

    return NextResponse.json({
      roomId: kelasOnline.id.toString(),
      roomUrl: dailyRoom.url,
      roomName: dailyRoom.name,
      token: tokenResponse.token,
    });
  } catch (error: unknown) {
    console.error("Error creating room:", error);
    const message = error instanceof Error ? error.message : "Gagal membuat kelas online.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
