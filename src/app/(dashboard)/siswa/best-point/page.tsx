import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Trophy, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeaderboardPodium } from "@/components/ui/leaderboard-podium";
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

      {/* Top 3 Podium Highlights */}
      {sorted.length > 0 && (
        <div className="py-4 sm:py-6">
          <div className="text-center mb-6 sm:mb-8 space-y-1">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-1">
              <Crown className="h-5 w-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Podium Peringkat Teratas</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              3 siswa peraih poin keaktifan tertinggi di kelas {studentClass}
            </p>
          </div>

          <div className="flex justify-center px-2">
            <LeaderboardPodium
              rankings={sorted.slice(0, 3).map((s, idx) => ({
                userId: s.id.toString(),
                userName: s.name,
                rank: idx + 1,
                value: parseInt(s.point || "0", 10) || 0,
                avatarUrl: s.image || undefined,
              }))}
              size="lg"
              medalStyle="modern"
              valueSuffix="Poin"
            />
          </div>
        </div>
      )}

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
