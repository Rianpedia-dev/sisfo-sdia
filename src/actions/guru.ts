"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/upload";

async function checkGuruOrAdmin() {
  const session = await getSession();
  if (!session || (session.role !== "guru" && session.role !== "admin")) {
    throw new Error("Unauthorized: Akses ditolak.");
  }
  return session;
}

export async function enrollStudentAction(studentId: string, kelas: string) {
  await checkGuruOrAdmin();

  await prisma.user.update({
    where: { id: BigInt(studentId) },
    data: { kelas },
  });

  revalidatePath("/guru/my-class");
  return { success: true, message: "Siswa berhasil didaftarkan ke kelas." };
}

export async function removeStudentsAction(studentIds: string[]) {
  await checkGuruOrAdmin();

  for (const id of studentIds) {
    await prisma.user.update({
      where: { id: BigInt(id) },
      data: { kelas: null },
    });
  }

  revalidatePath("/guru/my-class");
  return { success: true, message: `Berhasil mengeluarkan ${studentIds.length} siswa dari kelas.` };
}

export async function createAttendanceAction(
  date: string,
  kelas: string,
  records: { userId: string; keterangan: string }[]
) {
  await checkGuruOrAdmin();

  const month = date.split("-")[1] || String(new Date().getMonth() + 1);

  for (const record of records) {
    const userIdBigInt = BigInt(record.userId);

    // Cek apakah sudah ada absen untuk user ini pada tanggal ini
    const existing = await prisma.absen.findFirst({
      where: {
        user_id: userIdBigInt,
        date: date,
      },
    });

    if (existing) {
      await prisma.absen.update({
        where: { id: existing.id },
        data: {
          keterangan: record.keterangan,
          kelas,
          month,
        },
      });
    } else {
      await prisma.absen.create({
        data: {
          user_id: userIdBigInt,
          kelas,
          keterangan: record.keterangan,
          date,
          month,
        },
      });
    }
  }

  revalidatePath("/guru/attendance");
  revalidatePath(`/guru/attendance/${date}`);
  revalidatePath("/guru");
  return { success: true, message: "Data absensi berhasil disimpan." };
}

export async function deleteAttendanceAction(date: string, kelas: string) {
  await checkGuruOrAdmin();

  await prisma.absen.deleteMany({
    where: {
      date,
      kelas,
    },
  });

  revalidatePath("/guru/attendance");
  return { success: true, message: "Data absensi tanggal tersebut berhasil dihapus." };
}

export async function addPointAction(studentId: string, pointToAdd: number) {
  await checkGuruOrAdmin();

  const student = await prisma.user.findUnique({
    where: { id: BigInt(studentId) },
  });

  const currentPoint = parseInt(student?.point || "0", 10) || 0;
  const newPoint = Math.max(0, currentPoint + pointToAdd);

  await prisma.user.update({
    where: { id: BigInt(studentId) },
    data: { point: String(newPoint) },
  });

  revalidatePath("/guru/my-class");
  revalidatePath("/guru/best-point");
  revalidatePath("/siswa/best-point");
  return { success: true, newPoint, message: `Poin berhasil ditambah ${pointToAdd}.` };
}

export async function subtractPointAction(studentId: string, pointToSub: number) {
  await checkGuruOrAdmin();

  const student = await prisma.user.findUnique({
    where: { id: BigInt(studentId) },
  });

  const currentPoint = parseInt(student?.point || "0", 10) || 0;
  const newPoint = Math.max(0, currentPoint - pointToSub);

  await prisma.user.update({
    where: { id: BigInt(studentId) },
    data: { point: String(newPoint) },
  });

  revalidatePath("/guru/my-class");
  revalidatePath("/guru/best-point");
  revalidatePath("/siswa/best-point");
  return { success: true, newPoint, message: `Poin berhasil dikurangi ${pointToSub}.` };
}

export async function createLatenessAction(formData: FormData) {
  await checkGuruOrAdmin();

  const user_id = formData.get("user_id") as string;
  const nama = formData.get("nama") as string;
  const kelas = formData.get("kelas") as string;
  const waktu = formData.get("waktu") as string;
  const keterangan = formData.get("keterangan") as string;

  if (!user_id || !nama || !waktu) {
    return { error: "Semua kolom keterlambatan wajib diisi." };
  }

  await prisma.keterlambatan.create({
    data: {
      user_id: BigInt(user_id),
      nama,
      kelas,
      waktu,
      keterangan,
    },
  });

  revalidatePath(`/guru/my-class/${user_id}`);
  revalidatePath("/siswa/lateness");
  return { success: true, message: "Keterlambatan berhasil dicatat." };
}

export async function deleteLatenessAction(id: string, studentId: string) {
  await checkGuruOrAdmin();

  await prisma.keterlambatan.delete({
    where: { id: BigInt(id) },
  });

  revalidatePath(`/guru/my-class/${studentId}`);
  revalidatePath("/siswa/lateness");
  return { success: true, message: "Catatan keterlambatan berhasil dihapus." };
}

export async function createViolationAction(formData: FormData) {
  await checkGuruOrAdmin();

  const user_id = formData.get("user_id") as string;
  const nama = formData.get("nama") as string;
  const kelas = formData.get("kelas") as string;
  const kategori = formData.get("kategori") as string;
  const keterangan = formData.get("keterangan") as string;

  if (!user_id || !kategori || !keterangan) {
    return { error: "Kategori dan keterangan pelanggaran wajib diisi." };
  }

  await prisma.pelanggaran.create({
    data: {
      user_id,
      nama,
      kelas,
      kategori,
      keterangan,
    },
  });

  revalidatePath(`/guru/my-class/${user_id}`);
  revalidatePath("/siswa/violations");
  return { success: true, message: "Pelanggaran berhasil dicatat." };
}

export async function deleteViolationAction(id: string, studentId: string) {
  await checkGuruOrAdmin();

  await prisma.pelanggaran.delete({
    where: { id: BigInt(id) },
  });

  revalidatePath(`/guru/my-class/${studentId}`);
  revalidatePath("/siswa/violations");
  return { success: true, message: "Pelanggaran berhasil dihapus." };
}

export async function updateNotesAction(studentId: string, notes: string) {
  await checkGuruOrAdmin();

  await prisma.user.update({
    where: { id: BigInt(studentId) },
    data: { notes },
  });

  revalidatePath(`/guru/my-class/${studentId}`);
  return { success: true, message: "Catatan siswa berhasil diperbarui." };
}

export async function verifyPrayerAction(studentId: string, date: string) {
  await checkGuruOrAdmin();

  const numStudentId = parseInt(studentId, 10) || 0;

  await prisma.prayer.upsert({
    where: {
      id_date: {
        id: numStudentId,
        date: date,
      },
    },
    update: {
      verified_guru: "verified",
    },
    create: {
      id: numStudentId,
      date: date,
      verified_guru: "verified",
    },
  });

  revalidatePath("/guru/my-class");
  revalidatePath(`/guru/my-class/${studentId}`);
  revalidatePath("/siswa/prayers");
  revalidatePath("/siswa/prayers/history");
  return { success: true, message: "Checklist sholat siswa berhasil diverifikasi." };
}

export async function createBestStudentAction(formData: FormData) {
  await checkGuruOrAdmin();

  const name = formData.get("name") as string;
  const kelas = formData.get("kelas") as string;
  const kategori = formData.get("kategori") as string;

  if (!name || !kategori) {
    return { error: "Nama dan kategori penghargaan wajib diisi." };
  }

  // Tangani file upload atau text path (PRD Section 13: max 2MB)
  let foto: string | null = null;
  const rawFile = formData.get("foto_upload") || formData.get("foto");

  if (rawFile && typeof rawFile === "object" && "size" in rawFile && (rawFile as Blob).size > 0) {
    const uploadRes = await saveUploadedFile(rawFile as Blob, { category: "best_student" });
    if (!uploadRes.success) {
      return { error: uploadRes.error };
    }
    foto = uploadRes.filePath || null;
  } else if (typeof rawFile === "string" && rawFile.trim().length > 0) {
    foto = rawFile.trim();
  }

  await prisma.bestStudent.create({
    data: {
      name,
      kelas,
      kategori,
      foto,
    },
  });

  revalidatePath("/guru/best-student");
  revalidatePath("/siswa/best-student");
  revalidatePath("/guru");
  revalidatePath("/siswa");
  return { success: true, message: "Best student berhasil ditambahkan." };
}

export async function updateBestStudentAction(id: string, formData: FormData) {
  await checkGuruOrAdmin();

  const name = formData.get("name") as string;
  const kategori = formData.get("kategori") as string;

  const dataToUpdate: Record<string, unknown> = {};
  if (name) dataToUpdate.name = name;
  if (kategori) dataToUpdate.kategori = kategori;

  const rawFile = formData.get("foto_upload") || formData.get("foto");
  if (rawFile && typeof rawFile === "object" && "size" in rawFile && (rawFile as Blob).size > 0) {
    const uploadRes = await saveUploadedFile(rawFile as Blob, { category: "best_student" });
    if (!uploadRes.success) {
      return { error: uploadRes.error };
    }
    dataToUpdate.foto = uploadRes.filePath;
  } else if (typeof rawFile === "string" && rawFile.trim().length > 0) {
    dataToUpdate.foto = rawFile.trim();
  }

  await prisma.bestStudent.update({
    where: { id: BigInt(id) },
    data: dataToUpdate,
  });

  revalidatePath("/guru/best-student");
  revalidatePath("/siswa/best-student");
  revalidatePath("/guru");
  revalidatePath("/siswa");
  return { success: true, message: "Best student berhasil diperbarui." };
}

export async function deleteBestStudentAction(id: string) {
  await checkGuruOrAdmin();

  await prisma.bestStudent.delete({
    where: { id: BigInt(id) },
  });

  revalidatePath("/guru/best-student");
  revalidatePath("/siswa/best-student");
  return { success: true, message: "Best student berhasil dihapus." };
}

export async function createAchievementAction(formData: FormData) {
  await checkGuruOrAdmin();

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
  revalidatePath("/guru");
  revalidatePath("/siswa");
  return { success: true, message: "Prestasi berhasil ditambahkan." };
}

export async function deleteAchievementAction(id: string) {
  await checkGuruOrAdmin();

  await prisma.prestasi.delete({
    where: { id: BigInt(id) },
  });

  revalidatePath("/guru/achievements");
  return { success: true, message: "Prestasi berhasil dihapus." };
}

export async function updateProfileAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const kelas = formData.get("kelas") as string;
  const guru_bidang = formData.get("guru_bidang") as string;
  const notes = formData.get("notes") as string;
  const skills = formData.get("skills") as string;

  const dataToUpdate: Record<string, unknown> = {};
  if (name) dataToUpdate.name = name;
  if (address !== undefined) dataToUpdate.address = address || null;
  if (kelas !== undefined) dataToUpdate.kelas = kelas || null;
  if (guru_bidang !== undefined) dataToUpdate.guru_bidang = guru_bidang || null;
  if (notes !== undefined) dataToUpdate.notes = notes || null;
  if (skills !== undefined) dataToUpdate.skills = skills || null;

  const rawFile = formData.get("image") || formData.get("photo");
  if (rawFile && typeof rawFile === "object" && "size" in rawFile && (rawFile as Blob).size > 0) {
    const uploadRes = await saveUploadedFile(rawFile as Blob, { category: "avatar" });
    if (uploadRes.success && uploadRes.filePath) {
      dataToUpdate.image = uploadRes.filePath;
    }
  }

  await prisma.user.update({
    where: { id: BigInt(session.id) },
    data: dataToUpdate,
  });

  revalidatePath("/guru/profile");
  revalidatePath("/siswa/profile");
  revalidatePath("/guru");
  revalidatePath("/siswa");
  return { success: true, message: "Profil berhasil diperbarui." };
}

export const updateGuruProfile = updateProfileAction;

export async function uploadPhotoAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const rawFile = formData.get("image") || formData.get("photo") || formData.get("file");
  if (!rawFile || typeof rawFile !== "object" || !("size" in rawFile) || (rawFile as Blob).size === 0) {
    return { error: "Silakan pilih file foto terlebih dahulu." };
  }

  const uploadRes = await saveUploadedFile(rawFile as Blob, { category: "avatar" });
  if (!uploadRes.success) {
    return { error: uploadRes.error };
  }

  await prisma.user.update({
    where: { id: BigInt(session.id) },
    data: { image: uploadRes.filePath },
  });

  revalidatePath("/guru/profile");
  revalidatePath("/siswa/profile");
  return { success: true, filePath: uploadRes.filePath, message: "Foto profil berhasil diperbarui." };
}

export async function downloadAttendancePdfAction(kelas: string, month: number, year: number) {
  await checkGuruOrAdmin();

  const students = await prisma.user.findMany({
    where: { kelas, status: "1" },
    orderBy: { name: "asc" },
  });

  const attendanceList = await prisma.absen.findMany({
    where: {
      kelas,
      month: String(month),
    },
  });

  const daysInMonth = new Date(year, month, 0).getDate();

  const report = students.map((student) => {
    const studentAbsens = attendanceList.filter((a) => a.user_id === student.id);
    let hadir = 0, sakit = 0, izin = 0, alpha = 0;
    const dailyMap: Record<number, string> = {};

    studentAbsens.forEach((a) => {
      const parts = (a.date || "").split("-");
      if (parts.length === 3) {
        const day = parseInt(parts[2], 10);
        dailyMap[day] = a.keterangan || "";
      }
      if (a.keterangan === "Hadir") hadir++;
      else if (a.keterangan === "Sakit") sakit++;
      else if (a.keterangan === "Izin") izin++;
      else if (a.keterangan === "Alpha") alpha++;
    });

    return {
      studentId: student.id.toString(),
      name: student.name,
      nis: student.nis || "-",
      gender: student.gender || "L",
      hadir,
      sakit,
      izin,
      alpha,
      daily: dailyMap,
    };
  });

  return {
    success: true,
    kelas,
    month,
    year,
    daysInMonth,
    data: report,
  };
}
