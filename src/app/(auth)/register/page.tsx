"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { registerTeacherAction } from "@/actions/auth";
import "./register.css";

export default function RegisterTeacherPage() {
  const [state, formAction, isPending] = useActionState(registerTeacherAction, null);

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
    <div
      className="register-wrapper"
      style={{ backgroundImage: "url('/bc.avif')" }}
    >
      <div className="register-inner shadow">
        <div className="image-holder">
          <Image
            src="/images/DepanSekolah.jpg"
            alt="Gedung Sekolah"
            width={400}
            height={600}
            priority
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <form action={formAction}>
          <h3>Form Registrasi</h3>

          {state?.error && (
            <div className="register-error-banner">
              {state.error}
            </div>
          )}

          <div className="register-form-wrapper">
            <input
              type="text"
              name="name"
              className="register-form-control"
              placeholder="Nama Anda"
              autoComplete="off"
              required
              disabled={isPending}
            />
            <i className="zmdi zmdi-account"></i>
          </div>

          <div className="register-form-wrapper">
            <input
              type="text"
              name="email"
              className="register-form-control"
              placeholder="Username Elearning"
              autoComplete="off"
              required
              disabled={isPending}
            />
            <i className="zmdi zmdi-email"></i>
          </div>

          <div className="register-form-wrapper">
            <input
              type="password"
              name="password"
              className="register-form-control"
              placeholder="Password Elearning"
              required
              minLength={6}
              disabled={isPending}
            />
            <i className="zmdi zmdi-key"></i>
          </div>

          <div className="register-form-wrapper">
            <input
              type="text"
              name="appleid"
              className="register-form-control"
              placeholder="appleid"
              autoComplete="off"
              required
              disabled={isPending}
            />
            <i className="zmdi zmdi-email"></i>
          </div>

          <div className="register-form-wrapper">
            <input
              type="password"
              name="passwordappleid"
              className="register-form-control"
              placeholder="Password Apple Id"
              required
              disabled={isPending}
            />
            <i className="zmdi zmdi-key"></i>
          </div>

          <div className="register-form-wrapper">
            <select
              name="kelas"
              id="kelas"
              className="register-form-control register-select"
              defaultValue=""
              disabled={isPending}
            >
              <option value="" disabled>
                Wali Kelas / kosongkan jika bukan
              </option>
              <option value="Bukan Wali Kelas">Bukan Wali Kelas</option>
              {classList.map((kelas) => (
                <option key={kelas} value={kelas}>
                  {kelas}
                </option>
              ))}
            </select>
            <i className="zmdi zmdi-caret-down" style={{ fontSize: "17px" }}></i>
          </div>

          <div className="register-form-wrapper">
            <input
              type="text"
              name="bidang"
              id="bidang"
              className="register-form-control"
              placeholder="Bidang Studi"
              autoComplete="off"
              required
              disabled={isPending}
            />
            <i className="zmdi zmdi-graduation-cap" style={{ fontSize: "17px" }}></i>
          </div>

          <div className="register-form-wrapper">
            <input
              type="text"
              name="nip"
              id="nip"
              className="register-form-control"
              placeholder="NIP"
              autoComplete="off"
              disabled={isPending}
            />
            <i className="zmdi zmdi-label" style={{ fontSize: "17px" }}></i>
          </div>

          <div className="register-form-wrapper">
            <select
              name="gender"
              id="gender"
              className="register-form-control register-select"
              defaultValue=""
              required
              disabled={isPending}
            >
              <option value="" disabled>
                Jenis Kelamin
              </option>
              <option value="L">L</option>
              <option value="P">P</option>
            </select>
            <i className="zmdi zmdi-male-female"></i>
          </div>

          <button type="submit" className="register-btn" disabled={isPending}>
            <span>{isPending ? "Daftar..." : "Daftar"}</span>
            <i className="zmdi zmdi-arrow-right"></i>
          </button>

          <div className="register-back-link">
            <Link href="/login">Kembali ke Halaman Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
