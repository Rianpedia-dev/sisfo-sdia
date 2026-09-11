import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ClipboardCheck, History, CheckCircle2, AlertCircle, Save, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { savePrayerChecklistAction } from "@/actions/siswa";
import { formatDateIndo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SiswaPrayersPage() {
  const session = await getSession();
  if (!session || session.role !== "siswa") {
    redirect("/login");
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // Find existing prayer record for today
  let prayerToday: any = null;
  try {
    const isNum = /^\d+$/.test(session.id);
    if (isNum) {
      prayerToday = await prisma.prayer.findUnique({
        where: {
          id_date: {
            id: parseInt(session.id, 10),
            date: todayStr,
          },
        },
      });
    }
  } catch (e) {
    console.error("Database query error in siswa prayers:", e);
  }

  const prayers = [
    { key: "subuh", label: "Sholat Subuh", time: "Waktu Fajar", done: prayerToday?.subuh === "1" },
    { key: "dhuha", label: "Sholat Dhuha", time: "Pagi Hari", done: prayerToday?.dhuha === "1" },
    { key: "dzuhur", label: "Sholat Dzuhur", time: "Siang Hari", done: prayerToday?.dzuhur === "1" },
    { key: "ashar", label: "Sholat Ashar", time: "Sore Hari", done: prayerToday?.ashar === "1" },
    { key: "maghrib", label: "Sholat Maghrib", time: "Petang Hari", done: prayerToday?.maghrib === "1" },
    { key: "isya", label: "Sholat Isya", time: "Malam Hari", done: prayerToday?.isya === "1" },
  ];

  const totalCompleted = prayers.filter((p) => p.done).length;
  const isVerified = prayerToday?.verified_guru === "verified";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-bold tracking-tight">Checklist Ibadah Sholat</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Hari ini: <strong>{formatDateIndo(now)}</strong>
          </p>
        </div>

        <Link href="/siswa/prayers/history">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <History className="h-4 w-4" /> Lihat Riwayat Sholat
          </Button>
        </Link>
      </div>

      {/* Verification Status Banner */}
      {prayerToday && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 ${
            isVerified
              ? "border-emerald-500/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-amber-500/30 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
          }`}
        >
          {isVerified ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          )}
          <div className="text-xs">
            <p className="font-bold">
              Status Verifikasi Guru: {isVerified ? "Sudah Diverifikasi" : "Menunggu Verifikasi Guru"}
            </p>
            <p className="text-muted-foreground mt-0.5">
              {isVerified
                ? "Alhamdulillah, catatan sholat hari ini telah disetujui oleh wali kelas Anda."
                : "Wali kelas akan memverifikasi kebenaran checklist sholat yang Anda input."}
            </p>
          </div>
        </div>
      )}

      {/* Checklist Card & Form */}
      <Card className="border-emerald-500/20 shadow-md overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Catatan Sholat Hari Ini</CardTitle>
              <CardDescription>Beri tanda centang pada sholat yang sudah Anda tunaikan.</CardDescription>
            </div>
            <Badge className="bg-emerald-600 font-mono text-xs px-2.5 py-1">
              {totalCompleted} / 6 Selesai
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Kemajuan Hari Ini</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {Math.round((totalCompleted / 6) * 100)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${(totalCompleted / 6) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
              await savePrayerChecklistAction(formData);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prayers.map((pr) => (
                <label
                  key={pr.key}
                  className={`flex items-center justify-between rounded-xl border p-3.5 sm:p-4 cursor-pointer transition-all select-none active:scale-[0.99] ${
                    pr.done
                      ? "bg-emerald-50/60 border-emerald-500/40 dark:bg-emerald-950/30"
                      : "bg-card border-border hover:bg-muted/40 hover:border-emerald-500/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name={pr.key}
                      defaultChecked={pr.done}
                      className="h-6 w-6 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-sm sm:text-base text-foreground">{pr.label}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" /> {pr.time}
                      </p>
                    </div>
                  </div>
                  <Badge variant={pr.done ? "default" : "outline"} className={pr.done ? "bg-emerald-600 text-xs font-semibold shrink-0" : "text-xs font-normal shrink-0"}>
                    {pr.done ? "Tercatat" : "Belum"}
                  </Badge>
                </label>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto h-11 px-6 text-sm font-semibold cursor-pointer shadow-md">
                <Save className="h-4 w-4" /> Simpan Catatan Sholat
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
