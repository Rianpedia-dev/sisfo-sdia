"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginDirectAction, demoLoginDirectAction } from "@/actions/auth";
import { PencilLoader } from "@/components/ui/loader-1";
import "./login.css";

function LoginForm() {
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDemoRole, setLoadingDemoRole] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldError, setFieldError] = useState<"email" | "password" | null>(null);

  const handleDemoLogin = async (role: "admin" | "guru" | "siswa") => {
    setLoadingDemoRole(role);
    setErrorMessage("");
    setFieldError(null);

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
    setErrorMessage("");
    setFieldError(null);

    if (!email) {
      setFieldError("email");
      setErrorMessage("Periksa kembali email anda");
      return;
    }
    if (!password) {
      setFieldError("password");
      setErrorMessage("Password anda salah");
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginDirectAction(email, password);
      if (!result.success) {
        const errText = result.error || "Password anda salah";
        setErrorMessage(errText);
        if (errText.toLowerCase().includes("email") || errText.toLowerCase().includes("user") || errText.toLowerCase().includes("tidak terdaftar")) {
          setFieldError("email");
        } else {
          setFieldError("password");
        }
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
    <div className="wrap-login100 p-t-30 p-b-50">
      <Image
        src="/images/SISFO-SD.png"
        alt="logo"
        width={350}
        height={100}
        className="login100-logo"
        priority
      />
      <span className="login100-form-title p-b-35 text-center mt-3">
        Login Akun
      </span>

      <form
        className="login100-form validate-form p-b-33 p-t-5"
        onSubmit={handleFinalSubmit}
        autoComplete="off"
      >
        {isRegistered && (
          <div className="login-alert-box login-alert-success text-center">
            Registration Success, Silahkan hubungi Team IT SD untuk verifikasi
          </div>
        )}

        {errorMessage && !fieldError && (
          <div className="login-alert-box login-alert-danger text-center">
            {errorMessage}
          </div>
        )}

        <div className="wrap-input100">
          <input
            className={`input100 ${email ? "has-val" : ""}`}
            type="text"
            name="email"
            placeholder="Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isAnyLoading}
            autoFocus
          />
          <span className="focus-input100" data-placeholder="&#xe82a;"></span>
          {fieldError === "email" && (
            <p className="text-danger ml-4">{errorMessage || "Periksa kembali email anda"}</p>
          )}
        </div>

        <div className="wrap-input100 validate-input" data-validate="Enter password">
          <input
            className={`input100 ${password ? "has-val" : ""}`}
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isAnyLoading}
          />
          <span className="focus-input100" data-placeholder="&#xe80f;"></span>
          {fieldError === "password" && (
            <p className="text-danger ml-4">{errorMessage || "Password anda salah"}</p>
          )}
        </div>

        <div className="container-login100-form-btn m-t-32">
          <button className="login100-form-btn" type="submit" disabled={isAnyLoading}>
            {isLoading ? "Memproses..." : "Login"}
          </button>
        </div>

        <div className="d-flex justify-content-center mt-3">
          <p className="login100-footer-text">
            Guru ? <Link href="/register" className="text-primary">Registrasi Di sini</Link>
          </p>
        </div>
      </form>

      {/* Akses Cepat Demo (Subtle & Unobtrusive) */}
      <div className="demo-access-bar">
        <span style={{ fontSize: "11px", color: "#ffffff", opacity: 0.85, alignSelf: "center", marginRight: "4px" }}>
          Demo:
        </span>
        <button
          type="button"
          disabled={isAnyLoading}
          onClick={() => handleDemoLogin("admin")}
          className="demo-btn"
        >
          {loadingDemoRole === "admin" ? "..." : "Admin"}
        </button>
        <button
          type="button"
          disabled={isAnyLoading}
          onClick={() => handleDemoLogin("guru")}
          className="demo-btn"
        >
          {loadingDemoRole === "guru" ? "..." : "Guru"}
        </button>
        <button
          type="button"
          disabled={isAnyLoading}
          onClick={() => handleDemoLogin("siswa")}
          className="demo-btn"
        >
          {loadingDemoRole === "siswa" ? "..." : "Siswa"}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="limiter">
      <div
        className="container-login100"
        style={{ backgroundImage: "url('/bc.avif')" }}
      >
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center p-8 gap-3">
              <PencilLoader size="sm" />
              <p className="text-white text-xs font-medium tracking-wide">Memuat form login...</p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
