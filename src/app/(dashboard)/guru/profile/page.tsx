import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { User, Mail, Shield, BookOpen, MapPin, Save, UserCheck, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRoleLabel } from "@/lib/utils";
import { updateProfileAction } from "@/actions/guru";

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
      image: null,
    };
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Kelola informasi identitas pribadi dan penugasan mengajar Anda.
        </p>
      </div>

      <Card className="border-emerald-500/20 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 text-2xl font-bold dark:bg-emerald-950 dark:text-emerald-300 overflow-hidden border border-emerald-300">
            {teacher.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={teacher.image} alt={teacher.name} className="h-full w-full object-cover" />
            ) : (
              teacher.name.substring(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{teacher.name}</CardTitle>
              <Badge className="bg-emerald-600">{getRoleLabel(teacher.status)}</Badge>
            </div>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Mail className="h-3.5 w-3.5" />
              <span>{teacher.email}</span>
              {teacher.nip && <span>• NIP: {teacher.nip}</span>}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
              await updateProfileAction(formData);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama Lengkap & Gelar</Label>
              <Input id="name" name="name" defaultValue={teacher.name} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="guru_bidang">Bidang Studi / Mata Pelajaran</Label>
                <Input
                  id="guru_bidang"
                  name="guru_bidang"
                  defaultValue={teacher.guru_bidang || ""}
                  placeholder="Contoh: Pendidikan Agama Islam"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="kelas">Wali Kelas</Label>
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

            <div className="space-y-1.5">
              <Label htmlFor="address">Alamat Tempat Tinggal</Label>
              <Textarea
                id="address"
                name="address"
                defaultValue={teacher.address || ""}
                placeholder="Alamat domisili lengkap..."
                rows={3}
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

            <div className="flex justify-end pt-3">
              <Button type="submit" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Save className="h-4 w-4" /> Simpan Perubahan Profil
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
