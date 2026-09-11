"use client";

import { useState, useEffect } from "react";
import { Menu, Maximize2, Minimize2, Bell, User, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { useSidebar } from "./sidebar-context";
import { getAcademicYear, getRoleLabel } from "@/lib/utils";

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
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Desktop Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden md:flex text-muted-foreground hover:text-foreground cursor-pointer"
          title={isCollapsed ? "Perluas Sidebar" : "Perkecil Sidebar"}
          aria-label={isCollapsed ? "Perluas Sidebar" : "Perkecil Sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>

        {/* Mobile Sidebar Trigger */}
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar
              role={role}
              userName={userName}
              userEmail={userEmail}
              kelas={kelas}
              onNavigate={() => setOpenMobile(false)}
              forceExpanded={true}
            />
          </SheetContent>
        </Sheet>

        {/* Academic Year Info Banner */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Badge variant="outline" className="border-emerald-600/30 bg-emerald-50 text-emerald-800 text-[11px] sm:text-xs py-0.5 px-2 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium">
            TP {academic.tahunPelajaran}
          </Badge>
          <Badge variant="secondary" className="hidden sm:inline-flex text-[11px] sm:text-xs py-0.5 px-2">
            {academic.semester}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Fullscreen Toggle (Hidden on small mobile) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="hidden sm:flex text-muted-foreground hover:text-foreground cursor-pointer"
          title={isFullscreen ? "Keluar Fullscreen" : "Layar Penuh"}
          aria-label={isFullscreen ? "Keluar Fullscreen" : "Layar Penuh"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>

        {/* Notification indicator */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label="Notifikasi"
        >
          <Bell className="h-4 w-4" />
        </Button>

        {/* Role & User info */}
        <div
          className="flex items-center gap-2 sm:gap-3 pl-1.5 sm:pl-2.5 border-l"
          title={`${userName} • ${getRoleLabel(role === "admin" ? "3" : role === "guru" ? "4" : "1")}`}
        >
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold leading-none truncate max-w-[140px] lg:max-w-[200px]">{userName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {getRoleLabel(role === "admin" ? "3" : role === "guru" ? "4" : "1")}
            </p>
          </div>
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 ring-2 ring-emerald-600/20 dark:bg-emerald-900/50 dark:text-emerald-200 overflow-hidden font-bold text-xs">
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
        </div>
      </div>
    </header>
  );
}
