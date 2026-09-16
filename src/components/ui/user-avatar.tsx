"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getDefaultProfileImage } from "@/lib/utils";
import { X } from "lucide-react";
import { cn } from "cn";

interface UserAvatarProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  gender?: string | null;
  alt?: string;
  fallbackSrc?: string;
  previewable?: boolean;
}

export function UserAvatar({
  src,
  gender,
  alt = "Foto profil",
  fallbackSrc,
  className,
  previewable = true,
  onClick,
  ...props
}: UserAvatarProps) {
  const defaultSrc = fallbackSrc || getDefaultProfileImage(gender);
  const [imgSrc, setImgSrc] = useState<string>(src || defaultSrc);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setImgSrc(src || defaultSrc);
  }, [src, defaultSrc]);

  useEffect(() => {
    if (!isPreviewOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPreviewOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewOpen]);

  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPreviewOpen]);

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (onClick) {
      onClick(e);
    }
    if (previewable) {
      e.stopPropagation();
      setIsPreviewOpen(true);
    }
  };

  const finalSrc = imgSrc || defaultSrc;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={finalSrc}
        alt={alt}
        className={cn(
          className,
          previewable && "cursor-pointer transition-opacity hover:opacity-90"
        )}
        title={previewable ? "Klik untuk melihat foto profil" : undefined}
        onClick={handleClick}
        onError={() => {
          if (imgSrc !== defaultSrc) {
            setImgSrc(defaultSrc);
          }
        }}
        {...props}
      />

      {mounted &&
        isPreviewOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200 select-none"
            onClick={() => setIsPreviewOpen(false)}
          >
            <div
              className="relative flex flex-col items-center max-w-sm sm:max-w-md w-full animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="absolute -top-12 right-0 sm:-right-2 rounded-full bg-white/20 hover:bg-white/30 text-white p-2 backdrop-blur-md transition-all cursor-pointer shadow-lg outline-none"
                title="Tutup (Esc)"
                aria-label="Tutup foto profil"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Enlarged Image Card */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-white/15 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={finalSrc}
                  alt={alt}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
