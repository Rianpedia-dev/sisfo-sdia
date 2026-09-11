"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PrayerTimes {
  subuh: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  tanggal?: string;
}

export function PrayerScheduleWidget() {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPrayerTimes() {
      try {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout per PRD 10.1

        const res = await fetch(
          `https://api.myquran.com/v2/sholat/jadwal/0816/${y}/${m}/${d}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error("Gagal mengambil data");
        const data = await res.json();
        if (data && data.data && data.data.jadwal) {
          const j = data.data.jadwal;
          setTimes({
            subuh: j.subuh || "04:45",
            dhuha: j.dhuha || "06:25",
            dzuhur: j.dzuhur || "12:05",
            ashar: j.ashar || "15:15",
            maghrib: j.maghrib || "18:10",
            isya: j.isya || "19:18",
            tanggal: j.tanggal,
          });
        } else {
          throw new Error("Invalid format");
        }
      } catch {
        setError(true);
        // Fallback default times for Palembang if offline
        setTimes({
          subuh: "04:45",
          dhuha: "06:25",
          dzuhur: "12:05",
          ashar: "15:15",
          maghrib: "18:10",
          isya: "19:18",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPrayerTimes();
  }, []);

  const prayerList = [
    { name: "Subuh", time: times?.subuh },
    { name: "Dhuha", time: times?.dhuha },
    { name: "Dzuhur", time: times?.dzuhur },
    { name: "Ashar", time: times?.ashar },
    { name: "Maghrib", time: times?.maghrib },
    { name: "Isya", time: times?.isya },
  ];

  return (
    <Card className="overflow-hidden border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-background to-background">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-emerald-600" />
          <CardTitle className="text-base font-bold">Jadwal Sholat Hari Ini</CardTitle>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 text-emerald-600" />
          <span>Palembang</span>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {error && (
          <p className="mb-2 text-xs text-amber-600 dark:text-amber-400">
            *Menggunakan perkiraan jadwal lokal (API luar jangkauan)
          </p>
        )}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {prayerList.map((p) => (
            <div
              key={p.name}
              className="flex flex-col items-center justify-center rounded-xl border border-emerald-800/20 bg-emerald-50/50 p-2.5 text-center transition-all hover:bg-emerald-100/60 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40"
            >
              <span className="text-xs font-medium text-muted-foreground">{p.name}</span>
              <div className="mt-1 flex items-center gap-1 font-mono text-sm font-bold text-emerald-800 dark:text-emerald-300">
                <Clock className="h-3 w-3 text-emerald-600/70" />
                <span>{loading ? "..." : p.time}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
