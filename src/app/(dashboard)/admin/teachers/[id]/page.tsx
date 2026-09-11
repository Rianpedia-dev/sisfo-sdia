import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ArrowLeft, User, Save, Key, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateUserAction } from "@/actions/admin";
import { getRoleLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminTeacherDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let teacher: any = null;
  let classes: any[] = [];

  try {
    const isNum = /^\d+$/.test(id);
    const [dbTeacher, dbClasses] = await Promise.all([
      isNum
        ? prisma.user.findUnique({
            where: { id: BigInt(id) },
          })
        : null,
      prisma.kelas.findMany({
        orderBy: { nama_kelas: "asc" },
      }),
    ]);
    teacher = dbTeacher;
    classes = dbClasses;
  } catch (e) {
    console.error("Database query error in teacher detail:", e);
  }

  if (!teacher) {
    notFound();
  }

  const handleUpdate = async (formData: FormData) => {
    "use server";
    await updateUserAction(id, formData);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/teachers"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Guru
        </Link>
        <Badge className="bg-emerald-600">
          {getRoleLabel(teacher.status)}
        </Badge>
      </div>

      <Card className="border-emerald-500/20 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-600" />
            <CardTitle>Profil & Data Pengajar</CardTitle>
          </div>
          <CardDescription>
            Perbarui data pribadi, NIP, mata pelajaran, dan penugasan kelas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama Lengkap & Gelar</Label>
              <Input id="name" name="name" defaultValue={teacher.name} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={teacher.email} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="kelas">Kelas Binaan / Wali Kelas</Label>
                <select
                  id="kelas"
                  name="kelas"
                  defaultValue={teacher.kelas || ""}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                >
                  <option value="">-- Tidak Membina Kelas --</option>
                  {classes.map((c) => (
                    <option key={c.id.toString()} value={c.nama_kelas}>
                      {c.nama_kelas}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Key className="h-3.5 w-3.5" />
                <span>Password Guru</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="password">Ganti Password (Opsional)</Label>
                  <Input id="password" name="password" type="text" placeholder="Password baru" />
                </div>
                <div className="space-y-1">
                  <Label>Password Saat Ini (Plaintext):</Label>
                  <div className="rounded-md border bg-background px-3 py-2 font-mono text-sm">
                    {teacher.password1 || "(Tersimpan dienkripsi)"}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="appleid">Apple ID</Label>
                <Input id="appleid" name="appleid" defaultValue={teacher.appleid || ""} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="passwordappleid">Password Apple ID</Label>
                <Input id="passwordappleid" name="passwordappleid" defaultValue={teacher.passwordappleid || ""} />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button type="submit" size="lg">
                <Save className="h-4 w-4" /> Simpan Data Guru
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
