import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import prisma from "./prisma";
import { getRoleFromStatus } from "./utils";

const authSecret = process.env.AUTH_SECRET;
if (process.env.NODE_ENV === "production" && !authSecret) {
  console.warn(
    "[SECURITY WARNING] AUTH_SECRET tidak disetel di environment production! Segera set AUTH_SECRET di .env untuk keamanan sesi pengguna."
  );
}

const SECRET_KEY = new TextEncoder().encode(
  authSecret || "alazharsdsecretkey2026modernrebuild_at_least_32_chars_long!!"
);

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "guru" | "siswa";
  status: string;
  kelas?: string | null;
  nis?: string | null;
  nip?: string | null;
  appleid?: string | null;
  gender?: string | null;
  image?: string | null;
}

export type AuthResult =
  | { success: true; redirectPath: string; user: SessionUser }
  | { success: false; error: string };

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sisfo_session")?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(user: SessionUser) {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set("sisfo_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("sisfo_session");
}

export async function authenticateUser(
  email: string,
  passwordPlain: string
): Promise<AuthResult> {
  let user: Awaited<ReturnType<typeof prisma.user.findUnique>> = null;

  try {
    user = await prisma.user.findUnique({
      where: { email },
    });
  } catch (dbErr) {
    console.warn("Prisma lookup failed, falling back to mock credentials if matched:", dbErr);
  }

  // Fallback demo credentials hanya jika database offline/kosong DAN demo mode aktif
  if (!user) {
    const isDemoEnabled =
      process.env.ENABLE_DEMO_MODE === "true" || process.env.NODE_ENV !== "production";

    if (isDemoEnabled) {
      const demoAccounts: Record<
        string,
        {
          pw: string;
          name: string;
          role: "admin" | "guru" | "siswa";
          status: string;
          kelas?: string;
          id: string;
        }
      > = {
        "admin@gmail.com": {
          id: "3",
          pw: "admin123",
          name: "Administrator IT",
          role: "admin",
          status: "3",
        },
        "guru@gmail.com": {
          id: "1",
          pw: "guru123",
          name: "Ustadz Ahmad, S.Pd",
          role: "guru",
          status: "4",
          kelas: "Kelas 4 - Mehmed Al Fatih",
        },
        "siswa@gmail.com": {
          id: "2",
          pw: "siswa123",
          name: "Muhammad Fatih",
          role: "siswa",
          status: "1",
          kelas: "Kelas 4 - Mehmed Al Fatih",
        },
      };

      const demo = demoAccounts[email.toLowerCase().trim()];
      if (demo && demo.pw === passwordPlain) {
        const sessionUser: SessionUser = {
          id: demo.id,
          name: demo.name,
          email: email.toLowerCase().trim(),
          role: demo.role,
          status: demo.status,
          kelas: demo.kelas || null,
          nis: demo.role === "siswa" ? "20260401" : null,
          nip: demo.role === "guru" ? "198501012010011001" : null,
          appleid: `${email.split("@")[0]}@appleid.com`,
        };
        await setSessionCookie(sessionUser);
        let redirectPath = "/admin";
        if (demo.role === "guru") redirectPath = "/guru";
        else if (demo.role === "siswa") redirectPath = "/siswa";
        return { success: true, redirectPath, user: sessionUser };
      }
    }

    return { success: false, error: "Email atau password salah." };
  }

  // Cek verifikasi status: jika status 0 -> ditolak
  if (user.status === "0") {
    return {
      success: false,
      error: "Akun Anda belum diverifikasi oleh Administrator. Silakan hubungi admin sekolah.",
    };
  }

  // Verifikasi password (bcrypt or legacy password1)
  let isMatch = false;
  try {
    isMatch = await bcrypt.compare(passwordPlain, user.password);
  } catch {
    isMatch = false;
  }

  if (!isMatch && user.password1 && user.password1 === passwordPlain) {
    isMatch = true;
  }

  // Also check default passwords for seeded accounts if password hash differs and demo mode is allowed
  if (!isMatch && (process.env.ENABLE_DEMO_MODE === "true" || process.env.NODE_ENV !== "production")) {
    if (email === "admin@gmail.com" && passwordPlain === "admin123") isMatch = true;
    if (email === "guru@gmail.com" && passwordPlain === "guru123") isMatch = true;
    if (email === "siswa@gmail.com" && passwordPlain === "siswa123") isMatch = true;
  }

  if (!isMatch) {
    return { success: false, error: "Email atau password salah." };
  }

  const role = getRoleFromStatus(user.status);
  if (role === "unverified") {
    return {
      success: false,
      error: "Status akun tidak memiliki izin akses sistem.",
    };
  }

  const sessionUser: SessionUser = {
    id: user.id.toString(),
    name: user.name,
    email: user.email,
    role,
    status: user.status,
    kelas: user.kelas || null,
    nis: user.nis,
    nip: user.nip,
    appleid: user.appleid,
    gender: user.gender || null,
    image: user.image,
  };

  await setSessionCookie(sessionUser);

  let redirectPath = "/login";
  if (role === "admin") redirectPath = "/admin";
  else if (role === "guru") redirectPath = "/guru";
  else if (role === "siswa") redirectPath = "/siswa";

  return { success: true, redirectPath, user: sessionUser };
}

export async function loginAsDemoRole(
  role: "admin" | "guru" | "siswa"
): Promise<AuthResult> {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEMO_MODE !== "true") {
    return {
      success: false,
      error: "Demo login dinonaktifkan di lingkungan produksi. Silakan login menggunakan akun terdaftar.",
    };
  }

  const credentials: Record<string, { email: string; pw: string }> = {
    admin: { email: "admin@gmail.com", pw: "admin123" },
    guru: { email: "guru@gmail.com", pw: "guru123" },
    siswa: { email: "siswa@gmail.com", pw: "siswa123" },
  };
  const cred = credentials[role];
  return authenticateUser(cred.email, cred.pw);
}

