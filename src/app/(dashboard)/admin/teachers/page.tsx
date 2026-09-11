import prisma from "@/lib/prisma";
import { TeacherTable } from "./teacher-table";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminTeachersPage() {
  let formattedTeachers: any[] = [];

  try {
    const teachers = await prisma.user.findMany({
      where: {
        status: { in: ["0", "2", "4"] },
      },
      orderBy: { name: "asc" },
    });

    formattedTeachers = teachers.map((t) => ({
      id: t.id.toString(),
      name: t.name,
      email: t.email,
      nip: t.nip,
      guru_bidang: t.guru_bidang,
      kelas: t.kelas,
      status: t.status,
      gender: t.gender,
    }));
  } catch (e) {
    console.error("Database query error in Admin Teachers page:", e);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold tracking-tight">Kelola Akun Guru</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Kelola data dewan guru, verifikasi pendaftaran akun baru, dan atur penugasan wali kelas.
        </p>
      </div>

      <TeacherTable initialTeachers={formattedTeachers} />
    </div>
  );
}
