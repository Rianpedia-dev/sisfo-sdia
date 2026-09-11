import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ArrowLeft, FileText } from "lucide-react";
import { RecapClient } from "./recap-client";
import { getAcademicYear } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GuruAttendanceRecapPage() {
  const session = await getSession();
  if (!session || session.role !== "guru") {
    redirect("/login");
  }

  const guruClass = session.kelas || "";
  const academic = getAcademicYear();

  let formattedStudents: any[] = [];
  let formattedAbsens: any[] = [];

  try {
    const [students, absens] = await Promise.all([
      guruClass
        ? prisma.user.findMany({
            where: { kelas: guruClass, status: "1" },
            orderBy: { name: "asc" },
          })
        : [],
      guruClass
        ? prisma.absen.findMany({
            where: { kelas: guruClass },
          })
        : [],
    ]);

    formattedStudents = students.map((s) => ({
      id: s.id.toString(),
      name: s.name,
      nis: s.nis,
      gender: s.gender,
      email: s.email,
      status: s.status,
    }));

    formattedAbsens = absens.map((a) => ({
      user_id: a.user_id.toString(),
      date: a.date || "",
      keterangan: a.keterangan || "Hadir",
    }));
  } catch (e) {
    console.error("Database query error in attendance recap:", e);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/guru/attendance"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Presensi
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rekapitulasi Presensi & Export PDF</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Generate dokumen resmi rekap kehadiran bulanan kelas {guruClass} format PDF (Landscape A4).
        </p>
      </div>

      <RecapClient
        guruClass={guruClass}
        tahunPelajaran={academic.tahunPelajaran}
        semester={academic.semester}
        students={formattedStudents}
        allAbsen={formattedAbsens}
      />
    </div>
  );
}
