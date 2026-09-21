import React from "react";
import { PencilLoader } from "./loader-1";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  className?: string;
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export function PageLoader({
  className,
  message = "Memuat halaman...",
  subMessage = "SD Islam Al-Azhar Cairo Palembang",
  fullScreen = false,
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center p-6 text-center transition-all",
        fullScreen ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm min-h-screen" : "min-h-[55vh] flex-1 py-12",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Pencil Loader */}
        <PencilLoader size="md" className="scale-90 sm:scale-100" />

        {/* Loading text with subtle pulse */}
        <div className="mt-3 space-y-1">
          <p className="font-heading text-sm sm:text-base font-semibold tracking-tight text-foreground/90 animate-pulse">
            {message}
          </p>
          {subMessage && (
            <p className="text-xs text-muted-foreground font-medium">
              {subMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageLoader;
