import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ArrowLeft, Megaphone, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateAnnouncementAction } from "@/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminEditAnnouncementPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let announcement: any = null;
  let classes: any[] = [];

  try {
    const isNum = /^\d+$/.test(id);
    const [dbAnnounce, dbClasses] = await Promise.all([
      isNum
        ? prisma.pengumuman.findUnique({
            where: { id: BigInt(id) },
          })
        : null,
      prisma.kelas.findMany({
        orderBy: { nama_kelas: "asc" },
      }),
    ]);
    announcement = dbAnnounce;
    classes = dbClasses;
  } catch (e) {
    console.error("Database query error in edit announcement:", e);
  }

  if (!announcement) {
    notFound();
  }

  const handleUpdate = async (formData: FormData) => {
    "use server";
    await updateAnnouncementAction(id, formData);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
      </div>

      <Card className="border-emerald-500/20 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-emerald-600" />
            <CardTitle>Edit Pengumuman</CardTitle>
          </div>
          <CardDescription>
            Perbarui isi atau judul pengumuman yang telah terbit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Judul Pengumuman</Label>
              <Input
                id="title"
                name="title"
                defaultValue={announcement.title}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="from">Pengirim / Sasaran</Label>
                <select
                  id="from"
                  name="from"
                  defaultValue={announcement.from || "IT"}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                  required
                >
                  <option value="IT">Tim IT / Sekolah (Semua Pengguna)</option>
                  {classes.map((c) => (
                    <option key={c.id.toString()} value={c.nama_kelas}>
                      {c.nama_kelas}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="file">Link File Lampiran</Label>
                <Input
                  id="file"
                  name="file"
                  defaultValue={announcement.file || ""}
                  placeholder="https://... atau /uploads/file.pdf"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pengumuman">Konten Pengumuman</Label>
              <Textarea
                id="pengumuman"
                name="pengumuman"
                defaultValue={announcement.pengumuman}
                rows={8}
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="lg">
                <Save className="h-4 w-4" /> Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
