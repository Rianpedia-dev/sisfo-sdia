"use client";

import { useState } from "react";
import { Edit2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { updateRestrictAction } from "@/actions/admin";
import { toast } from "sonner";

interface RestrictRow {
  id: string;
  nama_kelas: string;
  code_restrict: string;
}

export function AdminRestrictTable({ initialData }: { initialData: RestrictRow[] }) {
  const [data, setData] = useState<RestrictRow[]>(initialData);
  const [editingItem, setEditingItem] = useState<RestrictRow | null>(null);
  const [codeValue, setCodeValue] = useState("");
  const [saving, setSaving] = useState(false);

  const openEdit = (item: RestrictRow) => {
    setEditingItem(item);
    setCodeValue(item.code_restrict);
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    setSaving(true);
    try {
      const res = await updateRestrictAction(editingItem.id, codeValue);
      if (res.success) {
        setData((prev) =>
          prev.map((r) =>
            r.id === editingItem.id ? { ...r, code_restrict: codeValue } : r
          )
        );
        toast.success(res.message);
        setEditingItem(null);
      } else {
        toast.error("Gagal menyimpan kode restrict");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-16 text-center font-bold">No</TableHead>
              <TableHead className="font-bold">Nama Kelas</TableHead>
              <TableHead className="font-bold">Code Restrict iPad</TableHead>
              <TableHead className="w-28 text-center font-bold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  Belum ada data kode restrict.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, idx) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                  <TableCell className="font-semibold text-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span>{item.nama_kelas}</span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-block rounded-md bg-emerald-50 px-2.5 py-1 font-mono text-xs font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                      {item.code_restrict || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => openEdit(item)}
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Edit Code Restrict */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Kode Restrict iPad</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-xs text-muted-foreground">Kelas:</p>
              <p className="font-bold text-foreground text-sm">{editingItem?.nama_kelas}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code_restrict">Kode Restrict</Label>
              <Input
                id="code_restrict"
                value={codeValue}
                onChange={(e) => setCodeValue(e.target.value)}
                placeholder="Contoh: 2739 atau 9375, 1989"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)} disabled={saving}>
              Batal
            </Button>
            <Button
              onClick={saveEdit}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
