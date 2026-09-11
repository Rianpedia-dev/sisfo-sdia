import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let attendanceList: any[] = [];
  try {
    const isNum = /^\d+$/.test(session.id);
    if (isNum) {
      attendanceList = await prisma.absen.findMany({
        where: { user_id: BigInt(session.id) },
      });
    }
  } catch (e) {
    console.error("Database query error in attendance history API:", e);
  }

  const colorMap: Record<string, string> = {
    Hadir: "#198754",
    Sakit: "#0d6efd",
    Izin: "#eab308",
    Alpha: "#dc3545",
  };

  const events = attendanceList.map((a) => {
    // a.date is stored as "Y-m-j" or "Y-m-d"
    const parts = (a.date || "").split("-");
    const formattedDate = parts.length === 3
      ? `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`
      : a.date;

    const ket = a.keterangan || "Hadir";
    const bg = colorMap[ket] || "#198754";

    return {
      id: a.id.toString(),
      title: `${ket}`,
      start: formattedDate,
      allDay: true,
      backgroundColor: bg,
      borderColor: bg,
      extendedProps: {
        keterangan: ket,
        kelas: a.kelas,
      },
    };
  });

  return NextResponse.json(events);
}
