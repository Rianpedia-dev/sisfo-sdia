import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export type UploadCategory = "avatar" | "attachment" | "achievement" | "best_student";

interface UploadOptions {
  category: UploadCategory;
}

export interface UploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

/**
 * Validasi dan simpan file yang diupload ke storage publik sesuai PRD Section 13:
 * - Foto Profil (Guru/Siswa): jpg, jpeg, png, max 1MB -> /uploads/images/
 * - Lampiran Pengumuman: pdf, jpg, jpeg, png, max 2MB -> /uploads/files/
 * - Foto Prestasi: jpg, jpeg, png, max 2MB -> /uploads/images/
 * - Foto Best Student: jpg, jpeg, png, max 2MB -> /uploads/images/
 */
export async function saveUploadedFile(
  file: File | Blob | null | undefined,
  options: UploadOptions
): Promise<UploadResult> {
  if (!file || !(file instanceof Blob) || file.size === 0) {
    return { success: false, error: "File tidak ditemukan atau kosong." };
  }

  const { category } = options;

  // Tentukan batas ukuran dan direktori tujuan
  let maxBytes = 2 * 1024 * 1024; // Default 2MB
  let allowedMimeTypes: string[] = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  let subDir = "images";

  if (category === "avatar") {
    maxBytes = 1 * 1024 * 1024; // 1MB per PRD Section 13
    allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    subDir = "images";
  } else if (category === "attachment") {
    maxBytes = 2 * 1024 * 1024; // 2MB per PRD Section 13
    allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];
    subDir = "files";
  } else if (category === "achievement" || category === "best_student") {
    maxBytes = 2 * 1024 * 1024; // 2MB per PRD Section 13
    allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    subDir = "images";
  }

  // Validasi ukuran
  if (file.size > maxBytes) {
    const maxMb = maxBytes / (1024 * 1024);
    return {
      success: false,
      error: `Ukuran file melebihi batas maksimum ${maxMb}MB.`,
    };
  }

  // Validasi tipe MIME
  const mimeType = file.type.toLowerCase();
  if (mimeType && !allowedMimeTypes.includes(mimeType)) {
    return {
      success: false,
      error: `Format file tidak diizinkan. Tipe yang diperbolehkan: ${allowedMimeTypes.join(", ")}.`,
    };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ambil ekstensi dari nama file asli jika ada, atau tebak dari MIME
    let ext = ".jpg";
    if ("name" in file && typeof file.name === "string" && file.name.includes(".")) {
      ext = path.extname(file.name).toLowerCase();
    } else if (mimeType === "application/pdf") {
      ext = ".pdf";
    } else if (mimeType === "image/png") {
      ext = ".png";
    } else if (mimeType === "image/webp") {
      ext = ".webp";
    }

    // Nama file aman dan unik
    const randomHex = crypto.randomBytes(8).toString("hex");
    const timestamp = Date.now();
    const fileName = `${category}-${timestamp}-${randomHex}${ext}`;

    const targetDir = path.join(process.cwd(), "public", "uploads", subDir);
    await mkdir(targetDir, { recursive: true });

    const fullFilePath = path.join(targetDir, fileName);
    await writeFile(fullFilePath, buffer);

    // Kembalikan relative public URL path
    const publicUrl = `/uploads/${subDir}/${fileName}`;
    return { success: true, filePath: publicUrl };
  } catch (error) {
    console.error("Gagal menyimpan file yang diupload:", error);
    return {
      success: false,
      error: "Terjadi kesalahan pada server saat menyimpan file.",
    };
  }
}
