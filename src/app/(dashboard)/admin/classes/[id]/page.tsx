import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ArrowLeft, School, User, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminClassDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let kelas: any = null;
  let students: any[] = [];
  let wali: any = null;

  try {
    const isNum = /^\d+$/.test(id);
    if (isNum) {
      kelas = await prisma.kelas.findUnique({
        where: { id: BigInt(id) },
      });
    }
    if (kelas) {
      students = await prisma.user.findMany({
        where: {
          kelas: kelas.nama_kelas,
          status: "1",
        },
        orderBy: { name: "asc" },
      });
      if (kelas.wali_kelas) {
        wali = await prisma.user.findFirst({
          where: { name: kelas.wali_kelas },
        });
      }
    }
  } catch (e) {
    console.error("Database query error in class detail:", e);
  }

  if (!kelas) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header & Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/classes"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Kelas
        </Link>
        <Badge variant="outline" className="text-xs">
          ID: {id}
        </Badge>
      </div>

      {/* Class Banner Info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-background to-background">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <School className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Nama Kelas</p>
              <h2 className="text-base font-bold text-foreground">{kelas.nama_kelas}</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-background to-background">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Wali Kelas</p>
              <h2 className="text-base font-bold text-foreground">{kelas.wali_kelas || "Belum ada"}</h2>
              {wali?.email && <p className="text-xs text-muted-foreground">{wali.email}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-background to-background">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Code Restrict iPad</p>
              <h2 className="text-base font-bold font-mono text-foreground">{kelas.code_restrict || "-"}</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rombongan Belajar / Siswa */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Siswa Terdaftar</CardTitle>
            <Badge className="bg-emerald-600">
              Total: {students.length} Siswa
            </Badge>
          </div>
          <CardDescription>
            Seluruh siswa aktif yang tercatat dalam rombongan belajar {kelas.nama_kelas}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12 text-center font-bold">No</TableHead>
                  <TableHead className="font-bold">Nama Lengkap</TableHead>
                  <TableHead className="font-bold">NIS</TableHead>
                  <TableHead className="font-bold">Gender</TableHead>
                  <TableHead className="font-bold">Apple ID</TableHead>
                  <TableHead className="font-bold text-center">Poin</TableHead>
                  <TableHead className="w-20 text-center font-bold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Belum ada siswa yang dimasukkan ke dalam kelas ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((s, idx) => (
                    <TableRow key={s.id.toString()} className="hover:bg-muted/30">
                      <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                      <TableCell className="font-semibold">{s.name}</TableCell>
                      <TableCell className="font-mono text-xs">{s.nis || "-"}</TableCell>
                      <TableCell>{s.gender === "L" ? "Laki-laki" : "Perempuan"}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{s.appleid || "-"}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono text-xs text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300">
                          {s.point || "0"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Link
                          href={`/admin/students/${s.id}`}
                          className="text-xs text-sky-600 hover:underline font-medium"
                        >
                          Detail
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
