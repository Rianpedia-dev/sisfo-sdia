import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Send, Calendar, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createAnnouncementAction, deleteAnnouncementAction } from "@/actions/admin";
import { formatDateIndo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  let classes: any[] = [];
  let announcements: any[] = [];
  try {
    const [dbClasses, dbAnnounce] = await Promise.all([
      prisma.kelas.findMany({
        orderBy: { nama_kelas: "asc" },
      }),
      prisma.pengumuman.findMany({
        orderBy: { id: "desc" },
      }),
    ]);
    classes = dbClasses;
    announcements = dbAnnounce;
  } catch (e) {
    console.error("Database query error in announcements:", e);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Form Buat Pengumuman (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="border-emerald-500/20 shadow-sm sticky top-20">
            <CardHeader>
              <CardTitle className="text-base">Publikasikan Pengumuman Baru</CardTitle>
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
                    placeholder="Tuliskan isi pengumuman lengkap di sini..."
                    rows={8}
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" size="lg" className="w-full">
                    <Send className="h-4 w-4" /> Terbitkan Pengumuman
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Daftar Pengumuman Sekolah (7 Cols) */}
        <div className="space-y-4 lg:col-span-7">
          <h2 className="text-lg font-bold">Daftar Pengumuman Diterbitkan ({announcements.length})</h2>

          {announcements.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <p>Belum ada pengumuman yang diterbitkan.</p>
              </CardContent>
            </Card>
          ) : (
            announcements.map((item) => (
              <Card key={item.id.toString()} className="border-l-4 border-l-emerald-600">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {item.from}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatDateIndo(item.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link href={`/admin/announcements/${item.id}`}>
                        <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteAnnouncementAction(item.id.toString());
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
                  </div>

                  <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                  <div
                    className="text-xs text-muted-foreground leading-relaxed prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.pengumuman }}
                  />

                  {item.file && (
                    <div className="pt-1 text-xs text-emerald-600">
                      Lampiran: <a href={item.file} target="_blank" rel="noreferrer" className="underline">{item.file}</a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
