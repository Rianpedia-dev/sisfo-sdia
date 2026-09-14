"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  Megaphone,
  Calendar,
  Award,
  Trophy,
  ClipboardCheck,
  History,
  Clock,
  AlertTriangle,
  UserCheck,
  LogOut,
  Sparkles,
  BookOpen,
  Video,
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

interface SidebarProps {
  role: "admin" | "guru" | "siswa";
  userName?: string;
  userEmail?: string;
  kelas?: string | null;
  onNavigate?: () => void;
  forceExpanded?: boolean;
}

export function Sidebar({ role, onNavigate, forceExpanded = false }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const collapsed = forceExpanded ? false : isCollapsed;

  const adminMenu = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Kelola Siswa", href: "/admin/students", icon: GraduationCap },
    { label: "Kelola Guru", href: "/admin/teachers", icon: Users },
    { label: "Kelola Kelas", href: "/admin/classes", icon: School },
    { label: "Buat Pengumuman", href: "/admin/announcements", icon: Megaphone },
    { label: "Kalender Kegiatan", href: "/admin/calendar", icon: Calendar },
    { label: "Monitor Kelas Online", href: "/admin/kelas-online", icon: MonitorPlay },
  ];

  const guruMenu = [
    { label: "Dashboard", href: "/guru", icon: LayoutDashboard },
    { label: "Profil Saya", href: "/guru/profile", icon: UserCheck },
    { label: "Kelas Saya", href: "/guru/my-class", icon: School },
    { label: "Absensi Kelas", href: "/guru/attendance", icon: ClipboardCheck },
    { label: "Pengumuman", href: "/guru/announcements", icon: Megaphone },
    { label: "Kalender Kegiatan", href: "/guru/calendar", icon: Calendar },
    { label: "Best Student", href: "/guru/best-student", icon: Award },
    { label: "Leaderboard Poin", href: "/guru/best-point", icon: Trophy },
    { label: "Prestasi Siswa", href: "/guru/achievements", icon: Sparkles },
    { label: "Kelas Online", href: "/guru/kelas-online", icon: Video },
  ];

  const siswaMenu = [
    { label: "Dashboard", href: "/siswa", icon: LayoutDashboard },
    { label: "Profil Saya", href: "/siswa/profile", icon: UserCheck },
    { label: "Checklist Sholat", href: "/siswa/prayers", icon: ClipboardCheck },
    { label: "Riwayat Sholat", href: "/siswa/prayers/history", icon: History },
    { label: "Kalender Kegiatan", href: "/siswa/calendar", icon: Calendar },
    { label: "Riwayat Absensi", href: "/siswa/attendance", icon: Clock },
    { label: "Data Pelanggaran", href: "/siswa/violations", icon: AlertTriangle },
    { label: "Data Keterlambatan", href: "/siswa/lateness", icon: History },
    { label: "Leaderboard Poin", href: "/siswa/best-point", icon: Trophy },
    { label: "Best Student", href: "/siswa/best-student", icon: Award },
    { label: "Kelas Online", href: "/siswa/kelas-online", icon: Video },
  ];

  const menu = role === "admin" ? adminMenu : role === "guru" ? guruMenu : siswaMenu;

  return (
    <TooltipProvider delay={100}>
      <aside
        className={cn(
          "flex h-full flex-col border-r border-emerald-950/10 bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 text-white shadow-xl transition-all duration-300 ease-in-out select-none",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-emerald-800/40 transition-all duration-300",
            collapsed ? "justify-center px-2" : "px-5"
          )}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href={`/${role}`}
                    className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform hover:scale-105"
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
                className="z-50 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-emerald-200 border border-emerald-500/30 shadow-xl"
              >
                SISFO SD Islam Al-Azhar Cairo Palembang
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href={`/${role}`}
              className="flex items-center gap-2.5 overflow-hidden group py-1"
            >
              <Image
                src="/images/SISFO-SD.avif"
                alt="SISFO SD Islam Al-Azhar Cairo Palembang"
                width={190}
                height={48}
                priority
                className="h-10 w-auto max-w-[200px] object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </Link>
          )}
        </div>

        {/* Nav Menu */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto py-4 text-[15px] scrollbar-thin scrollbar-thumb-emerald-800 transition-all duration-300",
            collapsed ? "px-2 space-y-2 flex flex-col items-center" : "px-3 space-y-1.5"
          )}
        >
          {!collapsed ? (
            <div className="px-3 pb-1 text-xs font-bold uppercase tracking-wider text-emerald-400/70">
              Menu Navigasi
            </div>
          ) : (
            <div className="w-8 border-b border-emerald-800/40 my-1" />
          )}

          {menu.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger
                    render={
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-150 relative group",
                          isActive
                            ? "bg-emerald-600 text-white font-medium shadow-xs ring-1 ring-white/15"
                            : "text-emerald-100/75 hover:bg-white/10 hover:text-white"
                        )}
                        aria-label={item.label}
                      >
                        <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-emerald-300")} />
                      </Link>
                    }
                  />
                  <TooltipContent
                    side="right"
                    sideOffset={14}
                    className="z-50 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-emerald-200 border border-emerald-500/30 shadow-xl"
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
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-150",
                  isActive
                    ? "bg-emerald-600 text-white font-medium shadow-xs ring-1 ring-white/15"
                    : "text-emerald-100/75 font-normal hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5 shrink-0", isActive ? "text-white" : "text-emerald-300")} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div
          className={cn(
            "border-t border-emerald-800/40 transition-all duration-300",
            collapsed ? "p-2 flex justify-center" : "p-3"
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
                      className="h-11 w-11 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-100 cursor-pointer"
                      aria-label="Keluar Sistem"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  }
                />
                <TooltipContent
                  side="right"
                  sideOffset={14}
                  className="z-50 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-rose-300 border border-rose-500/30 shadow-xl"
                >
                  Keluar Sistem
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start gap-3 rounded-lg text-red-300 hover:bg-red-500/10 hover:text-red-200 text-[15px] font-medium cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar Sistem</span>
              </Button>
            )}
          </form>
        </div>
      </aside>
    </TooltipProvider>
  );
}
