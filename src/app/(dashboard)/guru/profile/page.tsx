import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { GuruProfileForm } from "@/components/profile/guru-profile-form";

export const dynamic = "force-dynamic";

export default async function GuruProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "guru") {
    redirect("/login");
  }

  let teacher: any = null;
  let classes: any[] = [];

  try {
    const isNum = /^\d+$/.test(session.id);
    const [dbTeacher, dbClasses] = await Promise.all([
      isNum
        ? prisma.user.findUnique({
            where: { id: BigInt(session.id) },
          })
        : null,
      prisma.kelas.findMany({
        orderBy: { nama_kelas: "asc" },
      }),
    ]);
    teacher = dbTeacher;
    classes = dbClasses;
  } catch (e) {
    console.error("Database query error in guru profile:", e);
  }

  if (!teacher) {
    teacher = {
      id: session.id,
      name: session.name || "Guru",
      email: session.email || "",
      nip: session.nip || "",
      guru_bidang: "",
      kelas: session.kelas || null,
      status: session.status || "2",
      address: "",
      image: session.image || null,
    };
  }

  const formattedTeacher = {
    id: teacher.id ? teacher.id.toString() : session.id,
    name: teacher.name || "",
    email: teacher.email || "",
    nip: teacher.nip || null,
    status: teacher.status || session.status || "2",
    guru_bidang: teacher.guru_bidang || null,
    kelas: teacher.kelas || null,
    address: teacher.address || null,
    gender: teacher.gender || (session as any).gender || null,
    image: teacher.image || null,
  };

  const formattedClasses = classes.map((c) => ({
    id: c.id.toString(),
    nama_kelas: c.nama_kelas,
  }));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Saya</h1>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <GuruProfileForm teacher={formattedTeacher} classes={formattedClasses} />
      </Card>
    </div>
  );
}
