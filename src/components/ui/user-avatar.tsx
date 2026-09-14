"use client";

import React, { useEffect, useState } from "react";
import { getDefaultProfileImage } from "@/lib/utils";

interface UserAvatarProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  gender?: string | null;
  alt?: string;
  fallbackSrc?: string;
}

export function UserAvatar({
  src,
  gender,
  alt = "Foto profil",
  fallbackSrc,
  className,
  ...props
}: UserAvatarProps) {
  const defaultSrc = fallbackSrc || getDefaultProfileImage(gender);
  const [imgSrc, setImgSrc] = useState<string>(src || defaultSrc);

  useEffect(() => {
    setImgSrc(src || defaultSrc);
  }, [src, defaultSrc]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc || defaultSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (imgSrc !== defaultSrc) {
          setImgSrc(defaultSrc);
        }
      }}
      {...props}
    />
  );
}
