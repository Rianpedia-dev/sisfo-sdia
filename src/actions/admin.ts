"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/upload";
import { UserService } from "@/services/user.service";
import { ClassService } from "@/services/class.service";
import { AnnouncementService } from "@/services/announcement.service";

async function checkAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized: Hanya Administrator yang berhak melakukan tindakan ini.");
  }
  return session;
}

export async function createUserAction(formData: FormData) {
  try {
    await checkAdmin();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = (formData.get("role") as string) || "1"; // 1=siswa, 2=guru, 4=wali
    const kelas = formData.get("kelas") as string;
    const appleid = (formData.get("appleid") as string) || null;
    const passwordappleid = (formData.get("passwordappleid") as string) || null;
    const gender = (formData.get("gender") as string) || "L";
    const nis = (formData.get("nis") as string) || null;
    const nip = (formData.get("nip") as string) || null;
    const guru_bidang = (formData.get("guru_bidang") as string) || null;

    if (!email || !password || !name) {
      return { error: "Nama, email, dan password wajib diisi." };
    }

    await UserService.createUser({
      name,
      email,
      password,
      role,
      kelas,
      appleid,
      passwordappleid,
      gender,
      nis,
      nip,
      guru_bidang,
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/teachers");
    return { success: true, message: "Pengguna berhasil ditambahkan." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menambahkan pengguna.";
    return { error: errorMsg };
  }
}

export async function updateUserAction(id: string, formData: FormData) {
  try {
    await checkAdmin();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const kelas = formData.get("kelas") as string;
    const appleid = formData.get("appleid") as string;
    const passwordappleid = formData.get("passwordappleid") as string;
    const ctt_iPad = formData.get("ctt_iPad") as string;
    const password = formData.get("password") as string;

    await UserService.updateUser({
      id,
      name,
      email,
      kelas: kelas || null,
      appleid: appleid || null,
      passwordappleid: passwordappleid || null,
      ctt_iPad: ctt_iPad || null,
      password: password || undefined,
    });

    revalidatePath(`/admin/students/${id}`);
    revalidatePath("/admin/students");
    return { success: true, message: "Data pengguna berhasil diperbarui." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui data pengguna.";
    return { error: errorMsg };
  }
}

export async function deleteUserAction(id: string) {
  try {
    await checkAdmin();
    await UserService.deleteUser(id);

    revalidatePath("/admin/students");
    revalidatePath("/admin/teachers");
    return { success: true, message: "Pengguna berhasil dihapus." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menghapus pengguna.";
    return { error: errorMsg };
  }
}

export async function verifyUserAction(id: string, status: string) {
  try {
    await checkAdmin();
    await UserService.verifyUser(id, status);

    revalidatePath("/admin/teachers");
    revalidatePath("/admin/students");
    return { success: true, message: "Status pengguna berhasil diperbarui." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui status pengguna.";
    return { error: errorMsg };
  }
}

export async function importStudentsAction(fileBufferBase64: string) {
  try {
    await checkAdmin();
    const importedCount = await UserService.importStudentsFromBase64(fileBufferBase64);

    revalidatePath("/admin/students");
    return { success: true, count: importedCount, message: `Berhasil mengimpor ${importedCount} siswa.` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal mengimpor file Excel";
    return { error: errorMsg };
  }
}

export const importUsersAction = importStudentsAction;

export async function createClassAction(formData: FormData) {
  try {
    await checkAdmin();

    const nama_kelas = formData.get("nama_kelas") as string;
    const wali_kelas = formData.get("wali_kelas") as string;
    const jumlah_siswa = formData.get("jumlah_siswa") as string;
    const code_restrict = formData.get("code_restrict") as string;

    await ClassService.createClass({
      nama_kelas,
      wali_kelas,
      jumlah_siswa,
      code_restrict,
    });

    revalidatePath("/admin/classes");
    return { success: true, message: "Kelas berhasil ditambahkan." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menambahkan kelas.";
    return { error: errorMsg };
  }
}

export async function updateClassAction(id: string, formData: FormData) {
  try {
    await checkAdmin();

    const nama_kelas = formData.get("nama_kelas") as string;
    const wali_kelas = formData.get("wali_kelas") as string;
    const jumlah_siswa = formData.get("jumlah_siswa") as string;
    const code_restrict = formData.get("code_restrict") as string;

    await ClassService.updateClass({
      id,
      nama_kelas,
      wali_kelas,
      jumlah_siswa,
      code_restrict,
    });

    revalidatePath("/admin/classes");
    revalidatePath(`/admin/classes/${id}`);
    return { success: true, message: "Data kelas dan wali kelas berhasil diperbarui." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui kelas.";
    return { error: errorMsg };
  }
}

export async function deleteClassAction(id: string) {
  try {
    await checkAdmin();
    await ClassService.deleteClass(id);

    revalidatePath("/admin/classes");
    return { success: true, message: "Kelas berhasil dihapus." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menghapus kelas.";
    return { error: errorMsg };
  }
}

export async function updateRestrictAction(id: string, code_restrict: string) {
  try {
    await checkAdmin();
    await ClassService.updateRestrictCode(id, code_restrict);

    revalidatePath("/admin");
    return { success: true, message: "Kode restrict berhasil diperbarui." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui kode restrict.";
    return { error: errorMsg };
  }
}

export async function deleteAnnouncementAction(id: string) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "guru")) {
      throw new Error("Unauthorized");
    }

    await AnnouncementService.deleteAnnouncement(id);

    revalidatePath("/admin");
    revalidatePath("/guru");
    revalidatePath("/siswa");
    revalidatePath("/admin/announcements");
    revalidatePath("/guru/announcements");
    return { success: true, message: "Pengumuman berhasil dihapus." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menghapus pengumuman.";
    return { error: errorMsg };
  }
}

export async function createAnnouncementAction(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "guru")) {
      throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const from = (formData.get("from") as string) || (session.role === "admin" ? "IT" : session.kelas || "Guru");
    const pengumuman = formData.get("pengumuman") as string;

    let filePath: string | null = null;
    const rawFile = formData.get("file_upload") || formData.get("file");

    if (rawFile && typeof rawFile === "object" && "size" in rawFile && (rawFile as Blob).size > 0) {
      const uploadRes = await saveUploadedFile(rawFile as Blob, { category: "attachment" });
      if (!uploadRes.success) {
        return { error: uploadRes.error };
      }
      filePath = uploadRes.filePath || null;
    } else if (typeof rawFile === "string" && rawFile.trim().length > 0) {
      filePath = rawFile.trim();
    }

    if (!title || !pengumuman) {
      return { error: "Judul dan konten pengumuman wajib diisi." };
    }

    await AnnouncementService.createAnnouncement({
      title,
      from,
      pengumuman,
      file: filePath,
    });

    revalidatePath("/admin");
    revalidatePath("/guru");
    revalidatePath("/siswa");
    revalidatePath("/admin/announcements");
    revalidatePath("/guru/announcements");
    return { success: true, message: "Pengumuman berhasil dipublikasikan." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal mempublikasikan pengumuman.";
    return { error: errorMsg };
  }
}

export async function updateAnnouncementAction(id: string, formData: FormData) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "guru")) {
      throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const from = formData.get("from") as string;
    const pengumuman = formData.get("pengumuman") as string;

    const dataToUpdate: Record<string, unknown> = {};
    if (title) dataToUpdate.title = title;
    if (from) dataToUpdate.from = from;
    if (pengumuman) dataToUpdate.pengumuman = pengumuman;

    const rawFile = formData.get("file_upload") || formData.get("file");
    if (rawFile && typeof rawFile === "object" && "size" in rawFile && (rawFile as Blob).size > 0) {
      const uploadRes = await saveUploadedFile(rawFile as Blob, { category: "attachment" });
      if (!uploadRes.success) {
        return { error: uploadRes.error };
      }
      dataToUpdate.file = uploadRes.filePath;
    } else if (typeof rawFile === "string" && rawFile.trim().length > 0) {
      dataToUpdate.file = rawFile.trim();
    }

    await AnnouncementService.updateAnnouncement({
      id,
      ...dataToUpdate,
    });

    revalidatePath("/admin");
    revalidatePath("/guru");
    revalidatePath("/siswa");
    revalidatePath("/admin/announcements");
    revalidatePath("/guru/announcements");
    return { success: true, message: "Pengumuman berhasil diperbarui." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui pengumuman.";
    return { error: errorMsg };
  }
}

export async function createEventAction(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "guru")) {
      throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const kelas = (formData.get("kelas") as string) || "Semua Kelas";
    const startStr = formData.get("start") as string;
    const endStr = (formData.get("end") as string) || null;
    const deskripsi = (formData.get("deskripsi") as string) || null;
    const backgroundColor = (formData.get("backgroundColor") as string) || "#0284c7";

    if (!title || !startStr) {
      return { error: "Judul dan tanggal mulai wajib diisi." };
    }

    await prisma.event.create({
      data: {
        title,
        kelas,
        from: session.role === "admin" ? "admin" : session.name,
        start: new Date(startStr),
        end: endStr ? new Date(endStr) : null,
        deskripsi,
        backgroundColor,
      },
    });

    revalidatePath("/admin/calendar");
    revalidatePath("/guru/calendar");
    revalidatePath("/siswa/calendar");
    return { success: true, message: "Event berhasil ditambahkan." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menambahkan event.";
    return { error: errorMsg };
  }
}

export async function deleteEventAction(id: string) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "guru")) {
      throw new Error("Unauthorized");
    }

    await prisma.event.delete({
      where: { id: BigInt(id) },
    });

    revalidatePath("/admin/calendar");
    revalidatePath("/guru/calendar");
    revalidatePath("/siswa/calendar");
    return { success: true, message: "Event berhasil dihapus." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menghapus event.";
    return { error: errorMsg };
  }
}

export async function createAchievementAction(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "guru")) {
      throw new Error("Unauthorized");
    }

    const id_user = (formData.get("id_user") as string) || "0";
    const nama = formData.get("nama") as string;
    const kelas = (formData.get("kelas") as string) || "";
    const prestasi = formData.get("prestasi") as string;

    if (!nama || !prestasi) {
      return { error: "Nama dan deskripsi prestasi wajib diisi." };
    }

    let fotoanak = "/images/trophy.png";
    const rawFile = formData.get("foto_upload") || formData.get("fotoanak");
    if (rawFile && typeof rawFile === "object" && "size" in rawFile && (rawFile as Blob).size > 0) {
      const uploadRes = await saveUploadedFile(rawFile as Blob, { category: "achievement" });
      if (!uploadRes.success) {
        return { error: uploadRes.error };
      }
      fotoanak = uploadRes.filePath || "/images/trophy.png";
    } else if (typeof rawFile === "string" && rawFile.trim().length > 0) {
      fotoanak = rawFile.trim();
    }

    await prisma.prestasi.create({
      data: {
        id_user,
        nama,
        kelas,
        fotoanak,
        prestasi,
      },
    });

    revalidatePath("/guru/achievements");
    revalidatePath("/admin/students");
    revalidatePath("/guru");
    revalidatePath("/siswa");
    return { success: true, message: "Prestasi berhasil ditambahkan." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menambahkan prestasi.";
    return { error: errorMsg };
  }
}

export async function deleteAchievementAction(id: string) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "guru")) {
      throw new Error("Unauthorized");
    }

    await prisma.prestasi.delete({
      where: { id: BigInt(id) },
    });

    revalidatePath("/guru/achievements");
    revalidatePath("/admin/students");
    return { success: true, message: "Prestasi berhasil dihapus." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menghapus prestasi.";
    return { error: errorMsg };
  }
}
