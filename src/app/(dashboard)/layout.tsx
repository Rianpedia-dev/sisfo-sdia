import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/layouts/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardShell
      role={session.role}
      userName={session.name}
      userEmail={session.email}
      kelas={session.kelas}
    >
      {children}
    </DashboardShell>
  );
}
