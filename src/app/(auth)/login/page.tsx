"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Users,
  GraduationCap,
  LogIn,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { loginDirectAction, demoLoginDirectAction } from "@/actions/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDemoRole, setLoadingDemoRole] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDemoLogin = async (role: "admin" | "guru" | "siswa") => {
    setLoadingDemoRole(role);
    setErrorMessage("");

    try {
      const result = await demoLoginDirectAction(role);
      if (!result.success) {
        setErrorMessage(result.error || "Gagal masuk mode demo.");
        setLoadingDemoRole(null);
        return;
      }
      window.location.href = result.redirectPath || `/${role}`;
    } catch (e: any) {
      setErrorMessage(e?.message || "Terjadi kesalahan saat masuk demo.");
      setLoadingDemoRole(null);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Silakan isi email dan kata sandi.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await loginDirectAction(email, password);
      if (!result.success) {
        setErrorMessage(result.error || "Email atau kata sandi salah!");
        setIsLoading(false);
        return;
      }

      window.location.href = result.redirectPath || "/admin";
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan koneksi sistem.");
      setIsLoading(false);
    }
  };

  const isAnyLoading = isLoading || loadingDemoRole !== null;

  return (
    <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
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
            SISFO SDIA CAIRO
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            SD Islam Al-Azhar Cairo Palembang
          </p>
        </div>
      </div>

      {/* Notifikasi Registrasi Sukses */}
      {isRegistered && (
        <div className="flex items-start gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Pendaftaran Berhasil!</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Akun guru Anda berhasil dibuat dan sedang menunggu verifikasi dari Administrator sebelum dapat masuk.
            </p>
          </div>
        </div>
      )}

      {/* Notifikasi Error */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs sm:text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Akses Cepat Demo */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider">
          Akses Cepat Demo
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={isAnyLoading}
            onClick={() => handleDemoLogin("admin")}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {loadingDemoRole === "admin" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>Admin</span>
          </button>

          <button
            type="button"
            disabled={isAnyLoading}
            onClick={() => handleDemoLogin("guru")}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {loadingDemoRole === "guru" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            )}
            <span>Guru</span>
          </button>

          <button
            type="button"
            disabled={isAnyLoading}
            onClick={() => handleDemoLogin("siswa")}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {loadingDemoRole === "siswa" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
            ) : (
              <GraduationCap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            )}
            <span>Siswa</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-border" />
        <span className="absolute bg-card px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          atau masuk dengan akun
        </span>
      </div>

      {/* Form Login */}
      <form onSubmit={handleFinalSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs sm:text-sm font-medium text-foreground block"
          >
            Alamat Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="nama@alazhar.sch.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isAnyLoading}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-xs sm:text-sm font-medium text-foreground block"
            >
              Kata Sandi
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isAnyLoading}
              className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isAnyLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Masuk ke Sistem</span>
            </>
          )}
        </button>
      </form>

      {/* Footer Links */}
      <div className="text-center space-y-2 pt-2 border-t border-border/60">
        <p className="text-xs text-muted-foreground">
          Guru baru belum memiliki akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Registrasi Guru
          </Link>
        </p>
        <p className="text-[11px] text-muted-foreground/70">
          SD Islam Al-Azhar Cairo Palembang
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4">
      <Suspense
        fallback={
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Memuat halaman login...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
