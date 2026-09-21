import React from "react";

/**
 * GlobalBackground
 * Komponen background global adaptif untuk tema Light & Dark Mode.
 * Menggunakan gambar /bc.avif dengan scrim overlay anti-silau (tidak terlalu terang)
 * dan akselerasi hardware penuh (fixed inset-0 -z-20) tanpa lag saat scrolling.
 */
export function GlobalBackground() {
  return (
    <div
      className="fixed inset-0 -z-20 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Base Image Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out opacity-85 brightness-[0.92] contrast-[0.95] dark:opacity-65 dark:brightness-[0.65] dark:contrast-[1.05]"
        style={{
          backgroundImage: "url('/bc.avif')",
        }}
      />

      {/* 2. Theme-Adaptive Scrim Overlay */}
      {/* Light: Nada netral lembut/slate yang meredam silau agar tidak terlalu terang */}
      {/* Dark: Shadow gelap sinematik (slate-950/60 ke black/75) agar gambar latar belakang tetap terlihat jelas namun bernuansa gelap/shadow */}
      <div className="absolute inset-0 transition-colors duration-700 ease-in-out bg-gradient-to-b from-slate-200/85 via-slate-100/80 to-slate-200/88 dark:from-slate-950/65 dark:via-black/55 dark:to-slate-950/75" />

      {/* 3. Radial Shadow Vignette (Bayangan gelap di sekeliling sudut layar) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.08)_100%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.75)_100%)]" />
    </div>
  );
}
