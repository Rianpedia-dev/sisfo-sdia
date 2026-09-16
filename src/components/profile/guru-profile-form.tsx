"use client";

import React, { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Mail, Camera, Trash2, Undo2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getRoleLabel, getDefaultProfileImage } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import { updateProfileAction } from "@/actions/guru";
import { toast } from "sonner";

interface GuruProfileFormProps {
  teacher: {
    id: string;
    name: string;
    email: string;
    nip?: string | null;
    status?: string | number | null;
    guru_bidang?: string | null;
    kelas?: string | null;
    gender?: string | null;
    address?: string | null;
    image?: string | null;
  };
  classes: Array<{ id: string | bigint; nama_kelas: string }>;
}

export function GuruProfileForm({ teacher, classes }: GuruProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isRemoved, setIsRemoved] = useState<boolean>(false);

  const defaultImage = getDefaultProfileImage(teacher.gender);
  const activeImage = isRemoved ? defaultImage : (previewUrl || teacher.image || defaultImage);

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
        const res = await updateProfileAction(formData);
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

      {/* Top Header with Single Unified Avatar & Teacher Identity */}
      <div className="p-6 pb-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b border-border/60">
        {/* Avatar Display with Modal Preview on Click */}
        <div className="relative h-20 w-20 shrink-0 rounded-full overflow-hidden bg-muted shadow-sm">
          <UserAvatar
            src={activeImage}
            gender={teacher.gender}
            alt={teacher.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Identity info & actions */}
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">{teacher.name}</h2>
            <Badge className="bg-primary text-primary-foreground rounded-[var(--radius)]">{getRoleLabel(teacher.status || "2")}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              <span>{teacher.email}</span>
            </span>
            {teacher.nip && <span>• NIP: {teacher.nip}</span>}
          </div>

          {/* Compact Action Buttons & Feedback */}
          <div className="pt-1 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-7 px-2.5 text-xs font-semibold border-border text-foreground hover:bg-muted cursor-pointer"
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

            {teacher.image && !previewUrl && !isRemoved && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemovePhoto}
                className="h-7 px-2 text-xs text-destructive hover:bg-destructive/15 hover:text-destructive cursor-pointer"
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
                className="h-7 px-2 text-xs text-primary hover:bg-muted cursor-pointer"
              >
                <Undo2 className="h-3 w-3 mr-1" />
                <span>Batal Hapus</span>
              </Button>
            )}

            {previewUrl ? (
              <span className="text-xs text-primary font-medium flex items-center gap-1">
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
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama Lengkap & Gelar</Label>
          <Input id="name" name="name" defaultValue={teacher.name} required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="guru_bidang">Bidang Studi / Mata Pelajaran</Label>
            <Input
              id="guru_bidang"
              name="guru_bidang"
              defaultValue={teacher.guru_bidang || ""}
              placeholder="Contoh: Pendidikan Agama Islam & Budi Pekerti"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kelas">Wali Kelas</Label>
            <select
              id="kelas"
              name="kelas"
              defaultValue={teacher.kelas || ""}
              className="w-full rounded-[var(--radius)] border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-2 focus:ring-ring focus:outline-hidden"
            >
              <option value="">-- Tidak Membina Kelas --</option>
              {classes.map((c) => (
                <option key={c.id.toString()} value={c.nama_kelas}>
                  {c.nama_kelas}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">Alamat Tempat Tinggal</Label>
          <Textarea
            id="address"
            name="address"
            defaultValue={teacher.address || ""}
            placeholder="Alamat domisili lengkap..."
            rows={3}
          />
        </div>

        <div className="flex justify-end pt-3 border-t">
          <Button
            type="submit"
            disabled={isPending}
            size="lg"
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
