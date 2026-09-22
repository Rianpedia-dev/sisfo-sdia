"use client";

import { useState, useMemo } from "react";
import { Trophy, Plus, Minus } from "lucide-react";
import { LeaderboardPodium } from "@/components/ui/leaderboard-podium";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getUserProfileImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { addPointAction, subtractPointAction } from "@/actions/guru";
import { toast } from "sonner";

export interface BestPointStudent {
  id: string;
  name: string;
  nis: string | null;
  gender: string | null;
  point: string | null;
  image: string | null;
  kelas: string | null;
}

interface GuruBestPointClientProps {
  initialStudents: BestPointStudent[];
  guruClass: string;
}

export function GuruBestPointClient({ initialStudents, guruClass }: GuruBestPointClientProps) {
  const [students, setStudents] = useState<BestPointStudent[]>(initialStudents);
  const [pointModalStudent, setPointModalStudent] = useState<BestPointStudent | null>(null);
  const [pointAmount, setPointAmount] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sort descending by point
  const sortedStudents = useMemo(() => {
    return [...students].sort(
      (a, b) => (parseInt(b.point || "0", 10) || 0) - (parseInt(a.point || "0", 10) || 0)
    );
  }, [students]);

  const handleAddPoint = async () => {
    if (!pointModalStudent) return;
    setIsSubmitting(true);
    try {
      const res = await addPointAction(pointModalStudent.id, pointAmount);
      if (res.success) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === pointModalStudent.id ? { ...s, point: String(res.newPoint) } : s
          )
        );
        toast.success(res.message);
        setPointModalStudent(null);
      } else {
        toast.error(res.error || "Gagal menambah poin");
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
        setStudents((prev) =>
          prev.map((s) =>
            s.id === pointModalStudent.id ? { ...s, point: String(res.newPoint) } : s
          )
        );
        toast.success(res.message);
        setPointModalStudent(null);
      } else {
        toast.error(res.error || "Gagal mengurangi poin");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const podiumRankings = sortedStudents.slice(0, 3).map((s, idx) => ({
    userId: s.id,
    userName: s.name,
    rank: idx + 1,
    value: parseInt(s.point || "0", 10) || 0,
    avatarUrl: getUserProfileImage(s.image, s.gender),
    gender: s.gender,
  }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leaderboard Poin Murid</h1>
      </div>

      {/* Top 3 Podium Highlights */}
      {sortedStudents.length > 0 && (
        <div className="py-4 sm:py-6">
          <div className="flex justify-center px-2">
            <LeaderboardPodium
              rankings={podiumRankings}
              size="lg"
              medalStyle="modern"
              valueSuffix="Poin"
            />
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-16 text-center font-bold">Peringkat</TableHead>
              <TableHead className="font-bold">Nama Siswa</TableHead>
              <TableHead className="font-bold">NIS</TableHead>
              <TableHead className="font-bold text-center">Gender</TableHead>
              <TableHead className="w-32 text-center font-bold">Total Poin</TableHead>
              <TableHead className="w-20 text-center font-bold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Belum ada siswa di kelas ini.
                </TableCell>
              </TableRow>
            ) : (
              sortedStudents.map((s, idx) => (
                <TableRow key={s.id} className="hover:bg-muted/30">
                  <TableCell className="text-center font-bold">
                    {idx === 0 ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs">
                        1
                      </span>
                    ) : idx === 1 ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-400 text-white text-xs">
                        2
                      </span>
                    ) : idx === 2 ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-white text-xs">
                        3
                      </span>
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
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 cursor-pointer"
                      title="Kelola Poin Siswa"
                      onClick={() => setPointModalStudent(s)}
                    >
                      <Trophy className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
              className="gap-1 cursor-pointer"
            >
              <Minus className="h-4 w-4" /> Kurangi {pointAmount}
            </Button>
            <Button
              onClick={handleAddPoint}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Tambah +{pointAmount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
