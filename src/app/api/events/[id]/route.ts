import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "guru")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { title, description, startTime, endTime, color, category } = body;

    if (/^\d+$/.test(id)) {
      await prisma.event.update({
        where: { id: BigInt(id) },
        data: {
          ...(title ? { title } : {}),
          ...(description !== undefined ? { deskripsi: description } : {}),
          ...(startTime ? { start: new Date(startTime) } : {}),
          ...(endTime ? { end: new Date(endTime) } : {}),
          ...(color ? { backgroundColor: color } : {}),
          ...(category ? { kelas: category } : {}),
        },
      });
    }

    return NextResponse.json({ success: true, message: "Event berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Gagal memperbarui event" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "guru")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    if (/^\d+$/.test(id)) {
      await prisma.event.delete({
        where: { id: BigInt(id) },
      });
    }
    return NextResponse.json({ success: true, message: "Event berhasil dihapus" });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus event" }, { status: 500 });
  }
}

