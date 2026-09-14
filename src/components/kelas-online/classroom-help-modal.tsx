"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Mic,
  Volume2,
  Lock,
  Hand,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  ScreenShare,
} from "lucide-react";

interface ClassroomHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: "guru" | "siswa" | "admin";
}

export function ClassroomHelpModal({
  isOpen,
  onClose,
  role: _role = "siswa",
}: ClassroomHelpModalProps) {
  const [activeTab, setActiveTab] = useState<"step" | "permission" | "share" | "adab">("step");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-emerald-200 dark:border-emerald-800/40 rounded-2xl">
        {/* Header with Al-Azhar Emerald Gradient */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md">
              <HelpCircle className="h-7 w-7 text-emerald-100" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                Panduan Kelas Online Mudah
                <Sparkles className="h-4 w-4 text-amber-300 fill-amber-300" />
              </DialogTitle>
              <DialogDescription className="text-emerald-100 text-sm mt-0.5">
                Petunjuk praktis untuk anak-anak, orang tua, dan Ustadz/Ustadzah
              </DialogDescription>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex gap-1.5 sm:gap-2 mt-5 p-1 bg-black/15 rounded-xl backdrop-blur-sm overflow-x-auto">
            <button
              onClick={() => setActiveTab("step")}
              className={`flex-1 min-w-[100px] py-2 px-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === "step"
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-emerald-100 hover:bg-white/10"
              }`}
            >
              🚀 Masuk Kelas
            </button>
            <button
              onClick={() => setActiveTab("permission")}
              className={`flex-1 min-w-[100px] py-2 px-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === "permission"
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-emerald-100 hover:bg-white/10"
              }`}
            >
              🔒 Kamera & Suara
            </button>
            <button
              onClick={() => setActiveTab("share")}
              className={`flex-1 min-w-[100px] py-2 px-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === "share"
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-emerald-100 hover:bg-white/10"
              }`}
            >
              🖥️ Bagikan Layar
            </button>
            <button
              onClick={() => setActiveTab("adab")}
              className={`flex-1 min-w-[100px] py-2 px-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === "adab"
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-emerald-100 hover:bg-white/10"
              }`}
            >
              🤲 Adab Belajar
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {activeTab === "step" && (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-4">
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                  💡 Hanya 3 langkah mudah untuk bergabung ke kelas online:
                </p>
              </div>

              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-1.5 text-foreground">
                      <Camera className="h-4 w-4 text-emerald-600" />
                      Cek Wajah di Layar Kamera
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pastikan wajah Ananda terlihat jelas dan pencahayaan ruangan cukup terang.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-1.5 text-foreground">
                      <Mic className="h-4 w-4 text-emerald-600" />
                      Periksa Mikrofon & Suara
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Coba bersuara sedikit. Garis hijau di samping ikon mic akan bergerak jika suara masuk.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl border-2 border-emerald-500/50 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
                  <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Klik Tombol Hijau &quot;Join&quot;
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Tekan tombol hijau bertuliskan <strong>&quot;Join&quot;</strong> di tengah atau pojok kanan atas frame video. Ananda akan langsung masuk ke kelas!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "permission" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/70 dark:bg-amber-950/20 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-bold">Kamera atau Mikrofon Tertutup / Tidak Berfungsi?</span>
                  <p className="mt-1">
                    Browser (Google Chrome / Edge) membutuhkan izin untuk menggunakan kamera dan mic perangkat Anda.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-2 font-semibold text-sm mb-1.5">
                    <Lock className="h-4 w-4 text-emerald-600" />
                    1. Klik Ikon Gembok di Atas Layar Browser
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Lihat kolom alamat link (URL browser) di bagian paling atas. Di sebelah kirinya ada ikon <strong>Gembok (🔒)</strong> atau <strong>Ikon Pengaturan (Tune)</strong>. Silakan diklik.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-2 font-semibold text-sm mb-1.5">
                    <Camera className="h-4 w-4 text-emerald-600" />
                    2. Ubah Kamera & Mikrofon Menjadi &quot;Izinkan&quot; (Allow)
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pastikan tombol geser atau pilihan di samping tulisan <strong>Camera</strong> dan <strong>Microphone</strong> dalam posisi aktif / <strong>Allow</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-2 font-semibold text-sm mb-1.5">
                    <Volume2 className="h-4 w-4 text-emerald-600" />
                    3. Suara Teman/Guru Tidak Terdengar?
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pastikan volume speaker laptop atau HP Anda tidak dalam posisi bisu (Mute) dan headset terpasang dengan erat.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "share" && (
            <div className="space-y-3">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-4">
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                  <ScreenShare className="h-4 w-4 text-emerald-600" />
                  Cara Berbagi Layar (Bisa di Laptop, Tablet, & Smartphone):
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Fitur ini memungkinkan Ustadz/Ustadzah atau siswa mempresentasikan materi pelajaran, gambar tugas, atau dokumen ke seluruh kelas.
                </p>
              </div>

              <div className="grid gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground mb-1">
                    <span className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-xs text-emerald-700 font-bold">1</span>
                    Di Laptop / Komputer (Desktop)
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Klik tombol hijau <strong>&quot;Bagikan Layar&quot;</strong> di bar atas atau di bar bawah video. Pilih <strong>Seluruh Layar</strong> (*Entire Screen*), <strong>Jendela Aplikasi</strong> (misal PowerPoint), atau <strong>Tab Browser</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground mb-1">
                    <span className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-xs text-emerald-700 font-bold">2</span>
                    Di Tablet & Smartphone (Android / iPad)
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Klik tombol <strong>&quot;Bagikan Layar&quot;</strong> di bar atas. Saat muncul permintaan izin dari browser atau sistem (misal &quot;Mulai Merekam&quot; / *Start now*), pilih <strong>Mulai</strong>. Layar tablet/HP Anda akan langsung terlihat oleh semua peserta kelas.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/20">
                  <h4 className="font-semibold text-sm flex items-center gap-2 text-amber-900 dark:text-amber-200 mb-1">
                    <span className="h-6 w-6 rounded-full bg-amber-200/80 dark:bg-amber-900/50 flex items-center justify-center text-xs text-amber-800 font-bold">3</span>
                    Cara Berhenti Berbagi
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    Cukup klik tombol merah <strong>&quot;Berhenti Berbagi&quot;</strong> yang sedang berkedip di bar atas, atau tekan tombol &quot;Stop sharing&quot; pada notifikasi sistem layar HP/laptop Anda.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "adab" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                <h4 className="font-semibold text-sm text-emerald-800 dark:text-emerald-300 mb-1">
                  Tata Tertib Belajar Santri SD Al-Azhar Cairo:
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Menjaga adab menuntut ilmu membawa keberkahan dan mempermudah pemahaman.
                </p>
              </div>

              <div className="grid gap-2 text-xs">
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-base">🤲</span>
                  <span className="font-medium text-foreground">Membaca doa sebelum dan sesudah belajar.</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-base">👔</span>
                  <span className="font-medium text-foreground">Berpakaian seragam rapi dan menyalakan kamera.</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-base">🔇</span>
                  <span className="font-medium text-foreground">Mematikan mikrofon (Mute) saat guru sedang menjelaskan.</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <Hand className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-foreground">Menggunakan fitur &quot;Angkat Tangan&quot; (Raise Hand) jika ingin bertanya.</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-base">🗕</span>
                  <span className="font-medium text-foreground">Gunakan tombol <strong>Perkecil (Minimize)</strong> jika ingin membuka tugas tanpa keluar dari kelas.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer px-6"
          >
            Mengerti & Tutup Panduan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
