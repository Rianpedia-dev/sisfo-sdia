import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/serializer";

export interface PrayerChecklistInput {
  subuh?: boolean;
  dhuha?: boolean;
  dzuhur?: boolean;
  ashar?: boolean;
  maghrib?: boolean;
  isya?: boolean;
}

export class PrayerService {
  /**
   * Menyimpan / memperbarui checklist sholat harian siswa
   */
  static async saveChecklist(
    studentId: number,
    checklist: PrayerChecklistInput,
    dateStr?: string
  ) {
    const today = dateStr || new Date().toISOString().split("T")[0];

    const data = {
      subuh: checklist.subuh ? "1" : "0",
      dhuha: checklist.dhuha ? "1" : "0",
      dzuhur: checklist.dzuhur ? "1" : "0",
      ashar: checklist.ashar ? "1" : "0",
      maghrib: checklist.maghrib ? "1" : "0",
      isya: checklist.isya ? "1" : "0",
    };

    const record = await prisma.prayer.upsert({
      where: {
        id_date: {
          id: studentId,
          date: today,
        },
      },
      update: data,
      create: {
        id: studentId,
        date: today,
        ...data,
        verified_guru: "unverified",
      },
    });

    return serializeBigInt(record);
  }

  /**
   * Memverifikasi checklist sholat siswa oleh Ustadz/Ustadzah
   */
  static async verifyByTeacher(studentId: number, dateStr: string) {
    const record = await prisma.prayer.upsert({
      where: {
        id_date: {
          id: studentId,
          date: dateStr,
        },
      },
      update: {
        verified_guru: "verified",
      },
      create: {
        id: studentId,
        date: dateStr,
        verified_guru: "verified",
      },
    });

    return serializeBigInt(record);
  }

  /**
   * Mengambil riwayat pengisian sholat siswa
   */
  static async getHistory(studentId: number, limit = 30) {
    const records = await prisma.prayer.findMany({
      where: { id: studentId },
      orderBy: { date: "desc" },
      take: limit,
    });

    return serializeBigInt(records);
  }
}
