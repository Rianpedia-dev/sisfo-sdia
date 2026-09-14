import prisma from "@/lib/prisma";
import { ClassTable } from "./class-table";
import { School } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminClassesPage() {
  let formattedClasses: any[] = [];
  let teachersList: string[] = [];

  try {
    const [classes, teachers, students] = await Promise.all([
      prisma.kelas.findMany({
        orderBy: { nama_kelas: "asc" },
      }),
      prisma.user.findMany({
        where: { status: { in: ["2", "4"] } },
        orderBy: { name: "asc" },
      }),
      prisma.user.findMany({
        where: { status: "1" },
        select: { kelas: true },
      }),
    ]);

    const studentCountMap = new Map<string, number>();
    students.forEach((s) => {
      if (s.kelas) {
        studentCountMap.set(s.kelas, (studentCountMap.get(s.kelas) || 0) + 1);
      }
    });

    formattedClasses = classes.map((c) => ({
      id: c.id.toString(),
      nama_kelas: c.nama_kelas,
      wali_kelas: c.wali_kelas || "-",
      jumlah_siswa: c.jumlah_siswa || String(studentCountMap.get(c.nama_kelas) || 0),
      code_restrict: c.code_restrict || "-",
    }));

    teachersList = teachers.map((t) => t.name);
  } catch (e) {
    console.error("Database query error in Admin Classes page:", e);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Kelola Kelas</h1>
        <p className="text-sm text-muted-foreground">
          Kelola rombongan belajar, penugasan wali kelas, dan kode restrict iPad per kelas.
        </p>
      </div>

      <ClassTable initialClasses={formattedClasses} teachersList={teachersList} />
    </div>
  );
}
