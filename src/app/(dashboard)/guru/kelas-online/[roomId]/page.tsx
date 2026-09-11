import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createMeetingToken } from "@/lib/daily";
import { GuruVideoCallClient } from "./guru-video-client";

export const dynamic = "force-dynamic";

export default async function GuruVideoCallPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "guru") {
    redirect("/login");
  }

  const { roomId } = await params;

  // Fetch room data
  const room = await prisma.kelasOnline.findUnique({
    where: { id: BigInt(roomId) },
    include: {
      attendance: {
        select: {
          id: true,
          user_name: true,
          user_role: true,
          joined_at: true,
          left_at: true,
          duration_minutes: true,
        },
      },
    },
  });

  if (!room || room.status !== "active" || room.guru_id.toString() !== session.id) {
    redirect("/guru/kelas-online");
  }

  // Generate a fresh meeting token for the guru
  let token = "";
  try {
    const expTimestamp = Math.floor(Date.now() / 1000) + 60 * 60 * 4;
    const tokenResponse = await createMeetingToken({
      room_name: room.room_name,
      user_name: session.name,
      is_owner: true,
      exp: expTimestamp,
    });
    token = tokenResponse.token;
  } catch (e) {
    console.error("Error creating meeting token:", e);
    redirect("/guru/kelas-online");
  }

  const roomData = {
    id: room.id.toString(),
    room_name: room.room_name,
    room_url: room.room_url,
    guru_name: room.guru_name,
    kelas: room.kelas,
    mata_pelajaran: room.mata_pelajaran,
    started_at: room.started_at?.toISOString() || null,
    active_participants: room.attendance.filter((a) => !a.left_at).length,
  };

  return (
    <GuruVideoCallClient
      room={roomData}
      token={token}
      userName={session.name}
    />
  );
}
