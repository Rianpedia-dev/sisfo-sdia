"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession, setSessionCookie } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/upload";
import { PrayerService } from "@/services/prayer.service";
import { AnnouncementService } from "@/services/announcement.service";
import { UserService } from "@/services/user.service";

async function checkStudent() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function savePrayerChecklistAction(formData: FormData) {
  try {
    const session = await checkStudent();
    const studentId = parseInt(session.id, 10) || 2;

    const checklist = {
      subuh: formData.get("subuh") === "on",
      dhuha: formData.get("dhuha") === "on",
      dzuhur: formData.get("dzuhur") === "on",
      ashar: formData.get("ashar") === "on",
      maghrib: formData.get("maghrib") === "on",
      isya: formData.get("isya") === "on",
    };

    await PrayerService.saveChecklist(studentId, checklist);

    revalidatePath("/siswa/prayers");
    revalidatePath("/siswa/prayers/history");
    return { success: true, message: "Checklist sholat hari ini berhasil disimpan." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menyimpan checklist sholat.";
    return { success: false, error: errorMsg };
  }
}

export async function updateStudentProfileAction(formData: FormData) {
  try {
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
      await UserService.updateUser({
        id: session.id,
        ...dataToUpdate,
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
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui profil siswa.";
    return { success: false, error: errorMsg };
  }
}

export const updateProfileAction = updateStudentProfileAction;

export async function uploadPhotoAction(formData: FormData) {
  try {
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
      await UserService.updateUser({
        id: session.id,
        image: uploadRes.filePath,
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
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal mengunggah foto profil.";
    return { success: false, error: errorMsg };
  }
}

export async function toggleLikeAnnouncementAction(announcementId: string) {
  try {
    const session = await checkStudent();
    const result = await AnnouncementService.toggleLike(announcementId, session.id);

    revalidatePath("/admin");
    revalidatePath("/guru");
    revalidatePath("/siswa");
    return { success: true, liked: result.liked, count: result.count };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menyukai pengumuman.";
    return { error: errorMsg };
  }
}
