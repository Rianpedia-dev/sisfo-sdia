"use client";

import React, { useState, useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { registerTeacherAction } from "@/actions/auth";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  BookOpen,
  Briefcase,
  KeyRound,
  Users,
  GraduationCap,
  AtSign,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function RegisterTeacherPage() {
  const [state, formAction, isPending] = useActionState(registerTeacherAction, null);
  const [selectedGender, setSelectedGender] = useState<string>("L");
  const [showPassword, setShowPassword] = useState(false);
  const [showApplePassword, setShowApplePassword] = useState(false);

  const classList = [
    "Kelas 4 - Mehmed Al Fatih",
    "Kelas 4 - Sayfuddin Al Quthuz",
    "Kelas 4 - Sholahuddin Al Ayubi",
    "Kelas 4 - Sulaiman Al Qanuni",
    "Kelas 4 - Mushab bin Umair",
    "Kelas 5 - Al Bukhari",
    "Kelas 5 - Muslim",
    "Kelas 5 - Abu Daud",
    "Kelas 5 - Tirmidzi",
    "Kelas 5 - An Nasa'i",
    "Kelas 6 - Tholhah bin Ubaidillah",
    "Kelas 6 - Anas bin Malik",
    "Kelas 6 - Jabir bin Abdillah",
    "Kelas 6 - Mu'adz bin Jabal",
    "Kelas 6 - Urwah bin Zubair",
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4 sm:p-6 py-12">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
        {/* Header Logo & Title */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 p-2 border border-emerald-500/20 shadow-sm flex items-center justify-center">
            <Image
              src="/images/logo-alazhar-cairo.avif"
              alt="Logo Al-Azhar Cairo"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Registrasi Guru Baru
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              SD Islam Al-Azhar Cairo Palembang
            </p>
            <p className="text-xs text-muted-foreground/80 mt-1">
              Lengkapi formulir di bawah ini untuk mengajukan pendaftaran akun pengajar.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {state?.error && (
          <div className="flex items-center gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 p-3.5 text-xs sm:text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        {/* Form Registrasi */}
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama Lengkap */}
            <div className="space-y-1.5 sm:col-span-2">
              <label
                htmlFor="name"
                className="text-xs sm:text-sm font-medium text-foreground block"
              >
                Nama Lengkap & Gelar <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Contoh: Ustadz Fauzi, S.Pd"
                  disabled={isPending}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5 sm:col-span-2">
              <label
                htmlFor="email"
                className="text-xs sm:text-sm font-medium text-foreground block"
              >
                Alamat Email <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nama@gmail.com"
                  disabled={isPending}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Akun */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs sm:text-sm font-medium text-foreground block"
                >
                  Password Akun <span className="text-destructive">*</span>
                </label>
                <span className="text-[11px] text-muted-foreground">Min. 6</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  disabled={isPending}
                  className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* NIP */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="nip"
                  className="text-xs sm:text-sm font-medium text-foreground block"
                >
                  NIP
                </label>
                <span className="text-[11px] text-muted-foreground">(Opsional)</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                </div>
                <input
                  id="nip"
                  name="nip"
                  type="text"
                  placeholder="1985..."
                  disabled={isPending}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Apple ID */}
            <div className="space-y-1.5">
              <label
                htmlFor="appleid"
                className="text-xs sm:text-sm font-medium text-foreground block"
              >
                Apple ID <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <AtSign className="h-4 w-4" />
                </div>
                <input
                  id="appleid"
                  name="appleid"
                  type="text"
                  required
                  placeholder="email@icloud.com"
                  disabled={isPending}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Apple ID */}
            <div className="space-y-1.5">
              <label
                htmlFor="passwordappleid"
                className="text-xs sm:text-sm font-medium text-foreground block"
              >
                Password Apple ID <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  id="passwordappleid"
                  name="passwordappleid"
                  type={showApplePassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  disabled={isPending}
                  className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowApplePassword(!showApplePassword)}
                  aria-label={showApplePassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showApplePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Guru Bidang / Mapel */}
            <div className="space-y-1.5">
              <label
                htmlFor="guru_bidang"
                className="text-xs sm:text-sm font-medium text-foreground block"
              >
                Bidang Studi / Mapel <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                </div>
                <input
                  id="guru_bidang"
                  name="guru_bidang"
                  type="text"
                  required
                  placeholder="PAI / Tematik / dll"
                  disabled={isPending}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Jenis Kelamin */}
            <div className="space-y-1.5">
              <label
                htmlFor="gender"
                className="text-xs sm:text-sm font-medium text-foreground block"
              >
                Jenis Kelamin <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Users className="h-4 w-4" />
                </div>
                <select
                  id="gender"
                  name="gender"
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  disabled={isPending}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>
            </div>

            {/* Kelas yang Diampu */}
            <div className="space-y-1.5 sm:col-span-2">
              <label
                htmlFor="kelas"
                className="text-xs sm:text-sm font-medium text-foreground block"
              >
                Kelas yang Diampu <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <select
                  id="kelas"
                  name="kelas"
                  required
                  defaultValue=""
                  disabled={isPending}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <option value="" disabled>
                    -- Pilih Kelas yang Diampu --
                  </option>
                  {classList.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mendaftarkan Guru...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Sebagai Guru</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Link Kembali */}
        <div className="text-center pt-2 border-t border-border/60">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1 px-3 rounded-lg hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Login</span>
          </Link>
          <p className="text-[11px] text-muted-foreground/70 mt-2">
            SD Islam Al-Azhar Cairo Palembang
          </p>
        </div>
      </div>
    </div>
  );
}
