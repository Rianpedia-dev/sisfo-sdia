"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Trash2, CheckCircle2, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createAttendanceAction, deleteAttendanceAction } from "@/actions/guru";
import { toast } from "sonner";
import { UserItem } from "@/types";
import { cn } from "@/lib/utils";

interface StudentAttendanceRecord {
  user: UserItem;
  keterangan: "Hadir" | "Sakit" | "Izin" | "Alpha" | string;
}

interface DailyAttendanceFormProps {
  dateStr: string;
  guruClass: string;
  initialRecords: StudentAttendanceRecord[];
  isAlreadyFilled: boolean;
}

export function DailyAttendanceForm({
  dateStr,
  guruClass,
  initialRecords,
  isAlreadyFilled,
}: DailyAttendanceFormProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    initialRecords.forEach((r) => {
      map[r.user.id] = r.keterangan || "Hadir";
    });
    return map;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusChange = (userId: string, status: string) => {
    setRecords((prev) => ({
      ...prev,
      [userId]: status,
    }));
  };

  const handleSetAll = (status: string) => {
    const updated: Record<string, string> = {};
    initialRecords.forEach((r) => {
      updated[r.user.id] = status;
    });
    setRecords(updated);
    toast.info(`Semua siswa diatur ke: ${status}`);
  };

  const countHadir = Object.values(records).filter((v) => v === "Hadir").length;
  const countSakit = Object.values(records).filter((v) => v === "Sakit").length;
  const countIzin = Object.values(records).filter((v) => v === "Izin").length;
  const countAlpha = Object.values(records).filter((v) => v === "Alpha").length;

  const filteredRecords = initialRecords.filter((item) =>
    item.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.user.nis || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = Object.entries(records).map(([userId, keterangan]) => ({
      userId,
      keterangan,
    }));

    try {
      const res = await createAttendanceAction(dateStr, guruClass, payload);
      if (res.success) {
        toast.success(res.message);
        router.push(`/guru/attendance/table/${dateStr}`);
      } else {
        toast.error("Gagal menyimpan absensi.");
      }
    } catch {
      toast.error("Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDate = async () => {
    if (!confirm(`Hapus seluruh data presensi tanggal ${dateStr}?`)) return;
    setIsSubmitting(true);
    try {
      const res = await deleteAttendanceAction(dateStr, guruClass);
      if (res.success) {
        toast.success(res.message);
        router.push("/guru/attendance");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pb-8 sm:pb-12">
      {/* Quick Action & Live Count Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-muted/30 p-3.5 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Pintasan:</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSetAll("Hadir")}
              className="h-8 text-xs bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 font-medium cursor-pointer"
            >
              Semua Hadir
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSetAll("Izin")}
              className="h-8 text-xs font-medium cursor-pointer"
            >
              Semua Izin
            </Button>
          </div>

          {/* Real-time Summary Pills */}
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Badge className="bg-emerald-600 font-mono text-[11px] px-2 py-0.5">{countHadir} Hadir</Badge>
            <Badge className="bg-sky-600 font-mono text-[11px] px-2 py-0.5">{countSakit} Sakit</Badge>
            <Badge className="bg-amber-500 font-mono text-[11px] px-2 py-0.5">{countIzin} Izin</Badge>
            <Badge className="bg-rose-600 font-mono text-[11px] px-2 py-0.5">{countAlpha} Alpha</Badge>
          </div>
        </div>

        {/* Filter Input + Delete Option */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-border/60">
          <input
            type="text"
            placeholder="Cari nama siswa di kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full sm:max-w-xs rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />

          {isAlreadyFilled && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteDate}
              disabled={isSubmitting}
              className="gap-1 text-xs w-full sm:w-auto cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Hapus Data Tanggal Ini
            </Button>
          )}
        </div>
      </div>

      {/* Roster Attendance Table */}
      <div className="space-y-3">
        {initialRecords.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center space-y-3">
            <p className="text-sm font-semibold text-foreground">Belum ada siswa di kelas {guruClass || "ini"}</p>
            <p className="text-xs text-muted-foreground">
              Silakan masukkan siswa ke kelas ini terlebih dahulu melalui menu Kelas Saya.
            </p>
            <div>
              <Link href="/guru/my-class">
                <Button size="sm" className="mt-2">
                  Buka Kelola Kelas
                </Button>
              </Link>
            </div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-xs text-muted-foreground">
            Tidak ada siswa dengan nama &quot;{searchQuery}&quot;.
          </div>
        ) : (
          filteredRecords.map((item, idx) => {
          const u = item.user;
          const currentKet = records[u.id] || "Hadir";

          return (
            <Card key={u.id} className="overflow-hidden border transition-all hover:border-emerald-500/40">
              <CardContent className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-xs text-muted-foreground">
                    {idx + 1}
                  </span>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-sm text-foreground truncate">{u.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      NIS: {u.nis || "-"} • {u.gender === "L" ? "Laki-laki" : "Perempuan"}
                    </p>
                  </div>
                </div>

                {/* Status Options: Hadir, Sakit, Izin, Alpha */}
                <div className="grid grid-cols-4 gap-1.5 sm:flex sm:items-center sm:gap-2">
                  {[
                    { key: "Hadir", label: "Hadir", active: "bg-emerald-600 text-white border-emerald-600 shadow-sm" },
                    { key: "Sakit", label: "Sakit", active: "bg-sky-600 text-white border-sky-600 shadow-sm" },
                    { key: "Izin", label: "Izin", active: "bg-amber-500 text-white border-amber-500 shadow-sm" },
                    { key: "Alpha", label: "Alpha", active: "bg-rose-600 text-white border-rose-600 shadow-sm" },
                  ].map((opt) => {
                    const isSelected = currentKet === opt.key;
                    return (
                      <label
                        key={opt.key}
                        className={cn(
                          "relative flex cursor-pointer items-center justify-center rounded-xl border px-2 py-2 sm:px-3 sm:py-1.5 text-xs font-semibold transition-all min-h-[40px] sm:min-h-[34px] select-none text-center",
                          isSelected
                            ? opt.active
                            : "bg-background text-muted-foreground hover:bg-muted/60 border-border"
                        )}
                      >
                        <input
                          type="radio"
                          name={`absen-${u.id}`}
                          value={opt.key}
                          checked={isSelected}
                          onChange={() => handleStatusChange(u.id, opt.key)}
                          className="sr-only"
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        }))}
      </div>

      {/* Action Footer */}
      <div className="sticky bottom-4 z-30 flex items-center justify-between gap-2 sm:gap-3 rounded-2xl border bg-background/95 p-3 sm:p-4 shadow-xl backdrop-blur-md">
        <div className="text-xs text-muted-foreground hidden sm:block">
          Total: <strong className="text-foreground">{initialRecords.length} Siswa</strong> ({countHadir} Hadir)
        </div>
        <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="cursor-pointer text-xs"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="min-w-[130px] sm:min-w-[150px]"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Menyimpan..." : "Simpan Presensi"}
          </Button>
        </div>
      </div>
    </form>
  );
}
