"use client";

import React, { useRef, useState } from "react";
import { Camera, Trash2, Undo2, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProfilePhotoUploaderProps {
  currentImage?: string | null;
  name: string;
  className?: string;
}

export function ProfilePhotoUploader({
  currentImage,
  name,
  className,
}: ProfilePhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isRemoved, setIsRemoved] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const initials = name ? name.substring(0, 2).toUpperCase() : "US";

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file foto melebihi 5MB. Silakan pilih foto dengan ukuran lebih kecil.");
      return;
    }

    // Revoke previous preview URL if any
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

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Determine which image to display
  const activeImage = isRemoved ? null : (previewUrl || currentImage);

  return (
    <div className={cn("flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20", className)}>
      {/* Hidden inputs for form submission */}
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

      {/* Interactive Avatar Container */}
      <div
        onClick={openFilePicker}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) {
            handleFileChange(file);
            if (fileInputRef.current) {
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              fileInputRef.current.files = dataTransfer.files;
            }
          }
        }}
        className={cn(
          "group relative flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 cursor-pointer items-center justify-center rounded-2xl overflow-hidden shadow-md transition-all duration-200",
          activeImage
            ? "border-2 border-emerald-500/50 bg-background"
            : "border-2 border-dashed border-emerald-500/60 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200",
          isDragging && "ring-4 ring-emerald-500 scale-105"
        )}
        title="Klik untuk memilih foto profil baru"
      >
        {activeImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeImage}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="text-3xl font-extrabold tracking-tight">
            {initials}
          </span>
        )}

        {/* Hover overlay with camera icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 backdrop-blur-xs">
          <Camera className="h-6 w-6 mb-1 drop-shadow" />
          <span className="text-[11px] font-semibold text-center leading-none px-1">
            Ganti Foto
          </span>
        </div>
      </div>

      {/* Action Controls & Details */}
      <div className="flex-1 space-y-2 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFilePicker}
            className="gap-2 border-emerald-600/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 cursor-pointer font-semibold shadow-xs"
          >
            <Upload className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Pilih Foto Baru</span>
          </Button>

          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelSelection}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Undo2 className="h-3.5 w-3.5" />
              <span>Batal</span>
            </Button>
          )}

          {currentImage && !previewUrl && !isRemoved && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemovePhoto}
              className="gap-1.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus Foto</span>
            </Button>
          )}

          {isRemoved && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleUndoRemove}
              className="gap-1.5 text-xs text-emerald-700 hover:bg-emerald-50 cursor-pointer"
            >
              <Undo2 className="h-3.5 w-3.5" />
              <span>Batal Hapus</span>
            </Button>
          )}
        </div>

        {/* Status preview / hints */}
        <div>
          {previewUrl ? (
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Foto baru dipilih: <strong className="truncate max-w-[180px] inline-block align-bottom">{selectedFileName}</strong></span>
              <Badge variant="outline" className="bg-emerald-100/80 border-emerald-300 text-[10px] py-0 px-1.5 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Belum Tersimpan
              </Badge>
            </div>
          ) : isRemoved ? (
            <p className="text-xs text-rose-600 font-medium">
              Foto profil akan dihapus dan diganti inisial nama saat tombol Simpan ditekan.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Format didukung: PNG, JPG, WebP, AVIF, GIF, dan gambar lainnya (Maksimal 5MB).
            </p>
          )}
          <p className="text-[11px] text-muted-foreground/80 mt-0.5">
            Foto ini akan tampil pada Navbar atas, leaderboard, dan data profil sekolah Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
