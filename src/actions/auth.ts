"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { authenticateUser, clearSessionCookie, type AuthResult } from "@/lib/auth";
import { loginSchema, registerTeacherSchema } from "@/lib/validators";

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validated = loginSchema.safeParse({ email, password });
  if (!validated.success) {
    return {
      error: validated.error.issues[0]?.message || "Input tidak valid",
    };
  }

  const result = await authenticateUser(email, password);
  if (!result.success) {
    return { error: result.error };
  }

  redirect(result.redirectPath!);
}

export async function registerTeacherAction(prevState: unknown, formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    appleid: formData.get("appleid") as string,
    password: formData.get("password") as string,
    passwordappleid: formData.get("passwordappleid") as string,
    guru_bidang: formData.get("guru_bidang") as string,
    gender: formData.get("gender") as "L" | "P",
    nip: (formData.get("nip") as string) || undefined,
    kelas: formData.get("kelas") as string,
  };

  const validated = registerTeacherSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      error: validated.error.issues[0]?.message || "Data pendaftaran tidak valid",
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email: rawData.email },
  });

  if (existing) {
    return { error: "Email sudah terdaftar dalam sistem." };
  }

  const hashedPassword = await bcrypt.hash(rawData.password, 10);

  // Status 0: Akun baru belum diverifikasi admin (PRD 7.1.2)
  await prisma.user.create({
    data: {
      name: rawData.name,
      email: rawData.email,
      appleid: rawData.appleid,
      password: hashedPassword,
      password1: rawData.password, // simpan plaintext sesuai PRD catatan migrasi 19.1
      passwordappleid: rawData.passwordappleid,
      guru_bidang: rawData.guru_bidang,
      gender: rawData.gender,
      nip: rawData.nip,
      kelas: rawData.kelas,
      status: "0", // Pending verifikasi admin
    },
  });

  redirect("/login?registered=1");
}

export const registerAction = registerTeacherAction;

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function demoLoginAction(role: "admin" | "guru" | "siswa") {
  const { loginAsDemoRole } = await import("@/lib/auth");
  const result = await loginAsDemoRole(role);
  if (result.success && result.redirectPath) {
    redirect(result.redirectPath);
  }
}

export async function loginDirectAction(
  email: string,
  passwordPlain: string
): Promise<AuthResult> {
  const validated = loginSchema.safeParse({ email, password: passwordPlain });
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Format input tidak valid",
    };
  }

  const result = await authenticateUser(email, passwordPlain);
  return result;
}

export async function demoLoginDirectAction(
  role: "admin" | "guru" | "siswa"
): Promise<AuthResult> {
  const { loginAsDemoRole } = await import("@/lib/auth");
  return await loginAsDemoRole(role);
}

