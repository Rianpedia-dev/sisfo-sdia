import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
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

export default async function SiswaViolationsPage() {
  const session = await getSession();
  if (!session || session.role !== "siswa") {
    redirect("/login");
  }

  let violations: any[] = [];
  try {
    violations = await prisma.pelanggaran.findMany({
      where: { user_id: session.id },
      orderBy: { created_at: "desc" },
    });
  } catch (e) {
    console.warn("DB error in violations, returning empty list:", e);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Pelanggaran Kedisiplinan</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Catatan kedisiplinan dan tata tertib yang dicatat oleh dewan guru untuk bahan evaluasi diri.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Catatan Pelanggaran Pribadi</CardTitle>
            <Badge variant="outline" className="font-mono text-xs">
              Total: {violations.length} Catatan
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
                  <TableHead className="font-bold">Kategori</TableHead>
                  <TableHead className="font-bold">Deskripsi Pelanggaran</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {violations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Alhamdulillah, tidak ada catatan pelanggaran tata tertib atas nama Anda. Pertahankan!
                    </TableCell>
                  </TableRow>
                ) : (
                  violations.map((vl, idx) => (
                    <TableRow key={vl.id.toString()} className="hover:bg-muted/30">
                      <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{formatDateIndo(vl.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-normal text-xs">
                          {vl.kategori}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{vl.keterangan}</TableCell>
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
