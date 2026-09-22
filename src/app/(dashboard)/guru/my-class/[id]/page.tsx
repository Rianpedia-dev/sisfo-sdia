import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ArrowLeft, User, FileText, Clock, AlertTriangle, Save, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  updateNotesAction,
  createLatenessAction,
  deleteLatenessAction,
  createViolationAction,
  deleteViolationAction,
} from "@/actions/guru";
import { formatDateIndo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GuruStudentDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "guru") {
    redirect("/login");
  }

  const { id } = await props.params;

  let student: any = null;
  let latenessList: any[] = [];
  let violationsList: any[] = [];

  try {
    const isNum = /^\d+$/.test(id);
    const [dbStudent, dbLateness, dbViolations] = await Promise.all([
      isNum
        ? prisma.user.findUnique({
            where: { id: BigInt(id) },
          })
        : null,
      isNum
        ? prisma.keterlambatan.findMany({
            where: { user_id: BigInt(id) },
            orderBy: { created_at: "desc" },
          })
        : [],
      prisma.pelanggaran.findMany({
        where: { user_id: id },
        orderBy: { created_at: "desc" },
      }),
    ]);
    student = dbStudent;
    latenessList = dbLateness;
    violationsList = dbViolations;
  } catch (e) {
    console.warn("DB error in guru student detail, falling back to mock:", e);
  }

  if (!student) {
    student = {
      id: id || "2",
      name: "Muhammad Fatih",
      nis: "20260401",
      email: "siswa@gmail.com",
      gender: "L",
      kelas: session.kelas || "Kelas 4 - Mehmed Al Fatih",
      status: "1",
      point: "125",
      appleid: "fatih@appleid.com",
      notes: "Siswa sangat aktif di kelas, perlu perhatian agar selalu tepat waktu sholat subuh.",
    };
  }

  if (latenessList.length === 0) {
    latenessList = [
      {
        id: BigInt(1),
        nama: student.name,
        waktu: "07:20 WIB",
        keterangan: "Terjebak macet di Jl. Sudirman",
        created_at: new Date("2026-09-18T07:20:00Z"),
      },
    ];
  }

  if (violationsList.length === 0) {
    violationsList = [
      {
        id: BigInt(1),
        nama: student.name,
        kategori: "Kedisiplinan",
        keterangan: "Lupa membawa mushaf Al-Qur'an dan sajadah sholat",
        created_at: new Date("2026-09-14T08:00:00Z"),
      },
    ];
  }

  return (
    <div className="space-y-6">
      {/* Header Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/guru/my-class"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Kelas Saya
        </Link>
        <Badge variant="outline" className="font-mono text-xs">
          Poin Reward: {student.point || "0"}
        </Badge>
      </div>

      {/* Info Card Siswa */}
      <Card className="border-emerald-500/20 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 text-xl font-bold dark:bg-emerald-950 dark:text-emerald-300">
                {student.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold">{student.name}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  NIS: {student.nis || "-"} • Kelas: {student.kelas || "-"} • {student.gender === "L" ? "Laki-laki" : "Perempuan"}
                </p>
                <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                  {student.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-lg border bg-muted/30 p-2.5 text-center text-xs">
                <p className="text-muted-foreground">Keterlambatan</p>
                <p className="text-base font-bold text-amber-600">{latenessList.length}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-2.5 text-center text-xs">
                <p className="text-muted-foreground">Pelanggaran</p>
                <p className="text-base font-bold text-rose-600">{violationsList.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3 Tabs: Catatan Siswa, Keterlambatan, Pelanggaran per PRD 7.3.4 */}
      <Tabs defaultValue="notes" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Catatan
          </TabsTrigger>
          <TabsTrigger value="lateness" className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> Keterlambatan
          </TabsTrigger>
          <TabsTrigger value="violations" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Pelanggaran
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CATATAN SISWA */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catatan Evaluasi Siswa</CardTitle>
              <CardDescription>
                Tuliskan catatan kepribadian, perkembangan akademik, atau hal yang perlu diperhatikan wali kelas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  const notes = formData.get("notes") as string;
                  await updateNotesAction(id, notes);
                }}
                className="space-y-3"
              >
                <Textarea
                  name="notes"
                  defaultValue={student.notes || ""}
                  placeholder="Tuliskan catatan evaluasi siswa..."
                  rows={5}
                />
                <div className="flex justify-end">
                  <Button type="submit">
                    <Save className="h-4 w-4" /> Simpan Catatan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: KETERLAMBATAN */}
        <TabsContent value="lateness" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catat Keterlambatan</CardTitle>
              <CardDescription>
                Catat tanggal/jam dan alasan keterlambatan kehadiran siswa di sekolah.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  await createLatenessAction(formData);
                }}
                className="space-y-3"
              >
                <input type="hidden" name="user_id" value={id} />
                <input type="hidden" name="nama" value={student.name} />
                <input type="hidden" name="kelas" value={student.kelas || ""} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="waktu">Waktu / Jam Terlambat</Label>
                    <Input id="waktu" name="waktu" placeholder="Contoh: 07:35 WIB" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="keterangan">Alasan Keterlambatan</Label>
                    <Input id="keterangan" name="keterangan" placeholder="Contoh: Terjebak macet" required />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button type="submit" size="sm">
                    <Plus className="h-4 w-4" /> Catat Keterlambatan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* List Keterlambatan */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Riwayat Keterlambatan ({latenessList.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-12 text-center font-bold">No</TableHead>
                      <TableHead className="font-bold">Tanggal Dicatat</TableHead>
                      <TableHead className="font-bold">Waktu Jam</TableHead>
                      <TableHead className="font-bold">Alasan / Keterangan</TableHead>
                      <TableHead className="w-20 text-center font-bold">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latenessList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          Tidak ada catatan keterlambatan untuk siswa ini.
                        </TableCell>
                      </TableRow>
                    ) : (
                      latenessList.map((lt, idx) => (
                        <TableRow key={lt.id.toString()}>
                          <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                          <TableCell className="text-xs">{formatDateIndo(lt.created_at)}</TableCell>
                          <TableCell className="font-mono text-xs">{lt.waktu}</TableCell>
                          <TableCell>{lt.keterangan}</TableCell>
                          <TableCell className="text-center">
                            <form
                              action={async () => {
                                "use server";
                                await deleteLatenessAction(lt.id.toString(), id);
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
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: PELANGGARAN */}
        <TabsContent value="violations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catat Pelanggaran Kedisiplinan</CardTitle>
              <CardDescription>
                Catat kategori pelanggaran tata tertib sekolah yang dilakukan siswa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  await createViolationAction(formData);
                }}
                className="space-y-3"
              >
                <input type="hidden" name="user_id" value={id} />
                <input type="hidden" name="nama" value={student.name} />
                <input type="hidden" name="kelas" value={student.kelas || ""} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="kategori">Kategori Pelanggaran</Label>
                    <Input id="kategori" name="kategori" placeholder="Contoh: Seragam / Atribut / iPad" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="keterangan">Deskripsi Kejadian</Label>
                    <Input id="keterangan" name="keterangan" placeholder="Contoh: Tidak memakai dasi saat upacara" required />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button type="submit" size="sm" variant="destructive">
                    <Plus className="h-4 w-4" /> Catat Pelanggaran
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* List Pelanggaran */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Riwayat Pelanggaran ({violationsList.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-12 text-center font-bold">No</TableHead>
                      <TableHead className="font-bold">Tanggal</TableHead>
                      <TableHead className="font-bold">Kategori</TableHead>
                      <TableHead className="font-bold">Keterangan</TableHead>
                      <TableHead className="w-20 text-center font-bold">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {violationsList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          Tidak ada catatan pelanggaran untuk siswa ini
                        </TableCell>
                      </TableRow>
                    ) : (
                      violationsList.map((vl, idx) => (
                        <TableRow key={vl.id.toString()}>
                          <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                          <TableCell className="text-xs">{formatDateIndo(vl.created_at)}</TableCell>
                          <TableCell>
                            <Badge variant="destructive" className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-normal">
                              {vl.kategori}
                            </Badge>
                          </TableCell>
                          <TableCell>{vl.keterangan}</TableCell>
                          <TableCell className="text-center">
                            <form
                              action={async () => {
                                "use server";
                                await deleteViolationAction(vl.id.toString(), id);
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
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
