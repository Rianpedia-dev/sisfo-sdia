import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Trophy } from "lucide-react";
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
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatDateIndo, getUserProfileImage, getDefaultProfileImage } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SiswaBestStudentPage() {
  const session = await getSession();
  if (!session || session.role !== "siswa") {
    redirect("/login");
  }

  const studentClass = session.kelas || "";

  let bestStudents: any[] = [];

  try {
    const [dbBest, studentUsers] = await Promise.all([
      studentClass
        ? prisma.bestStudent.findMany({
            where: { kelas: studentClass },
            orderBy: { created_at: "desc" },
          })
        : [],
      studentClass
        ? prisma.user.findMany({
            where: { kelas: studentClass, status: "1" },
            select: { name: true, image: true, gender: true },
          })
        : [],
    ]);

    const normalizeName = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
    const photoMap = new Map<string, string | null>();
    const genderMap = new Map<string, string | null>();
    studentUsers.forEach((u) => {
      if (u.image) {
        photoMap.set(normalizeName(u.name), u.image);
      }
      genderMap.set(normalizeName(u.name), u.gender);
    });

    const missingNames = dbBest
      .filter((b) => !b.foto && !photoMap.has(normalizeName(b.name)))
      .map((b) => b.name);

    if (missingNames.length > 0) {
      const extraUsers = await prisma.user.findMany({
        where: { name: { in: missingNames }, status: "1" },
        select: { name: true, image: true, gender: true },
      });
      extraUsers.forEach((u) => {
        if (u.image) photoMap.set(normalizeName(u.name), u.image);
        genderMap.set(normalizeName(u.name), u.gender);
      });
    }

    bestStudents = dbBest.map((bs) => {
      const g = genderMap.get(normalizeName(bs.name));
      return {
        ...bs,
        gender: g,
        foto: getUserProfileImage(bs.foto || photoMap.get(normalizeName(bs.name)), g),
      };
    });
  } catch (e) {
    console.error("Database query error in siswa best-student:", e);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Best Student {studentClass.toLowerCase().startsWith("kelas") ? studentClass : `Kelas ${studentClass || "(Belum ada kelas)"}`}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Daftar siswa teladan berprestasi yang dianugerahi gelar Best Student oleh wali kelas.
        </p>
      </div>

      {/* Grid of Highlight Badges */}
      {bestStudents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {bestStudents.slice(0, 3).map((bs, idx) => (
            <Card key={bs.id.toString()} className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-background to-background text-center shadow-sm">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 text-2xl font-bold border-2 border-purple-300 shadow-inner overflow-hidden mb-3">
                <UserAvatar
                  src={bs.foto}
                  gender={bs.gender}
                  alt={bs.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="font-bold text-base text-foreground">{bs.name}</h3>
              <Badge className="mt-1 bg-purple-600 text-white text-xs">
                {bs.kategori}
              </Badge>
              <p className="text-[11px] text-muted-foreground mt-2">{bs.kelas}</p>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Table view */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daftar Penghargaan Best Student</CardTitle>
          <CardDescription>Semua penghargaan yang tercatat untuk kelas Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12 text-center font-bold">No</TableHead>
                  <TableHead className="w-16 text-center font-bold">Foto</TableHead>
                  <TableHead className="font-bold">Nama Siswa</TableHead>
                  <TableHead className="font-bold">Kelas</TableHead>
                  <TableHead className="font-bold">Kategori Penghargaan</TableHead>
                  <TableHead className="font-bold">Tanggal Diberikan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Belum ada siswa yang ditetapkan sebagai Best Student di kelas ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  bestStudents.map((bs, idx) => (
                    <TableRow key={bs.id.toString()} className="hover:bg-muted/30">
                      <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                      <TableCell className="text-center">
                        <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs mx-auto overflow-hidden">
                          <UserAvatar
                            src={bs.foto}
                            gender={bs.gender}
                            alt={bs.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">{bs.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{bs.kelas}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-normal text-xs">
                          {bs.kategori}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateIndo(bs.created_at)}
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
