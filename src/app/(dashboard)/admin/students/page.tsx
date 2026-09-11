import prisma from "@/lib/prisma";
import { StudentTable } from "./student-table";
import { GraduationCap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  let formattedStudents: any[] = [];
  let classList: string[] = [];

  try {
    const [students, classes] = await Promise.all([
      prisma.user.findMany({
        where: {
          status: { in: ["0", "1"] },
        },
        orderBy: { name: "asc" },
      }),
      prisma.kelas.findMany({
        orderBy: { nama_kelas: "asc" },
      }),
    ]);

    formattedStudents = students.map((s) => ({
      id: s.id.toString(),
      name: s.name,
      nis: s.nis,
      nip: s.nip,
      email: s.email,
      appleid: s.appleid,
      gender: s.gender,
      kelas: s.kelas,
      status: s.status,
      point: s.point,
      notes: s.notes,
    }));

    classList = classes.map((c) => c.nama_kelas);
  } catch (e) {
    console.error("Database query error in Admin Students page:", e);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold tracking-tight">Kelola Akun Siswa</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Kelola data pendaftaran siswa, verifikasi akun baru, dan import massal melalui Excel.
        </p>
      </div>

      <StudentTable initialStudents={formattedStudents} classList={classList} />
    </div>
  );
}
