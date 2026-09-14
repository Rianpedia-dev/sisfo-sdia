import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LeaderboardPodium } from "@/components/ui/leaderboard-podium";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getUserProfileImage, getDefaultProfileImage } from "@/lib/utils";
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
        <h1 className="text-2xl font-bold tracking-tight">Leaderboard Poin Murid</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Peringkat keaktifan & reward siswa kelas {guruClass} berdasarkan akumulasi poin perilaku dan prestasi.
        </p>
      </div>

      {/* Top 3 Podium Highlights */}
      {sortedStudents.length > 0 && (
        <div className="py-4 sm:py-6">
          <div className="text-center mb-6 sm:mb-8 space-y-1">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-1">
              <Crown className="h-5 w-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Podium Peringkat Teratas</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Siswa teladan dengan perolehan poin keaktifan tertinggi kelas {guruClass}
            </p>
          </div>

          <div className="flex justify-center px-2">
            <LeaderboardPodium
              rankings={sortedStudents.slice(0, 3).map((s, idx) => ({
                userId: s.id.toString(),
                userName: s.name,
                rank: idx + 1,
                value: parseInt(s.point || "0", 10) || 0,
                avatarUrl: getUserProfileImage(s.image, s.gender),
                gender: s.gender,
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
                      <TableCell className="font-semibold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full overflow-hidden border border-border shrink-0 bg-muted">
                            <UserAvatar
                              src={s.image}
                              gender={s.gender}
                              alt={s.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span>{s.name}</span>
                        </div>
                      </TableCell>
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
