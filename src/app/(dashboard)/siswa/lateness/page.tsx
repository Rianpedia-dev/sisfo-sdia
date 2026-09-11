import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Clock } from "lucide-react";
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
import { formatDateIndo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SiswaLatenessPage() {
  const session = await getSession();
  if (!session || session.role !== "siswa") {
    redirect("/login");
  }

  let latenessList: any[] = [];
  try {
    const isNum = /^\d+$/.test(session.id);
    if (isNum) {
      latenessList = await prisma.keterlambatan.findMany({
        where: { user_id: BigInt(session.id) },
        orderBy: { created_at: "desc" },
      });
    }
  } catch (e) {
    console.warn("DB error in lateness, returning empty list:", e);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold tracking-tight">Data Keterlambatan Hadir</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Catatan riwayat waktu hadir terlambat dan alasan yang dicatat oleh guru piket / wali kelas.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Daftar Keterlambatan Pribadi</CardTitle>
            <Badge variant="outline" className="font-mono text-xs">
              Total: {latenessList.length} Kali
            </Badge>
          </div>
          <CardDescription>Halaman ini bersifat hanya-lihat (view-only).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12 text-center font-bold">No</TableHead>
                  <TableHead className="font-bold">Tanggal</TableHead>
                  <TableHead className="font-bold">Waktu Hadir</TableHead>
                  <TableHead className="font-bold">Alasan Keterlambatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latenessList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Masya Allah, Anda selalu hadir tepat waktu di sekolah! Tidak ada catatan terlambat.
                    </TableCell>
                  </TableRow>
                ) : (
                  latenessList.map((lt, idx) => (
                    <TableRow key={lt.id.toString()} className="hover:bg-muted/30">
                      <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{formatDateIndo(lt.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs text-amber-800 bg-amber-50 border-amber-300 dark:bg-amber-950 dark:text-amber-300">
                          {lt.waktu}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{lt.keterangan}</TableCell>
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
