import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ArrowLeft, User, Trophy, Save, Key, Tablet, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateUserAction } from "@/actions/admin";
import { createAchievementAction, deleteAchievementAction } from "@/actions/guru";

export const dynamic = "force-dynamic";

export default async function AdminStudentDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let student: any = null;
  let classes: any[] = [];
  let achievements: any[] = [];

  try {
    const isNum = /^\d+$/.test(id);
    const [dbStudent, dbClasses, dbAchievements] = await Promise.all([
      isNum
        ? prisma.user.findUnique({
            where: { id: BigInt(id) },
          })
        : null,
      prisma.kelas.findMany({
        orderBy: { nama_kelas: "asc" },
      }),
      prisma.prestasi.findMany({
        where: { id_user: id },
        orderBy: { created_at: "desc" },
      }),
    ]);
    student = dbStudent;
    classes = dbClasses;
    achievements = dbAchievements;
  } catch (e) {
    console.error("Database query error in student detail:", e);
  }

  if (!student) {
    notFound();
  }

  const handleUpdate = async (formData: FormData) => {
    "use server";
    await updateUserAction(id, formData);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/students"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Siswa
        </Link>
        <div className="flex items-center gap-2">
          <Badge
            variant={student.status === "1" ? "default" : "destructive"}
            className={student.status === "1" ? "bg-emerald-600" : ""}
          >
            {student.status === "1" ? "Siswa Aktif" : "Menunggu Verifikasi"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form Edit Data Siswa (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-emerald-500/20 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                <CardTitle>Profil & Data Akun Siswa</CardTitle>
              </div>
              <CardDescription>
                Perbarui identitas, kredensial login, dan pengaturan iPad siswa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleUpdate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input id="name" name="name" defaultValue={student.name} required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" defaultValue={student.email} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="kelas">Kelas</Label>
                    <select
                      id="kelas"
                      name="kelas"
                      defaultValue={student.kelas || ""}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {classes.map((c) => (
                        <option key={c.id.toString()} value={c.nama_kelas}>
                          {c.nama_kelas}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Password reset & plain text notice per PRD Section 19.1 */}
                <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Key className="h-3.5 w-3.5" />
                    <span>Kredensial Password Siswa</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="password">Ganti Password (Kosongkan jika tidak ingin ganti)</Label>
                      <Input id="password" name="password" type="text" placeholder="Password baru" />
                    </div>
                    <div className="space-y-1">
                      <Label>Password Saat Ini (Plaintext):</Label>
                      <div className="rounded-md border bg-background px-3 py-2 font-mono text-sm">
                        {student.password1 || "(Tersimpan dienkripsi)"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Apple ID & Catatan iPad */}
                <div className="rounded-lg border border-sky-500/20 bg-sky-50/20 p-3 space-y-3 dark:bg-sky-950/10">
                  <div className="flex items-center gap-2 text-xs font-semibold text-sky-800 dark:text-sky-300">
                    <Tablet className="h-3.5 w-3.5" />
                    <span>Pengaturan Perangkat iPad Siswa</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="appleid">Apple ID</Label>
                      <Input id="appleid" name="appleid" defaultValue={student.appleid || ""} placeholder="siswa@icloud.com" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="passwordappleid">Password Apple ID</Label>
                      <Input id="passwordappleid" name="passwordappleid" defaultValue={student.passwordappleid || ""} placeholder="Password Apple ID" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="ctt_iPad">Catatan iPad</Label>
                    <Textarea
                      id="ctt_iPad"
                      name="ctt_iPad"
                      defaultValue={student.ctt_iPad || ""}
                      placeholder="Catatan kondisi fisik, nomor seri, atau penggunaan iPad siswa..."
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" size="lg">
                    <Save className="h-4 w-4" /> Simpan Perubahan Data
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Prestasi Siswa Section (1 Col) */}
        <div className="space-y-6">
          <Card className="border-amber-500/20 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-base">Prestasi Siswa</CardTitle>
              </div>
              <CardDescription>
                Daftar pencapaian & kejuaraan yang diraih siswa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* List Prestasi */}
              {achievements.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4 italic">
                  Belum ada catatan prestasi.
                </p>
              ) : (
                <div className="space-y-2">
                  {achievements.map((ach) => (
                    <div
                      key={ach.id.toString()}
                      className="flex items-start justify-between rounded-lg border p-3 text-xs"
                    >
                      <div>
                        <p className="font-bold text-foreground">{ach.prestasi}</p>
                        <p className="text-muted-foreground mt-0.5">{ach.kelas}</p>
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
                          className="h-7 w-7 text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </form>
                    </div>
                  ))}
                </div>
              )}

              {/* Form Tambah Prestasi Baru */}
              <div className="border-t pt-3">
                <p className="text-xs font-semibold mb-2">Tambah Prestasi</p>
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    formData.set("id_user", id);
                    formData.set("nama", student.name);
                    formData.set("kelas", student.kelas || "Umum");
                    await createAchievementAction(formData);
                  }}
                  className="space-y-2"
                >
                  <Input
                    name="prestasi"
                    placeholder="Contoh: Juara 1 Tahfidz Qur'an Se-Sumsel"
                    required
                    className="text-xs"
                  />
                  <Input
                    name="fotoanak"
                    placeholder="URL Foto Prestasi (opsional)"
                    defaultValue="/images/trophy.png"
                    className="text-xs"
                  />
                  <Button type="submit" size="sm" variant="outline" className="w-full gap-1 text-xs">
                    <Plus className="h-3 w-3" /> Tambah Prestasi
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
