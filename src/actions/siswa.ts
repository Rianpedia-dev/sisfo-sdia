"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession, setSessionCookie } from "@/lib/auth";

import { saveUploadedFile } from "@/lib/upload";

async function checkStudent() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function savePrayerChecklistAction(formData: FormData) {
  const session = await checkStudent();

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const subuh = formData.get("subuh") === "on" ? "1" : "0";
  const dhuha = formData.get("dhuha") === "on" ? "1" : "0";
  const dzuhur = formData.get("dzuhur") === "on" ? "1" : "0";
  const ashar = formData.get("ashar") === "on" ? "1" : "0";
  const maghrib = formData.get("maghrib") === "on" ? "1" : "0";
  const isya = formData.get("isya") === "on" ? "1" : "0";

  const studentId = parseInt(session.id, 10) || 2;

  await prisma.prayer.upsert({
    where: {
      id_date: {
        id: studentId,
        date: todayStr,
      },
    },
    update: {
      subuh,
      dhuha,
      dzuhur,
      ashar,
      maghrib,
      isya,
    },
    create: {
      id: studentId,
      date: todayStr,
      subuh,
      dhuha,
      dzuhur,
      ashar,
      maghrib,
      isya,
      verified_guru: "unverified",
    },
  });

  revalidatePath("/siswa/prayers");
  revalidatePath("/siswa/prayers/history");
  return { success: true, message: "Checklist sholat hari ini berhasil disimpan." };
}

export async function updateStudentProfileAction(formData: FormData) {
  const session = await checkStudent();

  const address = formData.get("address") as string;
  const skills = formData.get("skills") as string;
  const notes = formData.get("notes") as string;
  const removeImage = formData.get("remove_image") === "true";

  const dataToUpdate: Record<string, unknown> = {
    address: address || null,
    skills: skills || null,
    notes: notes || null,
  };

  if (removeImage) {
    dataToUpdate.image = null;
  } else {
    const rawFile = formData.get("image") || formData.get("photo");
    if (rawFile && typeof rawFile === "object" && "size" in rawFile && (rawFile as Blob).size > 0) {
      const uploadRes = await saveUploadedFile(rawFile as Blob, { category: "avatar" });
      if (!uploadRes.success) {
        return { success: false, error: uploadRes.error || "Gagal mengunggah foto profil." };
      }
      if (uploadRes.filePath) {
        dataToUpdate.image = uploadRes.filePath;
      }
    }
  }

  const isNum = /^\d+$/.test(session.id);
  if (isNum) {
    await prisma.user.update({
      where: { id: BigInt(session.id) },
      data: dataToUpdate,
    });
  }

  const newImage = dataToUpdate.image !== undefined ? (dataToUpdate.image as string | null) : session.image;

  await setSessionCookie({
    ...session,
    image: newImage,
  });

  revalidatePath("/", "layout");
  revalidatePath("/siswa/profile");
  revalidatePath("/siswa");
  return { success: true, message: "Profil berhasil diperbarui.", image: newImage };
}

export const updateProfileAction = updateStudentProfileAction;

export async function uploadPhotoAction(formData: FormData) {
  const session = await checkStudent();

  const rawFile = formData.get("image") || formData.get("photo") || formData.get("file");
  if (!rawFile || typeof rawFile !== "object" || !("size" in rawFile) || (rawFile as Blob).size === 0) {
    return { success: false, error: "Silakan pilih file foto terlebih dahulu." };
  }

  const uploadRes = await saveUploadedFile(rawFile as Blob, { category: "avatar" });
  if (!uploadRes.success) {
    return { success: false, error: uploadRes.error };
  }

  const isNum = /^\d+$/.test(session.id);
  if (isNum) {
    await prisma.user.update({
      where: { id: BigInt(session.id) },
      data: { image: uploadRes.filePath },
    });
  }

  await setSessionCookie({
    ...session,
    image: uploadRes.filePath,
  });

  revalidatePath("/", "layout");
  revalidatePath("/siswa/profile");
  revalidatePath("/siswa");
  return { success: true, filePath: uploadRes.filePath, message: "Foto profil berhasil diperbarui." };
}

export async function toggleLikeAnnouncementAction(announcementId: string) {
  const session = await checkStudent();

  const existingLike = await prisma.like.findFirst({
    where: {
      user_id: session.id,
      post_id: announcementId,
    },
  });

  const announcement = await prisma.pengumuman.findUnique({
    where: { id: BigInt(announcementId) },
  });

  if (!announcement) return { error: "Pengumuman tidak ditemukan" };

  let currentLikes = parseInt(announcement.like || "0", 10) || 0;

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    });
    currentLikes = Math.max(0, currentLikes - 1);
  } else {
    await prisma.like.create({
      data: {
        user_id: session.id,
        post_id: announcementId,
      },
    });
    currentLikes += 1;
  }

  await prisma.pengumuman.update({
    where: { id: BigInt(announcementId) },
    data: { like: String(currentLikes) },
  });

  revalidatePath("/admin");
  revalidatePath("/guru");
  revalidatePath("/siswa");
  return { success: true, liked: !existingLike, count: currentLikes };
}
