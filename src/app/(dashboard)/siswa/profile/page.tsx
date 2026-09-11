import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { User, Mail, School, Trophy, Award, Save, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateStudentProfileAction } from "@/actions/siswa";
import { formatDateIndo } from "@/lib/utils";

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
      status: session.status || "1",
      point: "0",
      address: "",
      skills: "",
      notes: "",
    };
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Siswa</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Informasi biodata, keterampilan, catatan kepribadian, dan koleksi prestasi Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card & Edit Form (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-emerald-500/20 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 text-2xl font-bold dark:bg-emerald-950 dark:text-emerald-300 overflow-hidden border border-emerald-300">
                {student.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={student.image} alt={student.name} className="h-full w-full object-cover" />
                ) : (
                  student.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{student.name}</CardTitle>
                  <Badge className="bg-emerald-600">Siswa Aktif</Badge>
                </div>
                <CardDescription className="flex items-center gap-2 mt-1 font-mono text-xs">
                  <span>NIS: {student.nis || "-"}</span>
                  <span>• Kelas: {student.kelas || "-"}</span>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  await updateStudentProfileAction(formData);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Email Akun</Label>
                    <Input value={student.email} disabled className="bg-muted text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <Label>Jenis Kelamin</Label>
                    <Input value={student.gender === "L" ? "Laki-laki (L)" : "Perempuan (P)"} disabled className="bg-muted text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address">Alamat Tempat Tinggal</Label>
                  <Textarea
                    id="address"
                    name="address"
                    defaultValue={student.address || ""}
                    placeholder="Alamat domisili lengkap..."
                    rows={2}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="skills">Bakat & Keterampilan Khusus</Label>
                  <Input
                    id="skills"
                    name="skills"
                    defaultValue={student.skills || ""}
                    placeholder="Contoh: Tahfidz Juz 30, Panahan, Robotik, Desain Grafis"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes">Catatan Tambahan Diri</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    defaultValue={student.notes || ""}
                    placeholder="Catatan motivasi atau cita-cita..."
                    rows={2}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="image">Upload Foto Profil Baru (Maks 1MB - JPG/PNG)</Label>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="cursor-pointer file:text-emerald-700 file:font-semibold"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Save className="h-4 w-4" /> Simpan Profil
                  </Button>
                </div>
              </form>
            </CardContent>
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

          <Card className="border-emerald-500/20 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-base">Prestasi Saya</CardTitle>
              </div>
              <CardDescription>Pencapaian yang telah diverifikasi sekolah</CardDescription>
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
