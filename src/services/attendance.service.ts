import prisma from "@/lib/prisma";

export interface AttendanceRecordItem {
  userId: string;
  keterangan: string;
}

export interface StudentAttendanceSummary {
  studentId: string;
  name: string;
  nis: string;
  gender: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  daily: Record<number, string>;
}

export class AttendanceService {
  /**
   * Menyimpan / memperbarui presensi harian per kelas secara batch (transaksional)
   */
  static async recordAttendance(
    date: string,
    kelas: string,
    records: AttendanceRecordItem[]
  ) {
    if (records.length === 0) return true;

    const month = date.split("-")[1] || String(new Date().getMonth() + 1);

    const operations = records.map((record) => {
      const userIdBigInt = BigInt(record.userId);
      return prisma.absen.upsert({
        where: {
          user_id_date: {
            user_id: userIdBigInt,
            date: date,
          },
        },
        update: {
          keterangan: record.keterangan,
          kelas,
          month,
        },
        create: {
          user_id: userIdBigInt,
          kelas,
          keterangan: record.keterangan,
          date,
          month,
        },
      });
    });

    await prisma.$transaction(operations);
    return true;
  }

  /**
   * Menghapus seluruh data presensi untuk tanggal dan kelas tertentu
   */
  static async deleteAttendanceByDate(date: string, kelas: string) {
    const result = await prisma.absen.deleteMany({
      where: {
        date,
        kelas,
      },
    });

    return result.count;
  }

  /**
   * Mengambil rekap presensi bulanan beserta matriks harian per siswa
   */
  static async getAttendanceRecap(
    kelas: string,
    month: number,
    year: number
  ): Promise<{
    kelas: string;
    month: number;
    year: number;
    daysInMonth: number;
    data: StudentAttendanceSummary[];
  }> {
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

    const report: StudentAttendanceSummary[] = students.map((student) => {
      const studentAbsens = attendanceList.filter((a) => a.user_id === student.id);
      let hadir = 0,
        sakit = 0,
        izin = 0,
        alpha = 0;
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
      kelas,
      month,
      year,
      daysInMonth,
      data: report,
    };
  }

  /**
   * Mengambil status kehadiran per tanggal dalam satu bulan untuk kalender interaktif
   */
  static async getMonthlyStatus(kelas: string, monthStr: string) {
    const records = await prisma.absen.findMany({
      where: {
        kelas,
        month: monthStr,
      },
      select: {
        date: true,
        keterangan: true,
      },
    });

    // Map tanggal -> ada absensi
    const dateSet = new Set<string>();
    records.forEach((r) => {
      if (r.date) dateSet.add(r.date);
    });

    return Array.from(dateSet);
  }
}
