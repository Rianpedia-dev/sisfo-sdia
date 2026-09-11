import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Trophy, Crown, Medal, Award, User } from "lucide-react";
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

export default async function SiswaBestPointPage() {
  const session = await getSession();
  if (!session || session.role !== "siswa") {
    redirect("/login");
  }

  const studentClass = session.kelas || "";

  let classmates: any[] = [];

  try {
    classmates = studentClass
      ? await prisma.user.findMany({
          where: { kelas: studentClass, status: "1" },
        })
      : [];
  } catch (e) {
    console.error("Database query error in siswa best-point:", e);
  }

  // Sort descending by points
  const sorted = [...classmates].sort(
    (a, b) => (parseInt(b.point || "0", 10) || 0) - (parseInt(a.point || "0", 10) || 0)
  );

  const myRank = sorted.findIndex((s) => s.id.toString() === session.id) + 1;
  const myData = sorted.find((s) => s.id.toString() === session.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold tracking-tight">Leaderboard Poin Kelas</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Peringkat pengumpulan poin reward perilaku baik, keaktifan, dan kedisiplinan di kelas {studentClass}.
        </p>
      </div>

      {/* My Rank Card Highlight */}
      <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-background to-background shadow-md">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black text-xl shadow-md shadow-emerald-950/20">
              #{myRank || "-"}
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Peringkat Anda Saat Ini</p>
              <h2 className="text-xl font-bold text-foreground">{session.name}</h2>
              <p className="text-xs text-muted-foreground">Kelas {studentClass}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Akumulasi Poin</p>
              <p className="font-mono text-2xl font-black text-amber-600 dark:text-amber-400">
                {myData?.point || "0"} <span className="text-xs font-normal">Poin</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daftar Peringkat Siswa di Kelas</CardTitle>
          <CardDescription>Nama Anda disorot warna khusus</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-16 text-center font-bold">Peringkat</TableHead>
                  <TableHead className="font-bold">Nama Lengkap</TableHead>
                  <TableHead className="font-bold">NIS</TableHead>
                  <TableHead className="w-32 text-center font-bold">Total Poin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Belum ada siswa di kelas Anda.
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((s, idx) => {
                    const isMe = s.id.toString() === session.id;
                    return (
                      <TableRow
                        key={s.id.toString()}
                        className={`transition-colors ${
                          isMe
                            ? "bg-emerald-500/15 font-semibold text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500/30"
                            : "hover:bg-muted/30"
                        }`}
                      >
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
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{s.name}</span>
                            {isMe && (
                              <Badge className="bg-emerald-600 text-white text-[10px] py-0 px-1.5">
                                Anda
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{s.nis || "-"}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-block rounded-full bg-amber-100 px-3 py-0.5 font-mono text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            {s.point || "0"} Poin
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
