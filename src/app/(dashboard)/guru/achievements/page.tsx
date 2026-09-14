import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Plus, Trash2, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createAchievementAction, deleteAchievementAction } from "@/actions/guru";
import { formatDateIndo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GuruAchievementsPage() {
  const session = await getSession();
  if (!session || session.role !== "guru") {
    redirect("/login");
  }

  const guruClass = session.kelas || "";

  let students: any[] = [];
  let achievements: any[] = [];

  try {
    const [dbStudents, dbPrestasi] = await Promise.all([
      guruClass
        ? prisma.user.findMany({
            where: { kelas: guruClass, status: "1" },
            orderBy: { name: "asc" },
          })
        : [],
      prisma.prestasi.findMany({
        orderBy: { created_at: "desc" },
      }),
    ]);
    students = dbStudents;
    achievements = dbPrestasi;
  } catch (e) {
    console.error("Database query error in achievements:", e);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Prestasi & Kejuaraan Siswa</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Catat pencapaian lomba, kejuaraan tahfidz, sains, olahraga, dan seni siswa SDIA Cairo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Form Tambah Prestasi (4 Cols) */}
        <div className="lg:col-span-4">
          <Card className="border-amber-500/20 shadow-sm sticky top-20">
            <CardHeader>
              <CardTitle className="text-base">Catat Prestasi Baru</CardTitle>
              <CardDescription>
                Prestasi akan ditampilkan di etalase dashboard siswa & guru.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  await createAchievementAction(formData);
                }}
                className="space-y-3"
              >
                <input type="hidden" name="kelas" value={guruClass} />

                <div className="space-y-1">
                  <Label htmlFor="id_user">Pilih Siswa</Label>
                  <select
                    id="id_user"
                    name="id_user"
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                  >
                    <option value="">-- Pilih Siswa Kelas --</option>
                    {students.map((s) => (
                      <option key={s.id.toString()} value={s.id.toString()}>
                        {s.name} ({s.nis || "No NIS"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="nama">Nama Lengkap Siswa</Label>
                  <Input id="nama" name="nama" placeholder="Ketik ulang nama siswa" required />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="prestasi">Deskripsi Prestasi / Juara</Label>
                  <Input
                    id="prestasi"
                    name="prestasi"
                    placeholder="Contoh: Juara 1 Olimpiade Matematika Nasional"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="foto_upload">Upload Foto Piagam / Siswa (Maks 5MB - Gambar/Foto)</Label>
                  <Input
                    id="foto_upload"
                    name="foto_upload"
                    type="file"
                    accept="image/*,.jpg,.jpeg,.png,.webp,.avif"
                    className="cursor-pointer file:text-amber-700 file:font-semibold"
                  />
                </div>

                <Button type="submit" variant="launch" size="lg" className="w-full mt-2">
                  <Plus className="h-4 w-4" /> Simpan Prestasi Siswa
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* List Prestasi (8 Cols) */}
        <div className="space-y-4 lg:col-span-8">
          <h2 className="text-lg font-bold">Daftar Prestasi Terkini ({achievements.length})</h2>

          {achievements.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Trophy className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <p>Belum ada catatan prestasi siswa yang dimasukkan.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.map((ach) => (
                <Card key={ach.id.toString()} className="border-amber-500/20 shadow-sm overflow-hidden">
                  <CardContent className="p-5 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 text-xl font-bold dark:bg-amber-950 dark:text-amber-300">
                        🏆
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-foreground leading-tight">{ach.prestasi}</h3>
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-1 truncate">
                          {ach.nama}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {ach.kelas} • {formatDateIndo(ach.created_at)}
                        </p>
                      </div>
                    </div>

                    <form
                      action={async () => {
                        "use server";
                        await deleteAchievementAction(ach.id.toString());
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 text-rose-500 hover:bg-rose-50 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
