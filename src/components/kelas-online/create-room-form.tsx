"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, BookOpen, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CreateRoomFormProps {
  kelas: string;
}

export function CreateRoomForm({ kelas }: CreateRoomFormProps) {
  const router = useRouter();
  const [mataPelajaran, setMataPelajaran] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/kelas-online/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mata_pelajaran: mataPelajaran }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat kelas online");
      }

      toast.success("Kelas online berhasil dibuat!");
      router.push(`/guru/kelas-online/${data.roomId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-emerald-200/50 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900 dark:border-emerald-800/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Video className="h-5 w-5 text-emerald-600" />
          Buat Kelas Online Baru
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Kelas: <span className="font-medium text-foreground">{kelas}</span>
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="mata_pelajaran"
              className="block text-sm font-medium mb-1.5"
            >
              <BookOpen className="inline h-4 w-4 mr-1 text-emerald-600" />
              Mata Pelajaran (opsional)
            </label>
            <input
              id="mata_pelajaran"
              type="text"
              value={mataPelajaran}
              onChange={(e) => setMataPelajaran(e.target.value)}
              placeholder="Contoh: Matematika, IPA, Bahasa Indonesia..."
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-950/40 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Membuat Kelas...
              </>
            ) : (
              "🎥 Buat Kelas Online"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
