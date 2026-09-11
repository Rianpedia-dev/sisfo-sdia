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

  // Ekstensi dari file jika ada
  let originalExt = "";
  if ("name" in file && typeof file.name === "string" && file.name.includes(".")) {
    originalExt = path.extname(file.name).toLowerCase();
  }

  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".avif",
    ".gif",
    ".bmp",
    ".svg",
    ".heic",
    ".heif",
    ".ico",
  ];

  // Tentukan batas ukuran dan direktori tujuan
  let maxBytes = 5 * 1024 * 1024; // Default 5MB
  let subDir = "images";

  if (category === "avatar") {
    maxBytes = 5 * 1024 * 1024; // 5MB
    subDir = "images";
  } else if (category === "attachment") {
    maxBytes = 5 * 1024 * 1024; // 5MB
    subDir = "files";
  } else if (category === "achievement" || category === "best_student") {
    maxBytes = 5 * 1024 * 1024; // 5MB
    subDir = "images";
  }

  // Validasi ukuran
  if (file.size > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    return {
      success: false,
      error: `Ukuran file melebihi batas maksimum ${maxMb}MB.`,
    };
  }

  // Validasi tipe MIME / Ekstensi
  const mimeType = file.type.toLowerCase();
  const isImageMime = mimeType.startsWith("image/");
  const isImageExt = imageExtensions.includes(originalExt);

  if (category === "attachment") {
    const isPdf = mimeType === "application/pdf" || originalExt === ".pdf";
    if (!isPdf && !isImageMime && !isImageExt) {
      return {
        success: false,
        error: "Format file tidak diizinkan. Harap upload dokumen PDF atau file gambar (JPG, PNG, WebP, AVIF, dll).",
      };
    }
  } else {
    // Kategori gambar (avatar, achievement, best_student)
    if (!isImageMime && !isImageExt) {
      return {
        success: false,
        error: "Format file tidak diizinkan. Harap upload file gambar (PNG, JPG, WebP, AVIF, dsb).",
      };
    }
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ambil ekstensi dari nama file asli jika ada, atau tebak dari MIME
    let ext = ".jpg";
    if (originalExt) {
      ext = originalExt;
    } else if (mimeType === "application/pdf") {
      ext = ".pdf";
    } else if (mimeType === "image/png") {
      ext = ".png";
    } else if (mimeType === "image/webp") {
      ext = ".webp";
    } else if (mimeType === "image/avif") {
      ext = ".avif";
    } else if (mimeType === "image/gif") {
      ext = ".gif";
    } else if (mimeType === "image/svg+xml") {
      ext = ".svg";
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
