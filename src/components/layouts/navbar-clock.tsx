"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAcademicYear } from "@/lib/utils";

const DAY_NAMES = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

interface NavbarLiveClockProps {
  academic?: {
    tahunPelajaran: string;
    semester: string;
  };
}

export function NavbarLiveClock({ academic: academicProp }: NavbarLiveClockProps = {}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const academic = academicProp || getAcademicYear();

  const baseShadow = "0px 2px 4px 0px rgba(0, 0, 0, 0.25)";
  const hoverShadow = "0px 3px 6px 0px rgba(0, 0, 0, 0.35)";
  const pressedShadow = "0px 0px 0px 0px rgba(0, 0, 0, 0.25)";

  if (!now) {
    return (
      <div
        style={{ boxShadow: baseShadow }}
        className="inline-flex flex-col justify-center rounded-[var(--radius)] border border-border bg-card px-3.5 sm:px-4 py-1.5 text-xs select-none shrink-0 w-fit"
      >
        <span className="inline-block h-3.5 w-28 animate-pulse rounded-[var(--radius)] bg-muted" />
        <span className="inline-block h-3 w-40 animate-pulse rounded-[var(--radius)] bg-muted/70 mt-1" />
      </div>
    );
  }

  const dayName = DAY_NAMES[now.getDay()];
  const dateNum = now.getDate();
  const monthName = MONTH_NAMES[now.getMonth()];
  const monthShort = MONTH_SHORT[now.getMonth()];
  const monthNumber = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const timeStr = `${hours}:${minutes}:${seconds}`;

  return (
    <motion.div
      initial={{ x: 0, y: 0, boxShadow: baseShadow }}
      animate={{ x: 0, y: 0, boxShadow: baseShadow }}
      whileHover={{ y: -1, boxShadow: hoverShadow }}
      whileTap={{ y: 1, boxShadow: pressedShadow }}
      transition={{ type: "spring", stiffness: 360, damping: 24, mass: 0.6 }}
      className="inline-flex flex-col justify-center rounded-[var(--radius)] border border-border bg-card px-3.5 sm:px-4 py-1.5 select-none backdrop-blur-sm shrink-0 w-fit cursor-default"
    >
      {/* Baris 1 (Atas): Tahun Pelajaran & Semester */}
      <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-[13px] font-bold text-foreground leading-tight tracking-tight">
        <span>TP {academic.tahunPelajaran}</span>
        <span className="inline-block h-3 w-px bg-border" />
        <span className="font-semibold text-primary">
          {academic.semester}
        </span>
      </div>

      {/* Baris 2 (Bawah): Hari, Tanggal, Bulan, Tahun & Jam:Menit:Detik */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs leading-tight text-muted-foreground tabular-nums mt-1 tracking-tight font-medium">
        {/* Full Day & Date on Desktop (lg+) */}
        <span className="hidden lg:inline">
          {dayName}, {dateNum} {monthName} {year}
        </span>

        {/* Short Day & Date on Tablet (md to lg) */}
        <span className="hidden md:inline lg:hidden">
          {dayName}, {dateNum} {monthShort} {year}
        </span>

        {/* Date & Month on small screen (sm to md) */}
        <span className="hidden sm:inline md:hidden">
          {dateNum} {monthShort} {year}
        </span>

        {/* Compact Date on Mobile (min 420px to 640px) */}
        <span className="hidden min-[420px]:inline sm:hidden text-[10.5px]">
          {dateNum}/{monthNumber}
        </span>

        <span className="inline-block h-3 w-px bg-border" />

        {/* Live Time with seconds */}
        <span className="font-mono font-bold text-xs sm:text-[13px] text-foreground tracking-tight">
          {timeStr}
        </span>

        {/* WIB suffix on large desktop */}
        <span className="hidden xl:inline text-[10px] font-extrabold text-primary tracking-wider uppercase">
          WIB
        </span>
      </div>
    </motion.div>
  );
}
