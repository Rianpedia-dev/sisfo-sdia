"use client";

import { useState } from "react";
import Link from "next/link";
import { Megaphone, Heart, Trash2, Edit, FileText, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateIndo } from "@/lib/utils";
import { deleteAnnouncementAction } from "@/actions/admin";
import { toggleLikeAnnouncementAction } from "@/actions/siswa";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface AnnouncementData {
  id: string;
  from?: string | null;
  title: string;
  file?: string | null;
  pengumuman: string;
  like?: string | null;
  created_at?: Date | string | null;
}

interface AnnouncementTimelineProps {
  announcements: AnnouncementData[];
  userRole: "admin" | "guru" | "siswa";
  canManage?: boolean;
}

export function AnnouncementTimeline({
  announcements,
  userRole,
  canManage = false,
}: AnnouncementTimelineProps) {
  const [items, setItems] = useState<AnnouncementData[]>(announcements);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = async (id: string) => {
    const res = await toggleLikeAnnouncementAction(id);
    if (res.success) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, like: String(res.count) } : item
        )
      );
      toast.success(res.liked ? "Menyukai pengumuman" : "Batal menyukai");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await deleteAnnouncementAction(deleteId);
      if (res.success) {
        setItems((prev) => prev.filter((item) => item.id !== deleteId));
        toast.success(res.message);
      } else {
        toast.error("Gagal menghapus pengumuman");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (!items || items.length === 0) {
    return (
      <Card className="border-dashed py-0 gap-0">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <Megaphone className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="font-medium">Belum ada pengumuman.</p>
          <p className="text-xs mt-1">Pengumuman terbaru dari sekolah akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="relative overflow-hidden py-0 gap-0 border-l-4 border-l-emerald-600 transition-all duration-300 hover:scale-[1.005]">
          <CardContent className="p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {item.from || "Pengumuman"}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDateIndo(item.created_at)}</span>
                </div>
              </div>

              {canManage && (
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <Link href={`/${userRole}/announcements/${item.id}`}>
                    <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>

            <h3 className="mt-3 text-lg font-bold tracking-tight text-foreground">
              {item.title}
            </h3>

            {/* Konten Pengumuman */}
            <div
              className="prose prose-emerald dark:prose-invert mt-2 max-w-none text-sm text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: item.pengumuman }}
            />

            {/* Lampiran file */}
            {item.file && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border bg-muted/40 p-2.5 text-xs text-foreground">
                <FileText className="h-4 w-4 text-emerald-600" />
                <span className="font-medium">Lampiran Dokumen:</span>
                <a
                  href={item.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-600 hover:underline"
                >
                  Unduh / Lihat File
                </a>
              </div>
            )}

            {/* Like Counter & Action */}
            <div className="mt-4 flex items-center gap-2 border-t pt-3">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground hover:text-rose-600"
                onClick={() => handleLike(item.id)}
              >
                <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" />
                <span>{item.like || 0} Menyukai</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Pengumuman</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengumuman ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
