import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Send, Calendar, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createAnnouncementAction, deleteAnnouncementAction } from "@/actions/admin";
import { formatDateIndo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GuruAnnouncementsPage() {
  const session = await getSession();
  if (!session || session.role !== "guru") {
    redirect("/login");
  }

  const guruClass = session.kelas || "Guru";

  let announcements: any[] = [];
  try {
    announcements = await prisma.pengumuman.findMany({
      where: { from: guruClass },
      orderBy: { id: "desc" },
    });
  } catch (e) {
    console.error("Database query error in guru announcements:", e);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengumuman Kelas</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Form Buat Pengumuman (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="border-emerald-500/20 shadow-sm sticky top-20">
            <CardHeader>
              <CardTitle className="text-base">Tulis Pengumuman Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  await createAnnouncementAction(formData);
                }}
                className="space-y-3"
              >
                <input type="hidden" name="from" value={guruClass} />

                <div className="space-y-1">
                  <Label htmlFor="title">Judul Pengumuman</Label>
                  <Input id="title" name="title" placeholder="Contoh: Tugas Proyek Sains Mandiri" required />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="file_upload">Upload Lampiran (PDF, JPG, PNG - Maks 2MB)</Label>
                  <Input
                    id="file_upload"
                    name="file_upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="cursor-pointer file:text-emerald-700 file:font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="pengumuman">Isi Pengumuman</Label>
                  <Textarea
                    id="pengumuman"
                    name="pengumuman"
                    placeholder="Tulis detail instruksi di sini..."
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full mt-2">
                  <Send className="h-4 w-4" /> Terbitkan ke Kelas
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Daftar Pengumuman Kelas Guru (7 Cols) */}
        <div className="space-y-4 lg:col-span-7">
          <h2 className="text-lg font-bold">Daftar Pengumuman Diterbitkan ({announcements.length})</h2>

          {announcements.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <p>Belum ada pengumuman yang Anda terbitkan untuk kelas ini.</p>
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
                      <Link href={`/guru/announcements/${item.id}`}>
                        <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-muted-foreground">
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
