"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "./sidebar-context";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { cn } from "@/lib/utils";
import { KelasOnlineProvider } from "@/components/kelas-online/kelas-online-context";
import { PersistentVideoHost } from "@/components/kelas-online/persistent-video-host";

interface DashboardShellProps {
  role: "admin" | "guru" | "siswa";
  userName: string;
  userEmail: string;
  kelas?: string | null;
  userImage?: string | null;
  children: React.ReactNode;
}

function DashboardLayoutContent({
  role,
  userName,
  userEmail,
  kelas,
  userImage,
  children,
}: DashboardShellProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-slate-50/50 text-foreground dark:bg-slate-950">
      {/* Desktop & Tablet Sidebar */}
      <div
        className={cn(
          "hidden md:block shrink-0 transition-all duration-300 ease-in-out",
          isCollapsed ? "md:w-20" : "md:w-64"
        )}
      >
        <div
          className={cn(
            "fixed inset-y-0 z-40 transition-all duration-300 ease-in-out",
            isCollapsed ? "w-20" : "w-64"
          )}
        >
          <Sidebar
            role={role}
            userName={userName}
            userEmail={userEmail}
            kelas={kelas}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 transition-all duration-300 ease-in-out">
        <Navbar
          role={role}
          userName={userName}
          userEmail={userEmail}
          kelas={kelas}
          userImage={userImage}
        />
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 pb-8 w-full max-w-7xl mx-auto min-w-0">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export function DashboardShell(props: DashboardShellProps) {
  return (
    <SidebarProvider>
      <KelasOnlineProvider>
        <DashboardLayoutContent {...props} />
        <PersistentVideoHost />
      </KelasOnlineProvider>
    </SidebarProvider>
  );
}
