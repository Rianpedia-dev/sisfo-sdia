"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Maximize2, Minimize2, User } from "lucide-react";
import { MenuUnfoldLeftIcon } from "@/components/ui/menu-unfold-left-icon";
import { NotificationIcon } from "@/components/ui/notification-icon";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { useSidebar } from "./sidebar-context";
import { NavbarLiveClock } from "./navbar-clock";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getAcademicYear, getRoleLabel, cn } from "@/lib/utils";

interface NavbarProps {
  role: "admin" | "guru" | "siswa";
  userName: string;
  userEmail: string;
  kelas?: string | null;
  userImage?: string | null;
}

export function Navbar({ role, userName, userEmail, kelas, userImage }: NavbarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const [isBellHovered, setIsBellHovered] = useState(false);
  const { isCollapsed, toggleSidebar } = useSidebar();
  const academic = getAcademicYear();

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Desktop Sidebar Toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden md:inline-flex items-center justify-center p-1.5 border-none bg-transparent hover:bg-transparent text-foreground cursor-pointer transition-transform hover:scale-110 focus:outline-hidden"
          title={isCollapsed ? "Perluas Sidebar" : "Perkecil Sidebar"}
          aria-label={isCollapsed ? "Perluas Sidebar" : "Perkecil Sidebar"}
        >
          <MenuUnfoldLeftIcon
            key={isCollapsed ? "collapsed" : "expanded"}
            strokeWidth={2.2}
            className={cn(
              "h-5 w-5 transition-all duration-200",
              isCollapsed
                ? "text-primary scale-x-[-1]"
                : "text-foreground"
            )}
          />
        </button>

        {/* Mobile Sidebar Trigger */}
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetTrigger
            render={
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center p-1.5 border-none bg-transparent hover:bg-transparent text-foreground cursor-pointer transition-transform hover:scale-110 focus:outline-hidden"
                aria-label="Buka Menu Navigasi"
              >
                <Menu className="h-5 w-5 stroke-[2.2] text-foreground" />
              </button>
            }
          />
          <SheetContent
            side="left"
            className="p-0 gap-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground data-[side=left]:w-[285px] sm:data-[side=left]:w-[320px] max-w-[85vw] shadow-2xl overflow-hidden [&>[data-slot=sheet-close]]:text-sidebar-foreground/80 [&>[data-slot=sheet-close]]:hover:text-sidebar-foreground [&>[data-slot=sheet-close]]:hover:bg-muted/70 [&>[data-slot=sheet-close]]:focus-visible:ring-ring [&>[data-slot=sheet-close]]:top-4 [&>[data-slot=sheet-close]]:right-3.5 [&>[data-slot=sheet-close]]:h-8 [&>[data-slot=sheet-close]]:w-8 [&>[data-slot=sheet-close]]:rounded-[var(--radius)] [&>[data-slot=sheet-close]]:cursor-pointer [&>[data-slot=sheet-close]]:transition-all"
          >
            <Sidebar
              role={role}
              userName={userName}
              userEmail={userEmail}
              kelas={kelas}
              onNavigate={() => setOpenMobile(false)}
              forceExpanded={true}
              className="w-full h-full border-none shadow-none bg-transparent"
              isMobileDrawer={true}
            />
          </SheetContent>
        </Sheet>

        {/* Academic & Live Clock Combined Banner (1 Badge Atas-Bawah) */}
        <NavbarLiveClock academic={academic} />
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Theme Toggle (Light / Dark Mode) */}
        <ThemeToggle />

        {/* Fullscreen Toggle (Hidden on small mobile) */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="hidden sm:inline-flex items-center justify-center p-1.5 border-none bg-transparent hover:bg-transparent text-foreground cursor-pointer transition-transform hover:scale-110 focus:outline-hidden"
          title={isFullscreen ? "Keluar Fullscreen" : "Layar Penuh"}
          aria-label={isFullscreen ? "Keluar Fullscreen" : "Layar Penuh"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5 stroke-[2.2] text-foreground" />
          ) : (
            <Maximize2 className="h-5 w-5 stroke-[2.2] text-foreground" />
          )}
        </button>

        {/* Notification indicator */}
        <Link
          href={
            role === "admin"
              ? "/admin/announcements"
              : role === "guru"
                ? "/guru/announcements"
                : "/siswa"
          }
          onMouseEnter={() => setIsBellHovered(true)}
          onMouseLeave={() => setIsBellHovered(false)}
          className="inline-flex items-center justify-center p-1.5 border-none bg-transparent hover:bg-transparent text-foreground cursor-pointer transition-transform hover:scale-110 focus:outline-hidden"
          title="Pengumuman & Notifikasi"
          aria-label="Pengumuman & Notifikasi"
        >
          <NotificationIcon
            size={20}
            strokeWidth={2.2}
            isHovered={isBellHovered}
            className="h-5 w-5 text-foreground"
          />
        </Link>

        {/* Role & User info / Profile Link */}
        {(() => {
          const profileHref = role === "guru" ? "/guru/profile" : role === "siswa" ? "/siswa/profile" : "/admin";
          return (
            <Link
              href={profileHref}
              className="group flex items-center gap-2.5 sm:gap-3 pl-2 sm:pl-3 border-l border-border cursor-pointer rounded-[var(--radius)] py-1 px-1.5 -mr-1.5 transition-all duration-200 hover:bg-muted/70 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              title={`Lihat Profil • ${userName} (${getRoleLabel(role === "admin" ? "3" : role === "guru" ? "4" : "1")})`}
            >
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold leading-none truncate max-w-[140px] lg:max-w-[200px] text-foreground group-hover:text-primary transition-colors">
                  {userName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getRoleLabel(role === "admin" ? "3" : role === "guru" ? "4" : "1")}
                </p>
              </div>
              <div className="relative flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border overflow-hidden font-bold text-xs shadow-xs transition-all duration-200 group-hover:scale-105">
                {userImage ? (
                  <>
                    <span>{userName ? userName.substring(0, 2).toUpperCase() : <User className="h-4 w-4" />}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={userImage}
                      alt={userName}
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </>
                ) : (
                  userName ? userName.substring(0, 2).toUpperCase() : <User className="h-4 w-4" />
                )}
              </div>
            </Link>
          );
        })()}
      </div>
    </header>
  );
}
