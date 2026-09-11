import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ArrowLeft, History, Check, X, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateIndo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SiswaPrayerHistoryPage() {
  const session = await getSession();
  if (!session || session.role !== "siswa") {
    redirect("/login");
  }

  let prayerHistory: any[] = [];
  try {
    const isNum = /^\d+$/.test(session.id);
    if (isNum) {
      prayerHistory = await prisma.prayer.findMany({
        where: { id: parseInt(session.id, 10) },
        orderBy: { date: "desc" },
        take: 30,
      });
    }
  } catch (e) {
    console.error("Database query error in prayer history:", e);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/siswa/prayers"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Form Sholat Hari Ini
        </Link>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <History className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Checklist Ibadah Sholat</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Catatan rekapitulasi sholat harian 6 waktu beserta status pengesahan dari guru wali kelas.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daftar Kehadiran Sholat</CardTitle>
          <CardDescription>Urut berdasarkan tanggal terbaru</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12 text-center font-bold">No</TableHead>
                  <TableHead className="font-bold">Hari, Tanggal</TableHead>
                  <TableHead className="text-center font-bold">Subuh</TableHead>
                  <TableHead className="text-center font-bold">Dhuha</TableHead>
                  <TableHead className="text-center font-bold">Dzuhur</TableHead>
                  <TableHead className="text-center font-bold">Ashar</TableHead>
                  <TableHead className="text-center font-bold">Maghrib</TableHead>
                  <TableHead className="text-center font-bold">Isya</TableHead>
                  <TableHead className="text-center font-bold w-36">Verifikasi Guru</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prayerHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Belum ada riwayat checklist sholat yang tersimpan.
                    </TableCell>
                  </TableRow>
                ) : (
                  prayerHistory.map((pr, idx) => {
                    const isVerified = pr.verified_guru === "verified";
                    return (
                      <TableRow key={pr.date} className="hover:bg-muted/30">
                        <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                        <TableCell className="font-semibold text-xs text-foreground">
                          {formatDateIndo(pr.date)}
                        </TableCell>
                        <TableCell className="text-center">
                          {pr.subuh === "1" ? (
                            <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {pr.dhuha === "1" ? (
                            <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {pr.dzuhur === "1" ? (
                            <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {pr.ashar === "1" ? (
                            <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {pr.maghrib === "1" ? (
                            <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {pr.isya === "1" ? (
                            <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isVerified ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-[10px]">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground text-[10px]">
                              Menunggu
                            </Badge>
                          )}
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
