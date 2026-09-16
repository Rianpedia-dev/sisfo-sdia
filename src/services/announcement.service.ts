import prisma from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { serializeBigInt } from "@/lib/serializer";

export interface CreateAnnouncementInput {
  title: string;
  from: string;
  pengumuman: string;
  file?: string | null;
}

export interface UpdateAnnouncementInput {
  id: string;
  title?: string;
  from?: string;
  pengumuman?: string;
  file?: string | null;
}

export class AnnouncementService {
  /**
   * Membuat pengumuman baru
   */
  static async createAnnouncement(data: CreateAnnouncementInput) {
    const created = await prisma.pengumuman.create({
      data: {
        title: data.title,
        from: data.from,
        pengumuman: data.pengumuman,
        file: data.file || null,
        like: "0",
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return serializeBigInt(created);
  }

  /**
   * Memperbarui pengumuman yang ada
   */
  static async updateAnnouncement(data: UpdateAnnouncementInput) {
    const existing = await prisma.pengumuman.findUnique({
      where: { id: BigInt(data.id) },
    });

    if (!existing) {
      throw new NotFoundError("Pengumuman tidak ditemukan.");
    }

    const dataToUpdate: Record<string, unknown> = {};
    if (data.title !== undefined) dataToUpdate.title = data.title;
    if (data.from !== undefined) dataToUpdate.from = data.from;
    if (data.pengumuman !== undefined) dataToUpdate.pengumuman = data.pengumuman;
    if (data.file !== undefined) dataToUpdate.file = data.file;

    const updated = await prisma.pengumuman.update({
      where: { id: BigInt(data.id) },
      data: dataToUpdate,
    });

    return serializeBigInt(updated);
  }

  /**
   * Menghapus pengumuman
   */
  static async deleteAnnouncement(id: string) {
    const existing = await prisma.pengumuman.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      throw new NotFoundError("Pengumuman tidak ditemukan.");
    }

    await prisma.pengumuman.delete({
      where: { id: BigInt(id) },
    });

    // Bersihkan likes terkait
    await prisma.like.deleteMany({
      where: { post_id: id },
    });

    return true;
  }

  /**
   * Toggle suka / like pada pengumuman
   */
  static async toggleLike(announcementId: string, userId: string) {
    const announcement = await prisma.pengumuman.findUnique({
      where: { id: BigInt(announcementId) },
    });

    if (!announcement) {
      throw new NotFoundError("Pengumuman tidak ditemukan.");
    }

    const existingLike = await prisma.like.findFirst({
      where: {
        user_id: userId,
        post_id: announcementId,
      },
    });

    let currentLikes = parseInt(announcement.like || "0", 10) || 0;
    let liked = false;

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      currentLikes = Math.max(0, currentLikes - 1);
      liked = false;
    } else {
      await prisma.like.create({
        data: {
          user_id: userId,
          post_id: announcementId,
        },
      });
      currentLikes += 1;
      liked = true;
    }

    await prisma.pengumuman.update({
      where: { id: BigInt(announcementId) },
      data: { like: String(currentLikes) },
    });

    return { liked, count: currentLikes };
  }
}
