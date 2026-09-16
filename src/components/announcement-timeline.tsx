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
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <Megaphone className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="font-semibold text-sm">Belum ada pengumuman.</p>
          <p className="text-xs mt-1 text-muted-foreground">Pengumuman terbaru dari sekolah akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="relative overflow-hidden rounded-xl border-l-4 border-l-primary transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4 sm:p-5.5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/25 text-xs font-medium rounded-md">
                  {item.from || "Pengumuman"}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span>{formatDateIndo(item.created_at)}</span>
                </div>
              </div>

              {canManage && (
                <div className="flex items-center gap-1 self-end sm:self-auto">
                  <Link href={`/${userRole}/announcements/${item.id}`}>
                    <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 text-destructive hover:bg-destructive/15 hover:text-destructive"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>

            <h3 className="mt-2.5 text-base sm:text-lg font-bold tracking-tight text-foreground">
              {item.title}
            </h3>

            {/* Konten Pengumuman */}
            <div
              className="prose dark:prose-invert mt-2 max-w-none text-sm text-foreground/85 leading-relaxed break-words"
              dangerouslySetInnerHTML={{ __html: item.pengumuman }}
            />

            {/* Lampiran file */}
            {item.file && (
              <div className="mt-3.5 flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2.5 text-xs text-foreground">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium">Lampiran Dokumen:</span>
                <a
                  href={item.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline truncate"
                >
                  Unduh / Lihat File
                </a>
              </div>
            )}

            {/* Like Counter & Action */}
            <div className="mt-3.5 flex items-center gap-2 border-t pt-2.5">
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
