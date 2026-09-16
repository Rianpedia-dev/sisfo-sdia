import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Trophy, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateIndo } from "@/lib/utils";
import { SiswaProfileForm } from "@/components/profile/siswa-profile-form";

export const dynamic = "force-dynamic";

export default async function SiswaProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "siswa") {
    redirect("/login");
  }

  let student: any = null;
  let myAchievements: any[] = [];

  try {
    const isNum = /^\d+$/.test(session.id);
    const [dbStudent, dbAchieve] = await Promise.all([
      isNum
        ? prisma.user.findUnique({
            where: { id: BigInt(session.id) },
          })
        : null,
      prisma.prestasi.findMany({
        where: { id_user: session.id },
        orderBy: { created_at: "desc" },
      }),
    ]);
    student = dbStudent;
    myAchievements = dbAchieve;
  } catch (e) {
    console.error("Database query error in siswa profile:", e);
  }

  if (!student) {
    student = {
      id: session.id,
      name: session.name || "Siswa",
      email: session.email || "",
      nis: session.nis || "-",
      kelas: session.kelas || "-",
      gender: null,
      status: session.status || "1",
      point: "0",
      address: "",
      skills: "",
      notes: "",
      image: session.image || null,
    };
  }

  const formattedStudent = {
    id: student.id ? student.id.toString() : session.id,
    name: student.name || "",
    email: student.email || "",
    nis: student.nis || null,
    kelas: student.kelas || null,
    gender: student.gender || null,
    address: student.address || null,
    skills: student.skills || null,
    notes: student.notes || null,
    image: student.image || null,
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Siswa</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card & Edit Form (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm overflow-hidden">
            <SiswaProfileForm student={formattedStudent} />
          </Card>
        </div>

        {/* Sidebar Info: Point & Prestasi (1 Col) */}
        <div className="space-y-6">
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-background to-background shadow-sm">
            <CardContent className="p-6 text-center">
              <Trophy className="h-10 w-10 text-amber-500 mx-auto mb-2" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Poin Reward</p>
              <div className="font-mono text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {student.point || "0"}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Poin reward kedisiplinan dan ibadah</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-base">Prestasi Saya</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {myAchievements.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4 italic">
                  Belum ada catatan prestasi terdaftar.
                </p>
              ) : (
                myAchievements.map((ach) => (
                  <div key={ach.id.toString()} className="rounded-lg border p-3 text-xs bg-card">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <span>🏆</span>
                      <span>{ach.prestasi}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {ach.kelas} • {formatDateIndo(ach.created_at)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
