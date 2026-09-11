"use client";

import { useState } from "react";
import { Download, FileText, Calendar, School, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { UserItem } from "@/types";

interface RecapClientProps {
  guruClass: string;
  tahunPelajaran: string;
  semester: string;
  students: UserItem[];
  allAbsen: {
    user_id: string;
    date: string;
    keterangan: string;
  }[];
}

export function RecapClient({
  guruClass,
  tahunPelajaran,
  semester,
  students,
  allAbsen,
}: RecapClientProps) {
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [isGenerating, setIsGenerating] = useState(false);

  const monthNames = [
    "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const daysInMonth = new Date(currentYear, selectedMonth, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Compute stats for each student in selectedMonth
  const studentStats = students.map((s) => {
    const studentAbsens = allAbsen.filter((a) => {
      if (a.user_id !== s.id) return false;
      const parts = (a.date || "").split("-");
      if (parts.length === 3) {
        return parseInt(parts[1], 10) === selectedMonth;
      }
      return false;
    });

    let h = 0, sc = 0, i = 0, a = 0;
    studentAbsens.forEach((ab) => {
      if (ab.keterangan === "Hadir") h++;
      else if (ab.keterangan === "Sakit") sc++;
      else if (ab.keterangan === "Izin") i++;
      else if (ab.keterangan === "Alpha") a++;
    });

    const totalDays = h + sc + i + a;
    const persentase = totalDays > 0 ? Math.round((h / totalDays) * 100) : 0;

    return {
      student: s,
      hadir: h,
      sakit: sc,
      izin: i,
      alpha: a,
      persentase: `${persentase}%`,
    };
  });

  // Generate PDF per PRD Section 14
  const generatePdf = () => {
    setIsGenerating(true);
    try {
      // Landscape A4
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Header Sekolah
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("SD ISLAM AL-AZHAR CAIRO PALEMBANG", 148.5, 15, { align: "center" });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("REKAPITULASI PRESENSI KEHADIRAN SISWA", 148.5, 22, { align: "center" });

      doc.setFontSize(9);
      doc.text(`Kelas: ${guruClass}  |  Tahun Pelajaran: ${tahunPelajaran}  |  Semester: ${semester}  |  Bulan: ${monthNames[selectedMonth]} ${currentYear}`, 148.5, 28, { align: "center" });
      doc.line(14, 31, 283, 31);

      // Table Data
      const tableRows = studentStats.map((st, idx) => [
        idx + 1,
        st.student.name,
        st.student.nis || "-",
        st.student.gender || "-",
        st.hadir,
        st.sakit,
        st.izin,
        st.alpha,
        st.persentase,
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["No", "Nama Siswa", "NIS", "L/P", "Hadir (H)", "Sakit (S)", "Izin (I)", "Alpha (A)", "Kehadiran %"]],
        body: tableRows,
        theme: "striped",
        headStyles: {
          fillColor: [13, 148, 136], // Emerald/Teal
          textColor: 255,
          fontStyle: "bold",
          fontSize: 9,
          halign: "center",
        },
        bodyStyles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 12 },
          1: { cellWidth: 90 },
          2: { halign: "center", cellWidth: 30 },
          3: { halign: "center", cellWidth: 15 },
          4: { halign: "center", cellWidth: 25 },
          5: { halign: "center", cellWidth: 25 },
          6: { halign: "center", cellWidth: 25 },
          7: { halign: "center", cellWidth: 25 },
          8: { halign: "center", cellWidth: 22 },
        },
      });

      // Signature area
      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 150;
      doc.setFontSize(9);
      doc.text(`Palembang, ${new Date().toLocaleDateString("id-ID")}`, 235, finalY + 15, { align: "center" });
      doc.text("Wali Kelas,", 235, finalY + 20, { align: "center" });
      doc.text("( ......................................... )", 235, finalY + 38, { align: "center" });

      // Save PDF
      doc.save(`Rekap_Absen_${guruClass.replace(/\s+/g, "_")}_${monthNames[selectedMonth]}_${currentYear}.pdf`);
      toast.success("Dokumen PDF berhasil di-download.");
    } catch {
      toast.error("Gagal membuat file PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Month Picker & Action Bar */}
      <Card className="border-emerald-500/20 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Pilih Bulan:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm"
              >
                {monthNames.slice(1).map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m} {currentYear}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={generatePdf}
            disabled={isGenerating}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? "Menyiapkan PDF..." : "Download PDF Rekap (A4 Landscape)"}
          </Button>
        </CardContent>
      </Card>

      {/* Recap Table Preview */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            <span>Rekapitulasi Bulan {monthNames[selectedMonth]} {currentYear}</span>
          </CardTitle>
          <CardDescription>
            Ringkasan kehadiran siswa kelas {guruClass} (Tahun Pelajaran {tahunPelajaran} • {semester})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-muted/60 border-b">
                <tr>
                  <th className="p-3 font-bold text-center w-12 border-r">No</th>
                  <th className="p-3 font-bold border-r">Nama Siswa</th>
                  <th className="p-3 font-bold text-center border-r">NIS</th>
                  <th className="p-3 font-bold text-center border-r">L/P</th>
                  <th className="p-3 font-bold text-center border-r bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Hadir (H)
                  </th>
                  <th className="p-3 font-bold text-center border-r bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                    Sakit (S)
                  </th>
                  <th className="p-3 font-bold text-center border-r bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Izin (I)
                  </th>
                  <th className="p-3 font-bold text-center border-r bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    Alpha (A)
                  </th>
                  <th className="p-3 font-bold text-center">Persentase</th>
                </tr>
              </thead>
              <tbody>
                {studentStats.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-muted-foreground">
                      Belum ada data siswa di kelas ini.
                    </td>
                  </tr>
                ) : (
                  studentStats.map((st, idx) => (
                    <tr key={st.student.id} className="border-b hover:bg-muted/30">
                      <td className="p-2.5 text-center font-medium border-r">{idx + 1}</td>
                      <td className="p-2.5 font-semibold border-r">{st.student.name}</td>
                      <td className="p-2.5 text-center font-mono text-xs border-r">{st.student.nis || "-"}</td>
                      <td className="p-2.5 text-center border-r">{st.student.gender || "-"}</td>
                      <td className="p-2.5 text-center font-bold text-emerald-700 border-r bg-emerald-50/30">
                        {st.hadir}
                      </td>
                      <td className="p-2.5 text-center font-bold text-sky-700 border-r bg-sky-50/30">
                        {st.sakit}
                      </td>
                      <td className="p-2.5 text-center font-bold text-amber-700 border-r bg-amber-50/30">
                        {st.izin}
                      </td>
                      <td className="p-2.5 text-center font-bold text-rose-700 border-r bg-rose-50/30">
                        {st.alpha}
                      </td>
                      <td className="p-2.5 text-center font-bold font-mono">
                        {st.persentase}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
