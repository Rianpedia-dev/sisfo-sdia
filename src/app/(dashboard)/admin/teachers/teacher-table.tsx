"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Eye, CheckCircle2, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { deleteUserAction, verifyUserAction } from "@/actions/admin";
import { toast } from "sonner";
import { UserItem } from "@/types";
import { getRoleLabel } from "@/lib/utils";

export function TeacherTable({ initialTeachers }: { initialTeachers: UserItem[] }) {
  const [teachers, setTeachers] = useState<UserItem[]>(initialTeachers);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Verification modal state
  const [verifyTarget, setVerifyTarget] = useState<UserItem | null>(null);
  const [verifyStatusChoice, setVerifyStatusChoice] = useState<string>("2"); // 2=guru, 4=wali
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleConfirmVerify = async () => {
    if (!verifyTarget) return;
    setIsSubmitting(true);
    try {
      const res = await verifyUserAction(verifyTarget.id, verifyStatusChoice);
      if (res.success) {
        setTeachers((prev) =>
          prev.map((t) =>
            t.id === verifyTarget.id ? { ...t, status: verifyStatusChoice } : t
          )
        );
        toast.success(res.message);
        setVerifyTarget(null);
      } else {
        toast.error("Gagal memverifikasi guru");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const res = await deleteUserAction(deleteTarget.id);
      if (res.success) {
        setTeachers((prev) => prev.filter((t) => t.id !== deleteTarget.id));
        toast.success(res.message);
      } else {
        toast.error("Gagal menghapus akun");
      }
    } finally {
      setIsSubmitting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama guru atau email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-12 text-center font-bold">No</TableHead>
              <TableHead className="font-bold">Nama Guru</TableHead>
              <TableHead className="font-bold">Bidang Studi / NIP</TableHead>
              <TableHead className="font-bold">Email</TableHead>
              <TableHead className="font-bold">Kelas Diampu</TableHead>
              <TableHead className="font-bold text-center">Status</TableHead>
              <TableHead className="w-32 text-center font-bold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Tidak ada data guru ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((t, idx) => (
                <TableRow key={t.id} className="hover:bg-muted/30">
                  <TableCell className="text-center font-medium">
                    {(page - 1) * pageSize + idx + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-foreground">{t.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{t.guru_bidang || "-"}</div>
                    {t.nip && <div className="text-xs text-muted-foreground">NIP: {t.nip}</div>}
                  </TableCell>
                  <TableCell className="text-sm font-mono">{t.email}</TableCell>
                  <TableCell>
                    {t.kelas ? (
                      <Badge variant="secondary" className="text-xs font-normal">
                        {t.kelas}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {t.status === "0" ? (
                      <Badge variant="destructive" className="bg-rose-500/15 text-rose-700 border-rose-500/30">
                        Pending Verifikasi
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">
                        {getRoleLabel(t.status)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/admin/teachers/${t.id}`}>
                        <Button variant="ghost" size="icon-sm" className="h-8 w-8" title="Detail Guru">
                          <Eye className="h-4 w-4 text-sky-600" />
                        </Button>
                      </Link>

                      {/* Modal Verifikasi button */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                        title="Verifikasi Akun Guru"
                        onClick={() => {
                          setVerifyTarget(t);
                          setVerifyStatusChoice(t.status === "4" ? "4" : "2");
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 text-rose-500 hover:bg-rose-50"
                        title="Hapus Akun"
                        onClick={() => setDeleteTarget(t)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
        <div>
          Halaman {page} dari {totalPages} ({filtered.length} total guru)
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-8 gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="h-8 gap-1"
          >
            Berikutnya <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Modal Verifikasi Status Guru */}
      <Dialog open={!!verifyTarget} onOpenChange={(open) => !open && setVerifyTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verifikasi & Set Status Guru</DialogTitle>
            <DialogDescription>
              Tentukan hak akses untuk <strong>{verifyTarget?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm font-medium">Pilih Peran Guru:</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/40">
                <input
                  type="radio"
                  name="statusOption"
                  value="2"
                  checked={verifyStatusChoice === "2"}
                  onChange={() => setVerifyStatusChoice("2")}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <p className="font-semibold text-sm">Guru Biasa (Status 2)</p>
                  <p className="text-xs text-muted-foreground">Guru pengajar mata pelajaran bidang studi.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/40">
                <input
                  type="radio"
                  name="statusOption"
                  value="4"
                  checked={verifyStatusChoice === "4"}
                  onChange={() => setVerifyStatusChoice("4")}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <p className="font-semibold text-sm">Guru + Wali Kelas (Status 4)</p>
                  <p className="text-xs text-muted-foreground">Memiliki akses kelola absensi kelas, poin reward, dan murid kelas.</p>
                </div>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyTarget(null)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button onClick={handleConfirmVerify} disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Verifikasi Akun"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Hapus */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Akun Guru</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus akun guru <strong>{deleteTarget?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
