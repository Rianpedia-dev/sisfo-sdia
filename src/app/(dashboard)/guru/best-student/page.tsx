import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Award, Plus, Trash2, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createBestStudentAction, deleteBestStudentAction } from "@/actions/guru";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getUserProfileImage, getDefaultProfileImage } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GuruBestStudentPage() {
  const session = await getSession();
  if (!session || session.role !== "guru") {
    redirect("/login");
  }

  const guruClass = session.kelas || "";

  let students: any[] = [];
  let bestStudents: any[] = [];

  try {
    const [dbStudents, dbBest] = await Promise.all([
      guruClass
        ? prisma.user.findMany({
            where: { kelas: guruClass, status: "1" },
            orderBy: { name: "asc" },
          })
        : [],
      guruClass
        ? prisma.bestStudent.findMany({
            where: { kelas: guruClass },
            orderBy: { created_at: "desc" },
          })
        : [],
    ]);

    const normalizeName = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
    const photoMap = new Map<string, string | null>();
    const genderMap = new Map<string, string | null>();
    dbStudents.forEach((u) => {
      if (u.image) {
        photoMap.set(normalizeName(u.name), u.image);
      }
      genderMap.set(normalizeName(u.name), u.gender);
    });

    const missingNames = dbBest
      .filter((b) => !b.foto && !photoMap.has(normalizeName(b.name)))
      .map((b) => b.name);

    if (missingNames.length > 0) {
      const extraUsers = await prisma.user.findMany({
        where: { name: { in: missingNames }, status: "1" },
        select: { name: true, image: true, gender: true },
      });
      extraUsers.forEach((u) => {
        if (u.image) photoMap.set(normalizeName(u.name), u.image);
        genderMap.set(normalizeName(u.name), u.gender);
      });
    }

    students = dbStudents;
    bestStudents = dbBest.map((bs) => {
      const g = genderMap.get(normalizeName(bs.name));
      return {
        ...bs,
        gender: g,
        foto: getUserProfileImage(bs.foto || photoMap.get(normalizeName(bs.name)), g),
      };
    });
  } catch (e) {
    console.error("Database query error in best student:", e);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Best Student: {guruClass}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Berikan apresiasi dan penghargaan untuk siswa teladan dalam akhlak, tahfidz, atau akademik.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Form Tambah Best Student (4 Cols) */}
        <div className="lg:col-span-4">
          <Card className="border-purple-500/20 shadow-sm sticky top-20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                <span>Pilih Best Student</span>
              </CardTitle>
              <CardDescription>
                Pilih siswa dan kategori penghargaan yang diraih.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  await createBestStudentAction(formData);
                }}
                className="space-y-3"
              >
                <input type="hidden" name="kelas" value={guruClass} />

                <div className="space-y-1">
                  <Label htmlFor="name">Pilih Siswa</Label>
                  <select
                    id="name"
                    name="name"
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                  >
                    <option value="">-- Pilih Siswa Kelas --</option>
                    {students.map((s) => (
                      <option key={s.id.toString()} value={s.name}>
                        {s.name} ({s.nis || "No NIS"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="kategori">Kategori Penghargaan</Label>
                  <Input
                    id="kategori"
                    name="kategori"
                    placeholder="Contoh: The Best Akhlak / Best Tahfidz"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="foto_upload">Upload Foto Siswa (Maks 5MB - Gambar/Foto)</Label>
                  <Input
                    id="foto_upload"
                    name="foto_upload"
                    type="file"
                    accept="image/*,.jpg,.jpeg,.png,.webp,.avif"
                    className="cursor-pointer file:text-purple-700 file:font-semibold"
                  />
                </div>

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-2 gap-1.5">
                  <Plus className="h-4 w-4" /> Tetapkan Best Student
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Daftar Best Student Cards (8 Cols) */}
        <div className="space-y-4 lg:col-span-8">
          <h2 className="text-lg font-bold">Daftar Penghargaan ({bestStudents.length})</h2>

          {bestStudents.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Trophy className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <p>Belum ada siswa yang ditetapkan sebagai Best Student di kelas ini.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bestStudents.map((bs) => (
                <Card key={bs.id.toString()} className="border-purple-500/20 shadow-sm overflow-hidden">
                  <CardContent className="p-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-800 text-xl font-bold border border-purple-200 overflow-hidden">
                        <UserAvatar
                          src={bs.foto}
                          gender={bs.gender}
                          alt={bs.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-foreground truncate">{bs.name}</h3>
                        <Badge className="mt-1 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-normal text-xs">
                          {bs.kategori}
                        </Badge>
                        <p className="text-[11px] text-muted-foreground mt-1">{bs.kelas}</p>
                      </div>
                    </div>

                    <form
                      action={async () => {
                        "use server";
                        await deleteBestStudentAction(bs.id.toString());
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 text-rose-500 hover:bg-rose-50"
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
