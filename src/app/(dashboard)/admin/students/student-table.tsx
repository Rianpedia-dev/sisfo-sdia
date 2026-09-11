"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  FileSpreadsheet,
  Trash2,
  CheckCircle,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";
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
import {
  createUserAction,
  deleteUserAction,
  verifyUserAction,
  importStudentsAction,
} from "@/actions/admin";
import { toast } from "sonner";
import { UserItem } from "@/types";

interface StudentTableProps {
  initialStudents: UserItem[];
  classList: string[];
}

export function StudentTable({ initialStudents, classList }: StudentTableProps) {
  const [students, setStudents] = useState<UserItem[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered & Paginated
  const filtered = students.filter((s) => {
    const matchName = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchClass = selectedClassFilter ? s.kelas === selectedClassFilter : true;
    return matchName && matchClass;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Actions
  const handleVerify = async (id: string) => {
    const res = await verifyUserAction(id, "1");
    if (res.success) {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "1" } : s))
      );
      toast.success(res.message);
    } else {
      toast.error("Gagal memverifikasi siswa");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const res = await deleteUserAction(deleteTarget.id);
      if (res.success) {
        setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        toast.success(res.message);
      } else {
        toast.error("Gagal menghapus siswa");
      }
    } finally {
      setIsSubmitting(false);
      setDeleteTarget(null);
    }
  };

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("role", "1"); // Siswa

    try {
      const res = await createUserAction(formData);
      if (res.success) {
        toast.success(res.message);
        setOpenAddModal(false);
        window.location.reload();
      } else {
        toast.error(res.error || "Gagal menambahkan siswa");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportExcel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.currentTarget.elements.namedItem("excelFile") as HTMLInputElement);
    const file = input?.files?.[0];
    if (!file) {
      toast.error("Pilih file Excel terlebih dahulu");
      return;
    }

    setIsSubmitting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const base64 = (evt.target?.result as string).split(",")[1];
        const res = await importStudentsAction(base64);
        if (res.success) {
          toast.success(res.message);
          setOpenImportModal(false);
          window.location.reload();
        } else {
          toast.error(res.error || "Gagal mengimpor data");
        }
      } catch {
        toast.error("Format file tidak didukung");
      } finally {
        setIsSubmitting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* Top action toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <select
            value={selectedClassFilter}
            onChange={(e) => {
              setSelectedClassFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-xs"
          >
            <option value="">Semua Kelas</option>
            {classList.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setOpenImportModal(true)}
            className="gap-1.5 text-xs sm:text-sm"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Import Excel</span>
          </Button>
          <Button
            onClick={() => setOpenAddModal(true)}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm"
          >
            <UserPlus className="h-4 w-4" />
            <span>Tambah Siswa</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-12 text-center font-bold">No</TableHead>
              <TableHead className="font-bold">Nama Siswa</TableHead>
              <TableHead className="font-bold">Kelas</TableHead>
              <TableHead className="font-bold">Email</TableHead>
              <TableHead className="font-bold">Apple ID</TableHead>
              <TableHead className="font-bold text-center">Status</TableHead>
              <TableHead className="w-36 text-center font-bold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Tidak ada data siswa yang cocok.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((s, idx) => (
                <TableRow key={s.id} className="hover:bg-muted/30">
                  <TableCell className="text-center font-medium">
                    {(page - 1) * pageSize + idx + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-foreground">{s.name}</div>
                    {s.nis && <div className="text-xs text-muted-foreground">NIS: {s.nis}</div>}
                  </TableCell>
                  <TableCell>
                    {s.kelas ? (
                      <Badge variant="secondary" className="font-normal text-xs">
                        {s.kelas}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Belum diatur</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-mono">{s.email}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {s.appleid || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {s.status === "1" ? (
                      <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/30">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-rose-500/15 text-rose-700 border-rose-500/30">
                        Non-Aktif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/admin/students/${s.id}`}>
                        <Button variant="ghost" size="icon-sm" className="h-8 w-8" title="Detail Siswa">
                          <Eye className="h-4 w-4 text-sky-600" />
                        </Button>
                      </Link>
                      {s.status === "0" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                          title="Verifikasi Siswa"
                          onClick={() => handleVerify(s.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 text-rose-500 hover:bg-rose-50"
                        title="Hapus Siswa"
                        onClick={() => setDeleteTarget(s)}
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
          Menampilkan {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)} dari {filtered.length} siswa
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

      {/* Modal Tambah Siswa */}
      <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Data Siswa Baru</DialogTitle>
            <DialogDescription>
              Isi data formulir untuk membuat akun siswa baru.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStudent} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" name="name" placeholder="Nama siswa" required />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="nis">NIS (Opsional)</Label>
                <Input id="nis" name="nis" placeholder="2024..." />
              </div>
              <div className="space-y-1">
                <Label htmlFor="gender">Jenis Kelamin</Label>
                <select
                  name="gender"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="kelas">Kelas</Label>
              <select
                name="kelas"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
              >
                <option value="">-- Pilih Kelas --</option>
                {classList.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="email">Email Login</Label>
                <Input id="email" name="email" type="email" placeholder="siswa@gmail.com" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="appleid">Apple ID (Opsional)</Label>
                <Input id="appleid" name="appleid" placeholder="apple@icloud.com" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="passwordappleid">Password Apple ID</Label>
                <Input id="passwordappleid" name="passwordappleid" type="password" placeholder="••••••••" />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setOpenAddModal(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {isSubmitting ? "Menyimpan..." : "Simpan Siswa"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Import Excel */}
      <Dialog open={openImportModal} onOpenChange={setOpenImportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Data Siswa dari Excel</DialogTitle>
            <DialogDescription>
              Upload file .xlsx dengan format kolom: Email, Password, Password Plain, Nama, Apple ID, Password Apple ID, Status, Gender.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleImportExcel} className="space-y-4">
            <div className="rounded-lg border-2 border-dashed p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <Label htmlFor="excelFile" className="cursor-pointer font-medium text-emerald-600 hover:underline">
                Pilih file Excel (.xlsx)
              </Label>
              <Input
                id="excelFile"
                name="excelFile"
                type="file"
                accept=".xlsx, .xls"
                className="mt-2"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenImportModal(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {isSubmitting ? "Mengimpor..." : "Mulai Import"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi Hapus */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Siswa</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus akun siswa <strong>{deleteTarget?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? "Menghapus..." : "Hapus Akun"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
