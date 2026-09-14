"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  UserMinus,
  Trophy,
  Check,
  X,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getUserProfileImage, getDefaultProfileImage } from "@/lib/utils";
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
  enrollStudentAction,
  removeStudentsAction,
  addPointAction,
  subtractPointAction,
  verifyPrayerAction,
} from "@/actions/guru";
import { toast } from "sonner";
import { UserItem, PrayerItem } from "@/types";

interface StudentRow extends UserItem {
  prayerToday?: PrayerItem | null;
}

interface MyClassTableProps {
  students: StudentRow[];
  availableStudents: UserItem[];
  guruClass: string;
}

export function MyClassTable({ students, availableStudents, guruClass }: MyClassTableProps) {
  const [data, setData] = useState<StudentRow[]>(students);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [openEnrollModal, setOpenEnrollModal] = useState(false);
  const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState("");
  const [pointModalStudent, setPointModalStudent] = useState<StudentRow | null>(null);
  const [pointAmount, setPointAmount] = useState<number>(5);
  const [profileModalStudent, setProfileModalStudent] = useState<StudentRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = data.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.nis || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Multi-select handling
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginated.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map((s) => s.id));
    }
  };

  // Bulk remove from class
  const handleBulkRemove = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await removeStudentsAction(selectedIds);
      if (res.success) {
        setData((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
        setSelectedIds([]);
        toast.success(res.message);
      } else {
        toast.error("Gagal mengeluarkan siswa");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enroll student
  const handleEnroll = async () => {
    if (!selectedStudentToEnroll) return;
    setIsSubmitting(true);
    try {
      const res = await enrollStudentAction(selectedStudentToEnroll, guruClass);
      if (res.success) {
        toast.success(res.message);
        setOpenEnrollModal(false);
        window.location.reload();
      } else {
        toast.error("Gagal mendaftarkan siswa");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Point action
  const handleAddPoint = async () => {
    if (!pointModalStudent) return;
    setIsSubmitting(true);
    try {
      const res = await addPointAction(pointModalStudent.id, pointAmount);
      if (res.success) {
        setData((prev) =>
          prev.map((s) =>
            s.id === pointModalStudent.id ? { ...s, point: String(res.newPoint) } : s
          )
        );
        toast.success(res.message);
        setPointModalStudent(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubtractPoint = async () => {
    if (!pointModalStudent) return;
    setIsSubmitting(true);
    try {
      const res = await subtractPointAction(pointModalStudent.id, pointAmount);
      if (res.success) {
        setData((prev) =>
          prev.map((s) =>
            s.id === pointModalStudent.id ? { ...s, point: String(res.newPoint) } : s
          )
        );
        toast.success(res.message);
        setPointModalStudent(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify prayer today
  const handleVerifyPrayer = async (studentId: string) => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const res = await verifyPrayerAction(studentId, todayStr);
    if (res.success) {
      toast.success(res.message);
      if (profileModalStudent && profileModalStudent.id === studentId) {
        setProfileModalStudent({
          ...profileModalStudent,
          prayerToday: {
            id: studentId,
            date: todayStr,
            verified_guru: "verified",
          },
        });
      }
    } else {
      toast.error("Gagal memverifikasi sholat");
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari siswa atau NIS..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkRemove}
              disabled={isSubmitting}
              className="gap-1.5 text-xs flex-1 sm:flex-none cursor-pointer"
            >
              <UserMinus className="h-4 w-4" />
              <span>Keluarkan ({selectedIds.length})</span>
            </Button>
          )}

          <Button
            onClick={() => setOpenEnrollModal(true)}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm flex-1 sm:flex-none cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Tambah Siswa</span>
          </Button>
        </div>
      </div>

      {/* Desktop & Tablet Table */}
      <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === paginated.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
              </TableHead>
              <TableHead className="w-12 text-center font-bold">No</TableHead>
              <TableHead className="font-bold">Nama Lengkap</TableHead>
              <TableHead className="font-bold">NIS</TableHead>
              <TableHead className="font-bold text-center">L/P</TableHead>
              <TableHead className="font-bold text-center">Sholat Hari Ini</TableHead>
              <TableHead className="font-bold text-center">Poin</TableHead>
              <TableHead className="w-36 text-center font-bold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Belum ada siswa di kelas {guruClass}. Klik tombol &quot;Tambah Siswa ke Kelas&quot; untuk mendaftarkan siswa.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((s, idx) => {
                const pt = s.prayerToday;
                const isSelected = selectedIds.includes(s.id);
                return (
                  <TableRow key={s.id} className={isSelected ? "bg-muted/60" : "hover:bg-muted/30"}>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(s.id)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {(page - 1) * pageSize + idx + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full overflow-hidden border border-border shrink-0 bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getUserProfileImage(s.image, s.gender)}
                            alt={s.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = getDefaultProfileImage(s.gender);
                            }}
                          />
                        </div>
                        <span className="font-semibold text-foreground">{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{s.nis || "-"}</TableCell>
                    <TableCell className="text-center font-medium">{s.gender || "-"}</TableCell>
                    {/* Status Sholat 6 waktu per PRD 7.3.3 */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-[10px]">
                        <span title="Subuh" className={`inline-flex h-5 w-5 items-center justify-center rounded-full font-bold ${pt?.subuh === "1" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>S</span>
                        <span title="Dhuha" className={`inline-flex h-5 w-5 items-center justify-center rounded-full font-bold ${pt?.dhuha === "1" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>Dh</span>
                        <span title="Dzuhur" className={`inline-flex h-5 w-5 items-center justify-center rounded-full font-bold ${pt?.dzuhur === "1" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>Dz</span>
                        <span title="Ashar" className={`inline-flex h-5 w-5 items-center justify-center rounded-full font-bold ${pt?.ashar === "1" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>A</span>
                        <span title="Maghrib" className={`inline-flex h-5 w-5 items-center justify-center rounded-full font-bold ${pt?.maghrib === "1" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>M</span>
                        <span title="Isya" className={`inline-flex h-5 w-5 items-center justify-center rounded-full font-bold ${pt?.isya === "1" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>I</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono text-xs bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300">
                        {s.point || "0"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Quick View / Checklist sholat */}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                          title="Info Singkat & Sholat"
                          onClick={() => setProfileModalStudent(s)}
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </Button>
                        {/* Point Reward Modal */}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-8 w-8 text-amber-600 hover:bg-amber-50 cursor-pointer"
                          title="Kelola Poin Siswa"
                          onClick={() => setPointModalStudent(s)}
                        >
                          <Trophy className="h-4 w-4" />
                        </Button>
                        {/* Full Detail Link */}
                        <Link href={`/guru/my-class/${s.id}`}>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-8 w-8 text-sky-600 hover:bg-sky-50 cursor-pointer"
                            title="Detail Lengkap & Catatan"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Student Cards View (Touch-Friendly without horizontal scroll) */}
      <div className="block md:hidden space-y-3">
        {paginated.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-xs text-muted-foreground">
            Belum ada siswa di kelas {guruClass}. Klik tombol &quot;Tambah Siswa ke Kelas&quot;.
          </div>
        ) : (
          paginated.map((s, idx) => {
            const pt = s.prayerToday;
            const isSelected = selectedIds.includes(s.id);

            return (
              <div
                key={`m-card-${s.id}`}
                className={`rounded-2xl border p-4 transition-all ${
                  isSelected ? "border-emerald-500 bg-emerald-50/20" : "bg-card border-border shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(s.id)}
                      className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{s.name}</span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                          {s.gender === "L" ? "L" : "P"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">NIS: {s.nis || "-"}</p>
                    </div>
                  </div>

                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 font-mono text-xs">
                    {s.point || "0"} Poin
                  </Badge>
                </div>

                {/* Sholat Indicator Strip */}
                <div className="mt-3 pt-2.5 border-t flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Sholat Hari Ini:</span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span title="Subuh" className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-bold ${pt?.subuh === "1" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>S</span>
                    <span title="Dhuha" className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-bold ${pt?.dhuha === "1" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>Dh</span>
                    <span title="Dzuhur" className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-bold ${pt?.dzuhur === "1" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>Dz</span>
                    <span title="Ashar" className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-bold ${pt?.ashar === "1" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>A</span>
                    <span title="Maghrib" className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-bold ${pt?.maghrib === "1" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>M</span>
                    <span title="Isya" className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-bold ${pt?.isya === "1" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>I</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 pt-2.5 border-t grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1 h-9 cursor-pointer"
                    onClick={() => setProfileModalStudent(s)}
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Sholat</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1 h-9 cursor-pointer"
                    onClick={() => setPointModalStudent(s)}
                  >
                    <Trophy className="h-3.5 w-3.5 text-amber-600" />
                    <span>Poin</span>
                  </Button>
                  <Link href={`/guru/my-class/${s.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1 h-9 w-full cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-sky-600" />
                      <span>Detail</span>
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 text-xs text-muted-foreground">
        <div className="text-center sm:text-left">
          Halaman {page} dari {totalPages} ({filtered.length} siswa)
        </div>
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-8 gap-1 cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="h-8 gap-1 cursor-pointer"
          >
            Berikutnya <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Modal Tambah Murid ke Kelas */}
      <Dialog open={openEnrollModal} onOpenChange={setOpenEnrollModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Daftarkan Siswa ke {guruClass}</DialogTitle>
            <DialogDescription>
              Pilih siswa aktif yang belum memiliki rombel untuk dimasukkan ke kelas Anda.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="studentSelect">Pilih Siswa</Label>
            <select
              id="studentSelect"
              value={selectedStudentToEnroll}
              onChange={(e) => setSelectedStudentToEnroll(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            >
              <option value="">-- Pilih Siswa --</option>
              {availableStudents.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.email}) {st.kelas ? `- Saat ini: ${st.kelas}` : ""}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEnrollModal(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button onClick={handleEnroll} disabled={isSubmitting || !selectedStudentToEnroll}>
              {isSubmitting ? "Mendaftarkan..." : "Daftarkan Siswa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Kelola Poin */}
      <Dialog open={!!pointModalStudent} onOpenChange={(open) => !open && setPointModalStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span>Kelola Poin Siswa</span>
            </DialogTitle>
            <DialogDescription>
              Siswa: <strong>{pointModalStudent?.name}</strong> • Poin saat ini:{" "}
              <strong>{pointModalStudent?.point || 0}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Jumlah Poin yang Diberikan / Dikurangi</Label>
            <div className="flex items-center gap-2">
              {[5, 10, 20, 50].map((val) => (
                <Button
                  key={val}
                  type="button"
                  variant={pointAmount === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPointAmount(val)}
                  className={pointAmount === val ? "bg-amber-600 text-white" : ""}
                >
                  +{val}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              value={pointAmount}
              onChange={(e) => setPointAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="mt-2"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="destructive"
              onClick={handleSubtractPoint}
              disabled={isSubmitting}
              className="gap-1"
            >
              <Minus className="h-4 w-4" /> Kurangi {pointAmount}
            </Button>
            <Button
              onClick={handleAddPoint}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
            >
              <Plus className="h-4 w-4" /> Tambah +{pointAmount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Profil Singkat & Verifikasi Sholat */}
      <Dialog open={!!profileModalStudent} onOpenChange={(open) => !open && setProfileModalStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full overflow-hidden border border-border shrink-0 bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getUserProfileImage(profileModalStudent?.image, profileModalStudent?.gender)}
                  alt={profileModalStudent?.name || "Siswa"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = getDefaultProfileImage(profileModalStudent?.gender);
                  }}
                />
              </div>
              <div>
                <DialogTitle>{profileModalStudent?.name}</DialogTitle>
                <DialogDescription>
                  {profileModalStudent?.gender === "L" ? "Laki-laki" : "Perempuan"} • NIS: {profileModalStudent?.nis || "-"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {profileModalStudent && (
            <div className="space-y-4 py-2 text-sm">
              <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-xs">
                <p><strong>NIS:</strong> {profileModalStudent.nis || "-"}</p>
                <p><strong>Email:</strong> {profileModalStudent.email}</p>
                <p><strong>Alamat:</strong> {profileModalStudent.address || "-"}</p>
                <p><strong>Keterampilan:</strong> {profileModalStudent.skills || "-"}</p>
              </div>

              {/* Status Sholat Hari Ini */}
              <div>
                <p className="font-semibold text-xs mb-2">Checklist Sholat Hari Ini:</p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {[
                    { label: "Subuh", done: profileModalStudent.prayerToday?.subuh === "1" },
                    { label: "Dhuha", done: profileModalStudent.prayerToday?.dhuha === "1" },
                    { label: "Dzuhur", done: profileModalStudent.prayerToday?.dzuhur === "1" },
                    { label: "Ashar", done: profileModalStudent.prayerToday?.ashar === "1" },
                    { label: "Maghrib", done: profileModalStudent.prayerToday?.maghrib === "1" },
                    { label: "Isya", done: profileModalStudent.prayerToday?.isya === "1" },
                  ].map((sh) => (
                    <div
                      key={sh.label}
                      className={`flex items-center justify-between rounded-md border p-2 ${sh.done ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-muted/30 text-muted-foreground"}`}
                    >
                      <span>{sh.label}</span>
                      {sh.done ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <X className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-xs text-muted-foreground">
                  Status Verifikasi:{" "}
                  <strong>{profileModalStudent.prayerToday?.verified_guru === "verified" ? "Sudah Diverifikasi" : "Belum Diverifikasi"}</strong>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => handleVerifyPrayer(profileModalStudent.id)}
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Verifikasi Sholat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
