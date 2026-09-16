"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Users,
  GraduationCap,
  School,
  Megaphone,
  Award,
  Trophy,
  AlertTriangle,
  LogOut,
  Sparkles,
  BookOpen,
  MonitorPlay,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./sidebar-context";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ClipboardListIcon } from "@/components/ui/clipboard-list-icon";
import { ClipboardCheckIcon } from "@/components/ui/clipboard-check-icon";
import { LayoutDashboardIcon } from "@/components/ui/layout-dashboard-icon";
import { AccountIcon } from "@/components/ui/account-icon";
import { CalendarDaysIcon } from "@/components/ui/calendar-days-icon";
import { HistoryIcon } from "@/components/ui/history-icon";
import { VideoIcon } from "@/components/ui/video-icon";
import { ClockAlertIcon } from "@/components/ui/clock-alert-icon";

const ANIMATED_ICONS = new Set<unknown>([
  ClipboardListIcon,
  ClipboardCheckIcon,
  LayoutDashboardIcon,
  AccountIcon,
  CalendarDaysIcon,
  HistoryIcon,
  VideoIcon,
  ClockAlertIcon,
]);

interface SidebarProps {
  role: "admin" | "guru" | "siswa";
  userName?: string;
  userEmail?: string;
  kelas?: string | null;
  onNavigate?: () => void;
  forceExpanded?: boolean;
  className?: string;
  isMobileDrawer?: boolean;
}

export function Sidebar({
  role,
  userName,
  userEmail,
  kelas,
  onNavigate,
  forceExpanded = false,
  className,
  isMobileDrawer = false,
}: SidebarProps) {
  const pathname = usePathname();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const { isCollapsed, toggleSidebar } = useSidebar();
  const collapsed = forceExpanded ? false : isCollapsed;

  const adminMenu = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboardIcon },
    { label: "Kelola Siswa", href: "/admin/students", icon: GraduationCap },
    { label: "Kelola Guru", href: "/admin/teachers", icon: Users },
    { label: "Kelola Kelas", href: "/admin/classes", icon: School },
    { label: "Buat Pengumuman", href: "/admin/announcements", icon: Megaphone },
    { label: "Kalender Kegiatan", href: "/admin/calendar", icon: CalendarDaysIcon },
    { label: "Monitor Kelas Online", href: "/admin/kelas-online", icon: MonitorPlay },
  ];

  const guruMenu = [
    { label: "Dashboard", href: "/guru", icon: LayoutDashboardIcon },
    { label: "Profil Saya", href: "/guru/profile", icon: AccountIcon },
    { label: "Kelas Saya", href: "/guru/my-class", icon: School },
    { label: "Absensi Kelas", href: "/guru/attendance", icon: ClipboardListIcon },
    { label: "Pengumuman", href: "/guru/announcements", icon: Megaphone },
    { label: "Kalender Kegiatan", href: "/guru/calendar", icon: CalendarDaysIcon },
    { label: "Best Student", href: "/guru/best-student", icon: Award },
    { label: "Leaderboard Poin", href: "/guru/best-point", icon: Trophy },
    { label: "Prestasi Siswa", href: "/guru/achievements", icon: Sparkles },
    { label: "Kelas Online", href: "/guru/kelas-online", icon: VideoIcon },
  ];

  const siswaMenu = [
    { label: "Dashboard", href: "/siswa", icon: LayoutDashboardIcon },
    { label: "Profil Saya", href: "/siswa/profile", icon: AccountIcon },
    { label: "Checklist Sholat", href: "/siswa/prayers", icon: ClipboardCheckIcon },
    { label: "Riwayat Sholat", href: "/siswa/prayers/history", icon: HistoryIcon },
    { label: "Kalender Kegiatan", href: "/siswa/calendar", icon: CalendarDaysIcon },
    { label: "Riwayat Absensi", href: "/siswa/attendance", icon: ClipboardListIcon },
    { label: "Data Pelanggaran", href: "/siswa/violations", icon: AlertTriangle },
    { label: "Data Keterlambatan", href: "/siswa/lateness", icon: ClockAlertIcon },
    { label: "Leaderboard Poin", href: "/siswa/best-point", icon: Trophy },
    { label: "Best Student", href: "/siswa/best-student", icon: Award },
    { label: "Kelas Online", href: "/siswa/kelas-online", icon: VideoIcon },
  ];

  const menu = role === "admin" ? adminMenu : role === "guru" ? guruMenu : siswaMenu;

  return (
    <TooltipProvider delay={100}>
      <aside
        className={cn(
          "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl transition-all duration-300 ease-in-out select-none",
          collapsed ? "w-20" : "w-64",
          className
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-sidebar-border transition-all duration-300",
            collapsed
              ? "justify-center px-2"
              : isMobileDrawer
                ? "justify-between pl-4 pr-12"
                : "px-5"
          )}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href={`/${role}`}
                    className="flex h-11 w-11 items-center justify-center rounded-[var(--radius)] transition-transform hover:scale-105"
                  >
                    <Image
                      src="/images/logo-alazhar-cairo.avif"
                      alt="Logo SD Islam Al-Azhar Cairo Palembang"
                      width={44}
                      height={44}
                      priority
                      className="h-10 w-10 object-contain drop-shadow-sm"
                    />
                  </Link>
                }
              />
              <TooltipContent
                side="right"
                sideOffset={14}
                className="z-50 rounded-[var(--radius)] bg-popover px-3 py-1.5 text-xs font-semibold text-popover-foreground border border-border shadow-xl"
              >
                SISFO SD Islam Al-Azhar Cairo Palembang
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href={`/${role}`}
              onClick={onNavigate}
              className="flex items-center gap-2.5 overflow-hidden group py-1"
            >
              <Image
                src="/images/SISFO-SD.avif"
                alt="SISFO SD Islam Al-Azhar Cairo Palembang"
                width={170}
                height={40}
                priority
                className="h-9 w-auto max-w-[160px] sm:max-w-[185px] object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </Link>
          )}
        </div>

        {/* User Info for Mobile Drawer */}
        {isMobileDrawer && userName && (
          <div className="mx-3 mt-3 mb-1 p-2.5 rounded-[var(--radius)] bg-sidebar-accent/15 border border-sidebar-border flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 rounded-full bg-sidebar-primary text-sidebar-primary-foreground ring-1 ring-border flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-sidebar-foreground truncate leading-tight">{userName}</p>
              <p className="text-[11px] text-sidebar-foreground/75 capitalize mt-0.5">
                {role === "admin" ? "Administrator" : role === "guru" ? "Guru Pengajar" : (kelas ? `Siswa • ${kelas}` : "Siswa")}
              </p>
            </div>
          </div>
        )}

        {/* Nav Menu */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto py-3 text-[14px] scrollbar-thin scrollbar-thumb-sidebar-border transition-all duration-300",
            collapsed ? "px-2 space-y-1.5 flex flex-col items-center" : "px-3 space-y-1"
          )}
        >
          {!collapsed ? (
            <div className="px-3 pt-1 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-sidebar-foreground/60">
              Menu Navigasi
            </div>
          ) : (
            <div className="w-8 border-b border-sidebar-border my-1" />
          )}

          {menu.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon as React.ComponentType<{
              className?: string;
              isHovered?: boolean;
            }>;
            const isHovered = hoveredHref === item.href;
            const isAnimatedIcon = ANIMATED_ICONS.has(item.icon);

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger
                    render={
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        onMouseEnter={() => setHoveredHref(item.href)}
                        onMouseLeave={() =>
                          setHoveredHref((curr) => (curr === item.href ? null : curr))
                        }
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-[var(--radius)] transition-all duration-150 relative group",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-xs"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/20 hover:text-sidebar-foreground"
                        )}
                        aria-label={item.label}
                      >
                        <span className="menu-icon-wrapper">
                          <Icon
                            className={cn(
                              "h-5 w-5 shrink-0",
                              isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/80 group-hover:text-sidebar-foreground"
                            )}
                            {...(isAnimatedIcon ? { isHovered } : {})}
                          />
                        </span>
                      </Link>
                    }
                  />
                  <TooltipContent
                    side="right"
                    sideOffset={14}
                    className="z-50 rounded-[var(--radius)] bg-popover px-3 py-1.5 text-xs font-semibold text-popover-foreground border border-border shadow-xl"
                  >
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                onMouseEnter={() => setHoveredHref(item.href)}
                onMouseLeave={() =>
                  setHoveredHref((curr) => (curr === item.href ? null : curr))
                }
                className={cn(
                  "flex items-center gap-3 rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-xs font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/20 hover:text-sidebar-foreground"
                )}
              >
                <span className="menu-icon-wrapper shrink-0">
                  <Icon
                    className={cn(
                      "h-4.5 w-4.5 shrink-0",
                      isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/80 group-hover:text-sidebar-foreground"
                    )}
                    {...(isAnimatedIcon ? { isHovered } : {})}
                  />
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div
          className={cn(
            "border-t border-sidebar-border shrink-0 transition-all duration-300",
            collapsed ? "p-2 flex justify-center" : isMobileDrawer ? "p-3 pb-6" : "p-3"
          )}
        >
          <form action={logoutAction} className={collapsed ? "" : "w-full"}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 rounded-[var(--radius)] text-destructive hover:bg-destructive/15 hover:text-destructive cursor-pointer"
                      aria-label="Keluar Sistem"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  }
                />
                <TooltipContent
                  side="right"
                  sideOffset={14}
                  className="z-50 rounded-[var(--radius)] bg-popover px-3 py-1.5 text-xs font-semibold text-destructive border border-border shadow-xl"
                >
                  Keluar Sistem
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start gap-3 rounded-[var(--radius)] py-2 px-3 text-destructive hover:bg-destructive/15 hover:text-destructive text-sm font-medium cursor-pointer transition-colors"
              >
                <LogOut className="h-4.5 w-4.5 shrink-0" />
                <span>Keluar Sistem</span>
              </Button>
            )}
          </form>
        </div>
      </aside>
    </TooltipProvider>
  );
}

