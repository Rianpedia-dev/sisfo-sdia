import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { GuruBestPointClient } from "./guru-best-point-client";

export const dynamic = "force-dynamic";

export default async function GuruBestPointPage() {
  const session = await getSession();
  if (!session || session.role !== "guru") {
    redirect("/login");
  }

  const guruClass = session.kelas || "";

  let students: any[] = [];

  try {
    students = guruClass
      ? await prisma.user.findMany({
          where: { kelas: guruClass, status: "1" },
        })
      : [];
  } catch (e) {
    console.error("Database query error in best-point:", e);
  }

  const serializedStudents = students.map((s) => ({
    id: s.id.toString(),
    name: s.name,
    nis: s.nis,
    gender: s.gender,
    point: s.point || "0",
    image: s.image,
    kelas: s.kelas,
  }));

  return (
    <GuruBestPointClient
      initialStudents={serializedStudents}
      guruClass={guruClass}
    />
  );
}
