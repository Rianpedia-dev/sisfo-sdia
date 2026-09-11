import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { MyClassTable } from "./my-class-table";
import { School, Calendar, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAcademicYear } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GuruMyClassPage() {
  const session = await getSession();
  if (!session || session.role !== "guru") {
    redirect("/login");
  }

  const guruClass = session.kelas || "";
  const academic = getAcademicYear();
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  let formattedStudents: any[] = [];
  let formattedAvailable: any[] = [];

  try {
    const studentsInClass = guruClass
      ? await prisma.user.findMany({
          where: { kelas: guruClass, status: "1" },
          orderBy: { name: "asc" },
        })
      : [];

    const studentIds = studentsInClass.map((s) => Number(s.id));
    const prayersToday = studentIds.length > 0
      ? await prisma.prayer.findMany({
          where: {
            id: { in: studentIds },
            date: todayStr,
          },
        })
      : [];

    const prayerMap = new Map();
    prayersToday.forEach((p) => {
      prayerMap.set(p.id.toString(), p);
    });

    formattedStudents = studentsInClass.map((s) => ({
      id: s.id.toString(),
      name: s.name,
      nis: s.nis,
      email: s.email,
      gender: s.gender,
      kelas: s.kelas,
      status: s.status,
      point: s.point,
      address: s.address,
      skills: s.skills,
      notes: s.notes,
      prayerToday: prayerMap.get(s.id.toString()) || null,
    }));

    const availableStudents = await prisma.user.findMany({
      where: {
        status: "1",
        OR: [{ kelas: null }, { kelas: "" }, { kelas: { not: guruClass } }],
      },
      orderBy: { name: "asc" },
      take: 20,
    });

    formattedAvailable = availableStudents.map((s) => ({
      id: s.id.toString(),
      name: s.name,
      nis: s.nis,
      kelas: s.kelas,
    }));
  } catch (e) {
    console.error("Database query error in guru my-class:", e);
  }

  return (
    <div className="space-y-6">
      {/* Header with Academic Year & Semester per PRD Section 18 */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <School className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-bold tracking-tight">Kelas Saya: {guruClass || "(Belum ada kelas)"}</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola murid, pantau checklist sholat harian, dan berikan reward poin kedisiplinan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-emerald-600/30 bg-emerald-50 text-emerald-800 text-xs py-1 px-2.5 dark:bg-emerald-950 dark:text-emerald-300">
            Tahun Pelajaran {academic.tahunPelajaran}
          </Badge>
          <Badge className="bg-emerald-600 text-xs py-1 px-2.5">
            {academic.semester}
          </Badge>
        </div>
      </div>

      <MyClassTable
        students={formattedStudents}
        availableStudents={formattedAvailable}
        guruClass={guruClass}
      />
    </div>
  );
}
