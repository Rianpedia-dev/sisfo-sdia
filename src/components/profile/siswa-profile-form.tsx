"use client";

import React, { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Camera, Trash2, Undo2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { updateStudentProfileAction } from "@/actions/siswa";
import { toast } from "sonner";

interface SiswaProfileFormProps {
  student: {
    id: string;
    name: string;
    email: string;
    nis?: string | null;
    kelas?: string | null;
    gender?: string | null;
    address?: string | null;
    skills?: string | null;
    notes?: string | null;
    image?: string | null;
  };
}

export function SiswaProfileForm({ student }: SiswaProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isRemoved, setIsRemoved] = useState<boolean>(false);

  const initials = student.name ? student.name.substring(0, 2).toUpperCase() : "SW";
  const activeImage = isRemoved ? null : (previewUrl || student.image);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file foto melebihi 5MB. Silakan pilih foto dengan ukuran lebih kecil.");
      return;
    }
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFileName(file.name);
    setIsRemoved(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleCancelSelection = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = () => {
    handleCancelSelection();
    setIsRemoved(true);
  };

  const handleUndoRemove = () => {
    setIsRemoved(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const res = await updateStudentProfileAction(formData);
        if (res.success) {
          toast.success("Foto profil dan data berhasil disimpan!");
          router.refresh();
        } else {
          toast.error(res.error || "Gagal memperbarui profil.");
        }
      } catch (err: any) {
        toast.error(err.message || "Terjadi kesalahan saat menyimpan profil.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Hidden file and removal inputs */}
      <input
        ref={fileInputRef}
        type="file"
        id="profile_photo_input"
        name="image"
        accept="image/*,.png,.jpg,.jpeg,.webp,.avif,.gif,.bmp"
        className="hidden"
        onChange={handleInputChange}
      />
      <input
        type="hidden"
        name="remove_image"
        value={isRemoved ? "true" : "false"}
      />

      {/* Top Header with Single Unified Avatar & Student Identity */}
      <div className="p-6 pb-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b border-border/60">
        {/* Interactive Avatar Container */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center rounded-2xl overflow-hidden border-2 border-emerald-400/50 bg-emerald-100 text-emerald-800 text-2xl font-bold dark:bg-emerald-950 dark:text-emerald-300 shadow-sm transition-all hover:scale-105 hover:ring-4 hover:ring-emerald-500/20"
          title="Klik untuk mengganti foto profil"
        >
          {activeImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeImage}
              alt={student.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span>{initials}</span>
          )}

          {/* Hover overlay with Camera */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 backdrop-blur-xs">
            <Camera className="h-5 w-5 mb-0.5 drop-shadow" />
            <span className="text-[10px] font-semibold">Ganti Foto</span>
          </div>

          {/* Camera badge */}
          <div className="absolute bottom-1 right-1 rounded-full bg-emerald-600 p-1 text-white shadow-md group-hover:hidden">
            <Camera className="h-3 w-3" />
          </div>
        </div>

        {/* Identity info & actions */}
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">{student.name}</h2>
            <Badge className="bg-emerald-600">Siswa Aktif</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs sm:text-sm text-muted-foreground">
            <span>NIS: {student.nis || "-"}</span>
            <span>• Kelas: {student.kelas || "-"}</span>
          </div>

          {/* Compact Action Buttons & Feedback */}
          <div className="pt-1 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-7 px-2.5 text-xs font-semibold border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40 cursor-pointer"
            >
              <Camera className="h-3.5 w-3.5 mr-1" />
              <span>Ganti Foto</span>
            </Button>

            {previewUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelSelection}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Undo2 className="h-3 w-3 mr-1" />
                <span>Batal</span>
              </Button>
            )}

            {student.image && !previewUrl && !isRemoved && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemovePhoto}
                className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30 cursor-pointer"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                <span>Hapus Foto</span>
              </Button>
            )}

            {isRemoved && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleUndoRemove}
                className="h-7 px-2 text-xs text-emerald-700 hover:bg-emerald-50 cursor-pointer"
              >
                <Undo2 className="h-3 w-3 mr-1" />
                <span>Batal Hapus</span>
              </Button>
            )}

            {previewUrl ? (
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>Foto baru dipilih ({selectedFileName})</span>
              </span>
            ) : isRemoved ? (
              <span className="text-xs text-rose-600 font-medium">
                Foto akan dihapus saat disimpan
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Form Fields Directly Below (NO duplicate avatar box!) */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Email Akun Siswa</Label>
            <Input value={student.email} disabled className="bg-muted text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <Label>Jenis Kelamin</Label>
            <Input
              value={student.gender === "L" ? "Laki-laki (L)" : "Perempuan (P)"}
              disabled
              className="bg-muted text-muted-foreground"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">Alamat Tempat Tinggal</Label>
          <Textarea
            id="address"
            name="address"
            defaultValue={student.address || ""}
            placeholder="Alamat domisili lengkap..."
            rows={2}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="skills">Bakat & Keterampilan Khusus</Label>
          <Input
            id="skills"
            name="skills"
            defaultValue={student.skills || ""}
            placeholder="Contoh: Tahfidz Juz 30, Panahan, Robotik, Desain Grafis"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Catatan Tambahan Diri</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={student.notes || ""}
            placeholder="Catatan motivasi atau cita-cita..."
            rows={2}
          />
        </div>

        <div className="flex justify-end pt-3 border-t">
          <Button
            type="submit"
            disabled={isPending}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-sm transition-all"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyimpan Perubahan...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan Profil</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
