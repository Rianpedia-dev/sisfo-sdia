"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Plus, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createClassAction, deleteClassAction } from "@/actions/admin";
import { toast } from "sonner";
import { KelasItem } from "@/types";

interface ClassTableProps {
  initialClasses: KelasItem[];
  teachersList: string[];
}

export function ClassTable({ initialClasses, teachersList }: ClassTableProps) {
  const [classes, setClasses] = useState<KelasItem[]>(initialClasses);
  const [search, setSearch] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<KelasItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = classes.filter((c) =>
    c.nama_kelas.toLowerCase().includes(search.toLowerCase()) ||
    (c.wali_kelas || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleAddClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await createClassAction(formData);
      if (res.success) {
        toast.success(res.message);
        setOpenAddModal(false);
        window.location.reload();
      } else {
        toast.error(res.error || "Gagal membuat kelas");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const res = await deleteClassAction(deleteTarget.id);
      if (res.success) {
        setClasses((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        toast.success(res.message);
      } else {
        toast.error("Gagal menghapus kelas");
      }
    } finally {
      setIsSubmitting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama kelas atau wali..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        <Button
          onClick={() => setOpenAddModal(true)}
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="h-4 w-4" /> Tambah Kelas Baru
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-12 text-center font-bold">No</TableHead>
              <TableHead className="font-bold">Nama Kelas</TableHead>
              <TableHead className="font-bold">Wali Kelas</TableHead>
              <TableHead className="font-bold text-center">Kapasitas / Siswa</TableHead>
              <TableHead className="font-bold">Code Restrict iPad</TableHead>
              <TableHead className="w-28 text-center font-bold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Tidak ada data kelas ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((c, idx) => (
                <TableRow key={c.id} className="hover:bg-muted/30">
                  <TableCell className="text-center font-medium">
                    {(page - 1) * pageSize + idx + 1}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-foreground">{c.nama_kelas}</span>
                  </TableCell>
                  <TableCell>
                    {c.wali_kelas ? (
                      <span className="font-medium text-sm text-foreground">{c.wali_kelas}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Belum ditentukan</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-mono text-xs">
                      {c.jumlah_siswa || "0"} Siswa
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {c.code_restrict || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/admin/classes/${c.id}`}>
                        <Button variant="ghost" size="icon-sm" className="h-8 w-8" title="Detail Siswa Kelas">
                          <Eye className="h-4 w-4 text-sky-600" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 text-rose-500 hover:bg-rose-50"
                        title="Hapus Kelas"
                        onClick={() => setDeleteTarget(c)}
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
          Halaman {page} dari {totalPages} ({filtered.length} total kelas)
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

      {/* Modal Tambah Kelas */}
      <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Data Kelas Baru</DialogTitle>
            <DialogDescription>
              Buat rombongan belajar baru untuk tahun ajaran aktif.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddClass} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="nama_kelas">Nama Kelas</Label>
              <Input
                id="nama_kelas"
                name="nama_kelas"
                placeholder="Contoh: Kelas 4 - Sholahuddin Al Ayubi"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="wali_kelas">Wali Kelas (Opsional)</Label>
              <select
                id="wali_kelas"
                name="wali_kelas"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
              >
                <option value="">-- Pilih Guru Wali Kelas --</option>
                {teachersList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="jumlah_siswa">Perkiraan Siswa</Label>
                <Input id="jumlah_siswa" name="jumlah_siswa" placeholder="28" type="number" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="code_restrict">Code Restrict iPad</Label>
                <Input id="code_restrict" name="code_restrict" placeholder="2739" />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpenAddModal(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan Kelas"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Hapus */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Data Kelas</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kelas <strong>{deleteTarget?.nama_kelas}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? "Menghapus..." : "Hapus Kelas"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
