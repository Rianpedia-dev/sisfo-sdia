"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Clock, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface EventItem {
  id: string;
  title: string;
  start: string;
  end?: string;
  description?: string;
  backgroundColor?: string;
  extendedProps?: {
    kelas?: string;
    from?: string;
    deskripsi?: string;
  };
}

interface CalendarWidgetProps {
  canManage?: boolean;
}

export function CalendarWidget({ canManage = false }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDeleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
        setSelectedEvent(null);
        toast.success("Event berhasil dihapus.");
      } else {
        toast.error("Gagal menghapus event.");
      }
    } catch {
      toast.error("Terjadi kesalahan.");
    }
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const getEventsForDay = (d: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return events.filter((e) => e.start === dayStr);
  };

  return (
    <Card className="overflow-hidden border-emerald-500/20 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <CardTitle className="text-base font-bold">
          Kalender Kegiatan Sekolah
        </CardTitle>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm">
            {monthNames[month]} {year}
          </span>
          <div className="flex items-center gap-1 ml-2">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={prevMonth}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={nextMonth}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Day header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground pb-2">
          {dayNames.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((d, index) => {
            if (d === null) {
              return <div key={`empty-${index}`} className="min-h-[46px] sm:min-h-[70px] rounded-lg bg-muted/20" />;
            }

            const dayEvents = getEventsForDay(d);
            const isToday =
              new Date().getDate() === d &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <div
                key={`day-${d}`}
                onClick={() => {
                  if (dayEvents.length > 0) {
                    setSelectedEvent(dayEvents[0]);
                  }
                }}
                className={`min-h-[46px] sm:min-h-[70px] rounded-lg border p-1 sm:p-1.5 transition-colors ${
                  dayEvents.length > 0 ? "cursor-pointer" : ""
                } ${
                  isToday
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-border/60 hover:bg-muted/40"
                }`}
              >
                <div className="flex justify-center sm:justify-start">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] sm:text-xs font-semibold ${
                      isToday
                        ? "bg-emerald-600 text-white"
                        : "text-foreground/80"
                    }`}
                  >
                    {d}
                  </span>
                </div>

                {/* Mobile Dots Indicator */}
                {dayEvents.length > 0 && (
                  <div className="flex sm:hidden items-center justify-center gap-1 mt-1">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <span
                        key={ev.id}
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: ev.backgroundColor || "#0284c7" }}
                      />
                    ))}
                  </div>
                )}

                {/* Desktop/Tablet Event Badges */}
                <div className="mt-1 space-y-1 overflow-hidden hidden sm:block">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <button
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(ev);
                      }}
                      className="w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium text-white transition-opacity hover:opacity-85"
                      style={{ backgroundColor: ev.backgroundColor || "#0284c7" }}
                    >
                      {ev.title}
                    </button>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="block text-[10px] text-muted-foreground">
                      +{dayEvents.length - 2} lainnya
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* Modal Detail Event */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: selectedEvent?.backgroundColor || "#0284c7" }}
              />
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
            </div>
            <DialogDescription>
              Detail informasi agenda kegiatan sekolah
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-3 py-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 text-emerald-600" />
                <span>Tanggal: {selectedEvent.start} {selectedEvent.end ? `s/d ${selectedEvent.end}` : ""}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>Kelas: {selectedEvent.extendedProps?.kelas || "Semua Kelas"}</span>
              </div>
              {selectedEvent.extendedProps?.from && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Badge variant="outline">Oleh: {selectedEvent.extendedProps.from}</Badge>
                </div>
              )}
              {selectedEvent.description && (
                <div className="rounded-lg border bg-muted/40 p-3 text-foreground">
                  <p className="font-medium text-xs text-muted-foreground mb-1">Keterangan:</p>
                  <p>{selectedEvent.description}</p>
                </div>
              )}

              {canManage && (
                <div className="flex justify-end pt-2 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Hapus Event</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
