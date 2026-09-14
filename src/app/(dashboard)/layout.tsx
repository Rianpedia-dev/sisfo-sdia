import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { getUserProfileImage } from "@/lib/utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  let userImage = session.image;
  let userName = session.name;
  let userGender = session.gender;

  try {
    if (/^\d+$/.test(session.id)) {
      const dbUser = await prisma.user.findUnique({
        where: { id: BigInt(session.id) },
        select: { image: true, name: true, gender: true },
      });
      if (dbUser) {
        userImage = dbUser.image;
        userName = dbUser.name || userName;
        userGender = dbUser.gender || userGender;
      }
    }
  } catch (e) {
    console.error("DashboardLayout user query error:", e);
  }

  const finalUserImage = getUserProfileImage(userImage, userGender);

  return (
    <DashboardShell
      role={session.role}
      userName={userName}
      userEmail={session.email}
      kelas={session.kelas}
      userImage={finalUserImage}
    >
      {children}
    </DashboardShell>
  );
}
