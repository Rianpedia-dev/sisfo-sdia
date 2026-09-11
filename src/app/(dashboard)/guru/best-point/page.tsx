import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Trophy, Medal, Award, Crown } from "lucide-react";
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

export default async function GuruBestPointPage() {
  const session = await getSession();
  if (!session || session.role !== "guru") {
    redirect("/login");
  }

  const guruClass = session.kelas || "";

  let students: any[] = [];

  try {
    students = guruClass
      ? await prisma.user.findMany({
          where: { kelas: guruClass, status: "1" },
        })
      : [];
  } catch (e) {
    console.error("Database query error in best-point:", e);
  }

  // Sort descending by point
  const sortedStudents = [...students].sort(
    (a, b) => (parseInt(b.point || "0", 10) || 0) - (parseInt(a.point || "0", 10) || 0)
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold tracking-tight">Leaderboard Poin Murid</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Peringkat keaktifan & reward siswa kelas {guruClass} berdasarkan akumulasi poin perilaku dan prestasi.
        </p>
      </div>

      {/* Top 3 Podium Highlights */}
      {sortedStudents.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {/* Juara 2 */}
          <Card className="border-slate-300 shadow-sm bg-gradient-to-br from-slate-100 via-background to-background dark:from-slate-900 sm:order-1 order-2">
            <CardContent className="p-5 text-center flex flex-col items-center">
              <Medal className="h-8 w-8 text-slate-400 mb-2" />
              <Badge variant="outline" className="text-xs mb-1">Juara 2</Badge>
              <h3 className="font-bold text-sm truncate w-full">{sortedStudents[1].name}</h3>
              <p className="font-mono text-xl font-extrabold text-slate-700 dark:text-slate-300 mt-2">
                {sortedStudents[1].point || 0} <span className="text-xs font-normal">Poin</span>
              </p>
            </CardContent>
          </Card>

          {/* Juara 1 */}
          <Card className="border-amber-400 shadow-md bg-gradient-to-br from-amber-500/15 via-background to-background sm:order-2 order-1 ring-2 ring-amber-400/30">
            <CardContent className="p-6 text-center flex flex-col items-center">
              <Crown className="h-10 w-10 text-amber-500 mb-2" />
              <Badge className="bg-amber-500 text-white text-xs mb-1">Juara 1</Badge>
              <h3 className="font-bold text-base truncate w-full">{sortedStudents[0].name}</h3>
              <p className="font-mono text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
                {sortedStudents[0].point || 0} <span className="text-xs font-normal">Poin</span>
              </p>
            </CardContent>
          </Card>

          {/* Juara 3 */}
          <Card className="border-amber-700/30 shadow-sm bg-gradient-to-br from-amber-800/10 via-background to-background sm:order-3 order-3">
            <CardContent className="p-5 text-center flex flex-col items-center">
              <Award className="h-8 w-8 text-amber-700 mb-2" />
              <Badge variant="outline" className="text-xs mb-1">Juara 3</Badge>
              <h3 className="font-bold text-sm truncate w-full">{sortedStudents[2].name}</h3>
              <p className="font-mono text-xl font-extrabold text-amber-800 dark:text-amber-500 mt-2">
                {sortedStudents[2].point || 0} <span className="text-xs font-normal">Poin</span>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leaderboard Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daftar Lengkap Peringkat Siswa</CardTitle>
          <CardDescription>Peringkat urut dari perolehan poin terbanyak</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-16 text-center font-bold">Peringkat</TableHead>
                  <TableHead className="font-bold">Nama Siswa</TableHead>
                  <TableHead className="font-bold">NIS</TableHead>
                  <TableHead className="font-bold text-center">Gender</TableHead>
                  <TableHead className="w-32 text-center font-bold">Total Poin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Belum ada siswa di kelas ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedStudents.map((s, idx) => (
                    <TableRow key={s.id.toString()} className="hover:bg-muted/30">
                      <TableCell className="text-center font-bold">
                        {idx === 0 ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs">1</span>
                        ) : idx === 1 ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-400 text-white text-xs">2</span>
                        ) : idx === 2 ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-white text-xs">3</span>
                        ) : (
                          idx + 1
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">{s.name}</TableCell>
                      <TableCell className="font-mono text-xs">{s.nis || "-"}</TableCell>
                      <TableCell className="text-center">{s.gender === "L" ? "L" : "P"}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-block rounded-full bg-amber-100 px-3 py-1 font-mono text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {s.point || "0"} Poin
                        </span>
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
