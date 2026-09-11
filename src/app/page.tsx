import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    if (session.role === "admin") redirect("/admin");
    if (session.role === "guru") redirect("/guru");
    if (session.role === "siswa") redirect("/siswa");
  }

  redirect("/login");
}
