import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { attendanceId?: string };
    const attendanceId = body.attendanceId;

    if (!attendanceId) {
      return NextResponse.json({ error: "attendanceId diperlukan" }, { status: 400 });
    }

    const attendance = await prisma.kelasOnlineAttendance.findUnique({
      where: { id: BigInt(attendanceId) },
    });

    if (!attendance) {
      return NextResponse.json({ error: "Data kehadiran tidak ditemukan." }, { status: 404 });
    }

    // Only update if not already left
    if (attendance.left_at) {
      return NextResponse.json({ success: true, message: "Sudah tercatat keluar sebelumnya." });
    }

    const now = new Date();
    const joinedAt = attendance.joined_at || now;
    const durationMs = now.getTime() - joinedAt.getTime();
    const durationMinutes = Math.round(durationMs / 60000);

    await prisma.kelasOnlineAttendance.update({
      where: { id: BigInt(attendanceId) },
      data: {
        left_at: now,
        duration_minutes: durationMinutes,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error leaving room:", error);
    const message = error instanceof Error ? error.message : "Gagal mencatat keluar dari kelas.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
