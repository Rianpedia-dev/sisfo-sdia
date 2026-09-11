"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import * as XLSX from "xlsx";
import { saveUploadedFile } from "@/lib/upload";

async function checkAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized: Hanya Administrator yang berhak melakukan tindakan ini.");
  }
  return session;
}

export async function createUserAction(formData: FormData) {
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

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email sudah terdaftar." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      password1: password,
      status: role,
      kelas: kelas || null,
      appleid,
      passwordappleid,
      gender,
      nis,
      nip,
      guru_bidang,
      point: "0",
    },
  });

  revalidatePath("/admin/students");
  revalidatePath("/admin/teachers");
  return { success: true, message: "Pengguna berhasil ditambahkan." };
}

export async function updateUserAction(id: string, formData: FormData) {
  await checkAdmin();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const kelas = formData.get("kelas") as string;
  const appleid = formData.get("appleid") as string;
  const passwordappleid = formData.get("passwordappleid") as string;
  const ctt_iPad = formData.get("ctt_iPad") as string;
  const password = formData.get("password") as string;

  const dataToUpdate: Record<string, unknown> = {
    name,
    email,
    kelas: kelas || null,
    appleid: appleid || null,
    passwordappleid: passwordappleid || null,
    ctt_iPad: ctt_iPad || null,
  };

  if (password && password.trim().length > 0) {
    dataToUpdate.password = await bcrypt.hash(password, 10);
    dataToUpdate.password1 = password;
  }

  await prisma.user.update({
    where: { id: BigInt(id) },
    data: dataToUpdate,
  });

  revalidatePath(`/admin/students/${id}`);
  revalidatePath("/admin/students");
  return { success: true, message: "Data pengguna berhasil diperbarui." };
}

export async function deleteUserAction(id: string) {
  await checkAdmin();

  await prisma.user.delete({
    where: { id: BigInt(id) },
  });

  revalidatePath("/admin/students");
  revalidatePath("/admin/teachers");
  return { success: true, message: "Pengguna berhasil dihapus." };
}

export async function verifyUserAction(id: string, status: string) {
  await checkAdmin();

  await prisma.user.update({
    where: { id: BigInt(id) },
    data: { status },
  });

  revalidatePath("/admin/teachers");
  revalidatePath("/admin/students");
  return { success: true, message: "Status pengguna berhasil diperbarui." };
}

export async function importStudentsAction(fileBufferBase64: string) {
  await checkAdmin();

  try {
    const buffer = Buffer.from(fileBufferBase64, "base64");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    // Format: Email, Password, Password Plain, Nama, Apple ID, Password Apple ID, Status, Gender
    const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

    // Skip header row
    const dataRows = rows.slice(1);
    let importedCount = 0;

    for (const row of dataRows) {
      if (!row || row.length < 4) continue;
      const email = String(row[0] || "").trim();
      const passwordPlain = String(row[2] || row[1] || "123456").trim();
      const name = String(row[3] || "").trim();
      const appleid = row[4] ? String(row[4]).trim() : null;
      const passwordappleid = row[5] ? String(row[5]).trim() : null;
      const status = row[6] ? String(row[6]).trim() : "1";
      const gender = row[7] ? String(row[7]).trim() : "L";

      if (!email || !name) continue;

      const hashedPassword = await bcrypt.hash(passwordPlain, 10);

      await prisma.user.upsert({
        where: { email },
        update: {
          name,
          appleid,
          passwordappleid,
          gender,
          status,
        },
        create: {
          email,
          name,
          password: hashedPassword,
          password1: passwordPlain,
          appleid,
          passwordappleid,
          status,
          gender,
        },
      });
      importedCount++;
    }

    revalidatePath("/admin/students");
    return { success: true, count: importedCount, message: `Berhasil mengimpor ${importedCount} siswa.` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal mengimpor file Excel";
    return { error: errorMsg };
  }
}

export const importUsersAction = importStudentsAction;

export async function createClassAction(formData: FormData) {
  await checkAdmin();

  const nama_kelas = formData.get("nama_kelas") as string;
  const wali_kelas = formData.get("wali_kelas") as string;
  const jumlah_siswa = formData.get("jumlah_siswa") as string;
  const code_restrict = formData.get("code_restrict") as string;

  if (!nama_kelas) {
    return { error: "Nama kelas wajib diisi." };
  }

  await prisma.kelas.create({
    data: {
      nama_kelas,
      wali_kelas: wali_kelas || null,
      jumlah_siswa: jumlah_siswa || null,
      code_restrict: code_restrict || null,
    },
  });

  if (code_restrict) {
    await prisma.restrict.create({
      data: {
        nama_kelas,
        code_restrict,
      },
    });
  }

  revalidatePath("/admin/classes");
  return { success: true, message: "Kelas berhasil ditambahkan." };
}

export async function deleteClassAction(id: string) {
  await checkAdmin();

  await prisma.kelas.delete({
    where: { id: BigInt(id) },
  });

  revalidatePath("/admin/classes");
  return { success: true, message: "Kelas berhasil dihapus." };
}

export async function updateRestrictAction(id: string, code_restrict: string) {
  await checkAdmin();

  await prisma.restrict.update({
    where: { id: BigInt(id) },
    data: { code_restrict },
  });

  revalidatePath("/admin");
  return { success: true, message: "Kode restrict berhasil diperbarui." };
}

export async function deleteAnnouncementAction(id: string) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "guru")) {
    throw new Error("Unauthorized");
  }

  await prisma.pengumuman.delete({
    where: { id: BigInt(id) },
  });

  revalidatePath("/admin");
  revalidatePath("/guru");
  revalidatePath("/siswa");
  return { success: true, message: "Pengumuman berhasil dihapus." };
}

export async function createAnnouncementAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "guru")) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const from = (formData.get("from") as string) || (session.role === "admin" ? "IT" : session.kelas || "Guru");
  const pengumuman = formData.get("pengumuman") as string;
  
  // Tangani file upload atau text path (PRD Section 13: attachment max 2MB)
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

  await prisma.pengumuman.create({
    data: {
      title,
      from,
      pengumuman,
      file: filePath,
      like: "0",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/guru");
  revalidatePath("/siswa");
  return { success: true, message: "Pengumuman berhasil dipublikasikan." };
}

export async function updateAnnouncementAction(id: string, formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "guru")) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const from = formData.get("from") as string;
  const pengumuman = formData.get("pengumuman") as string;

  const dataToUpdate: Record<string, unknown> = {
    title,
    from,
    pengumuman,
  };

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

  await prisma.pengumuman.update({
    where: { id: BigInt(id) },
    data: dataToUpdate,
  });

  revalidatePath("/admin");
  revalidatePath("/guru");
  return { success: true, message: "Pengumuman berhasil diperbarui." };
}

export async function createEventAction(formData: FormData) {
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
}

export async function deleteEventAction(id: string) {
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
}

export async function createAchievementAction(formData: FormData) {
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
}

export async function deleteAchievementAction(id: string) {
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
}
