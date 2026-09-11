import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ArrowLeft, Megaphone, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateAnnouncementAction } from "@/actions/admin";

export const dynamic = "force-dynamic";

export default async function GuruEditAnnouncementPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "guru") {
    redirect("/login");
  }

  const { id } = await props.params;

  let announcement: any = null;

  try {
    const isNum = /^\d+$/.test(id);
    if (isNum) {
      announcement = await prisma.pengumuman.findUnique({
        where: { id: BigInt(id) },
      });
    }
  } catch (e) {
    console.error("Database query error in guru edit announcement:", e);
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
          href="/guru/announcements"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
      </div>

      <Card className="border-emerald-500/20 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-emerald-600" />
            <CardTitle>Edit Pengumuman Kelas</CardTitle>
          </div>
          <CardDescription>
            Perbarui judul, lampiran, atau instruksi pengumuman kelas Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-4">
            <input type="hidden" name="from" value={announcement.from || session.kelas || "Guru"} />

            <div className="space-y-1.5">
              <Label htmlFor="title">Judul Pengumuman</Label>
              <Input
                id="title"
                name="title"
                defaultValue={announcement.title}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="file">Link File Lampiran (Opsional)</Label>
              <Input
                id="file"
                name="file"
                defaultValue={announcement.file || ""}
                placeholder="https://... atau /uploads/file.pdf"
              />
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
