import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createMeetingToken } from "@/lib/daily";
import { SiswaVideoCallClient } from "./siswa-video-client";

export const dynamic = "force-dynamic";

export default async function SiswaVideoCallPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "siswa") {
    redirect("/login");
  }

  const { roomId } = await params;

  // Fetch room data
  const room = await prisma.kelasOnline.findUnique({
    where: { id: BigInt(roomId) },
  });

  if (!room || room.status !== "active") {
    redirect("/siswa/kelas-online");
  }

  // Security check: student can only join rooms for their class
  if (session.kelas !== room.kelas) {
    redirect("/siswa/kelas-online");
  }

  // Generate meeting token for siswa (not owner)
  let token = "";
  let attendanceId = "";
  try {
    const expTimestamp = Math.floor(Date.now() / 1000) + 60 * 60 * 4;
    const tokenResponse = await createMeetingToken({
      room_name: room.room_name,
      user_name: session.name,
      is_owner: false,
      exp: expTimestamp,
    });
    token = tokenResponse.token;

    // Find existing active attendance or create new
    let attendance = await prisma.kelasOnlineAttendance.findFirst({
      where: {
        kelas_online_id: room.id,
        user_id: BigInt(session.id),
        left_at: null,
      },
      orderBy: { joined_at: "desc" },
    });

    if (!attendance) {
      attendance = await prisma.kelasOnlineAttendance.create({
        data: {
          kelas_online_id: room.id,
          user_id: BigInt(session.id),
          user_name: session.name,
          user_role: "siswa",
          joined_at: new Date(),
          created_at: new Date(),
        },
      });
    }
    attendanceId = attendance.id.toString();
  } catch (e) {
    console.error("Error creating token/attendance:", e);
    redirect("/siswa/kelas-online");
  }

  const roomData = {
    id: room.id.toString(),
    room_name: room.room_name,
    room_url: room.room_url,
    guru_name: room.guru_name,
    kelas: room.kelas,
    mata_pelajaran: room.mata_pelajaran,
  };

  return (
    <SiswaVideoCallClient
      room={roomData}
      token={token}
      userName={session.name}
      attendanceId={attendanceId}
    />
  );
}
