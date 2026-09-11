import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Megaphone, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createAnnouncementAction } from "@/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminCreateAnnouncementPage() {
  let classes: any[] = [];
  try {
    classes = await prisma.kelas.findMany({
      orderBy: { nama_kelas: "asc" },
    });
  } catch (e) {
    console.error("Database query error in announcements:", e);
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </div>

      <Card className="border-emerald-500/20 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-emerald-600" />
            <CardTitle>Publikasikan Pengumuman Baru</CardTitle>
          </div>
          <CardDescription>
            Tulis pengumuman resmi dari Tim IT / Sekolah untuk seluruh kelas atau kelas tertentu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
              await createAnnouncementAction(formData);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="title">Judul Pengumuman</Label>
              <Input
                id="title"
                name="title"
                placeholder="Contoh: Jadwal Ujian Tengah Semester Genap 2026/2027"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="from">Pengirim / Sasaran Pengumuman</Label>
                <select
                  id="from"
                  name="from"
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
                <Label htmlFor="file_upload">Upload Lampiran (PDF, JPG, PNG - Maks 2MB)</Label>
                <Input
                  id="file_upload"
                  name="file_upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="cursor-pointer file:text-emerald-700 file:font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pengumuman">Konten Pengumuman (Mendukung format HTML/Teks)</Label>
              <Textarea
                id="pengumuman"
                name="pengumuman"
                placeholder="Tuliskan isi pengumuman lengkap di sini. Anda dapat menggunakan format paragraf <p>...</p>..."
                rows={8}
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="lg">
                <Send className="h-4 w-4" /> Terbitkan Pengumuman
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
