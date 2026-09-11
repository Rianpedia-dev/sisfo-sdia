import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let events: any[] = [];
  try {
    if (session.role === "admin") {
      events = await prisma.event.findMany({
        orderBy: { start: "asc" },
      });
    } else {
      // Filter events for user's class or admin/all-class events
      events = await prisma.event.findMany({
        where: {
          OR: [
            { kelas: "Semua Kelas" },
            { kelas: session.kelas || "" },
            { from: "admin" },
          ],
        },
        orderBy: { start: "asc" },
      });
    }
  } catch (e) {
    console.error("Database query error in events API:", e);
  }

  const formatted = events.map((e) => {
    const startDate = e.start instanceof Date ? e.start : new Date(e.start);
    const endDate = e.end ? (e.end instanceof Date ? e.end : new Date(e.end)) : new Date(startDate.getTime() + 3600000);

    return {
      id: e.id.toString(),
      title: e.title,
      description: e.deskripsi || "",
      startTime: startDate,
      endTime: endDate,
      color: e.backgroundColor || "blue",
      category: e.kelas || "Akademik",
      tags: [e.kelas || "Semua Kelas", e.from ? `Oleh: ${e.from}` : "Sekolah"],
      start: startDate.toISOString().split("T")[0],
      end: e.end ? (e.end instanceof Date ? e.end.toISOString().split("T")[0] : String(e.end)) : undefined,
      backgroundColor: e.backgroundColor || "#0284c7",
      extendedProps: {
        kelas: e.kelas,
        from: e.from,
        deskripsi: e.deskripsi,
      },
    };
  });

  return NextResponse.json(formatted);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, startTime, endTime, color, category, tags } = body;

    if (!title || !startTime) {
      return NextResponse.json({ error: "Judul dan waktu mulai wajib diisi" }, { status: 400 });
    }

    const startDate = new Date(startTime);
    const endDate = endTime ? new Date(endTime) : null;

    const newEvent = await prisma.event.create({
      data: {
        title,
        kelas: category || "Semua Kelas",
        from: session.role === "admin" ? "admin" : session.name,
        start: startDate,
        end: endDate,
        deskripsi: description || null,
        backgroundColor: color || "#0284c7",
      },
    });

    return NextResponse.json({
      success: true,
      event: {
        id: newEvent.id.toString(),
        title: newEvent.title,
        description: newEvent.deskripsi || "",
        startTime: newEvent.start,
        endTime: newEvent.end || newEvent.start,
        color: newEvent.backgroundColor || "blue",
        category: newEvent.kelas,
        tags: tags || [newEvent.kelas],
      },
    });
  } catch (error: any) {
    console.error("Error creating event in API:", error);
    return NextResponse.json({ error: "Gagal menyimpan kegiatan" }, { status: 500 });
  }
}

