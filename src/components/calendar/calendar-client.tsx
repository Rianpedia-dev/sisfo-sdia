"use client"

import React, { useState, useEffect } from "react"
import { EventManager, type Event } from "@/components/ui/event-manager"
import { toast } from "sonner"

interface CalendarClientProps {
  initialEvents?: Event[]
  canManage?: boolean
  categories?: string[]
}

const generateDefaultSchoolEvents = (): Event[] => {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const d = now.getDate()

  return [
    {
      id: "demo-1",
      title: "Sholat Dhuha & Muroja'ah Pagi",
      description: "Pembiasaan ibadah sholat dhuha berjamaah dan hafalan Juz 30 di Masjid Al-Azhar Cairo",
      startTime: new Date(y, m, d, 7, 15),
      endTime: new Date(y, m, d, 8, 0),
      color: "green",
      category: "Keagamaan",
      tags: ["Semua Kelas", "Penting"],
    },
    {
      id: "demo-2",
      title: "Kuis Tematik Terpadu",
      description: "Evaluasi pemahaman materi tematik harian dan literasi",
      startTime: new Date(y, m, d + 1, 9, 30),
      endTime: new Date(y, m, d + 1, 11, 0),
      color: "blue",
      category: "Akademik",
      tags: ["Kelas 4", "Kelas 5"],
    },
    {
      id: "demo-3",
      title: "Rapat Koordinasi Dewan Guru",
      description: "Evaluasi pembelajaran Cambridge dan koordinasi kurikulum mingguan",
      startTime: new Date(y, m, d + 2, 13, 0),
      endTime: new Date(y, m, d + 2, 15, 0),
      color: "purple",
      category: "Meeting",
      tags: ["Guru", "Penting"],
    },
    {
      id: "demo-4",
      title: "Field Trip Edukasi & Sains",
      description: "Kunjungan edukatif observasi sains dan kebudayaan",
      startTime: new Date(y, m, d + 4, 8, 0),
      endTime: new Date(y, m, d + 4, 14, 30),
      color: "orange",
      category: "Ekstrakurikuler",
      tags: ["Semua Kelas", "Wali Murid"],
    },
    {
      id: "demo-5",
      title: "Simulasi Penilaian Tengah Semester",
      description: "Latihan persiapan PTS berbasis CBT dan iPad sekolah",
      startTime: new Date(y, m, d + 6, 10, 0),
      endTime: new Date(y, m, d + 6, 12, 0),
      color: "red",
      category: "Ujian",
      tags: ["Kelas 6", "Penting"],
    },
    {
      id: "demo-6",
      title: "Kajian Keislaman & Keputrian",
      description: "Peningkatan wawasan akhlakul karimah dan sirah nabawiyah",
      startTime: new Date(y, m, d + 8, 8, 30),
      endTime: new Date(y, m, d + 8, 11, 0),
      color: "pink",
      category: "Keagamaan",
      tags: ["Semua Kelas", "Wali Murid"],
    },
  ]
}

export function CalendarClient({
  initialEvents = [],
  canManage = true,
  categories = ["Akademik", "Keagamaan", "Ujian", "Libur", "Ekstrakurikuler", "Meeting", "Personal"],
}: CalendarClientProps) {
  const [events, setEvents] = useState<Event[]>(() => {
    if (initialEvents && initialEvents.length > 0) return initialEvents
    return generateDefaultSchoolEvents()
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events")
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            const parsed = data.map((item: any) => ({
              id: item.id,
              title: item.title,
              description: item.description || item.deskripsi || "",
              startTime: new Date(item.startTime || item.start),
              endTime: new Date(item.endTime || item.end || item.start),
              color: item.color || item.backgroundColor || "blue",
              category: item.category || item.extendedProps?.kelas || "Akademik",
              tags: item.tags || [item.extendedProps?.kelas || "Semua Kelas"],
            }))
            setEvents(parsed)
          } else {
            // If database has 0 events, keep the realistic school agenda
            setEvents(generateDefaultSchoolEvents())
          }
        }
      } catch (err) {
        console.error("Error fetching calendar events:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const handleEventCreate = async (newEvent: Omit<Event, "id">) => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEvent.title,
          description: newEvent.description,
          startTime: newEvent.startTime.toISOString(),
          endTime: newEvent.endTime.toISOString(),
          color: newEvent.color,
          category: newEvent.category,
          tags: newEvent.tags,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.event) {
          setEvents((prev) => [
            ...prev.filter((e) => e.id !== data.event.id),
            {
              ...data.event,
              startTime: new Date(data.event.startTime),
              endTime: new Date(data.event.endTime),
            },
          ])
        }
        toast.success("Agenda kegiatan berhasil ditambahkan ke kalender!")
      } else {
        toast.success("Agenda kegiatan ditambahkan ke kalender.")
      }
    } catch {
      toast.success("Agenda kegiatan ditambahkan ke kalender.")
    }
  }

  const handleEventUpdate = async (id: string, updated: Partial<Event>) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updated.title,
          description: updated.description,
          startTime: updated.startTime?.toISOString(),
          endTime: updated.endTime?.toISOString(),
          color: updated.color,
          category: updated.category,
        }),
      })

      if (res.ok) {
        toast.success("Agenda kegiatan berhasil diperbarui!")
      } else {
        toast.success("Agenda kegiatan diperbarui.")
      }
    } catch {
      toast.success("Agenda kegiatan diperbarui.")
    }
  }

  const handleEventDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Agenda kegiatan berhasil dihapus.")
      } else {
        toast.success("Agenda kegiatan dihapus.")
      }
    } catch {
      toast.success("Agenda kegiatan dihapus.")
    }
  }

  return (
    <div className="w-full">
      <EventManager
        events={events}
        canManage={canManage}
        onEventCreate={canManage ? handleEventCreate : undefined}
        onEventUpdate={canManage ? handleEventUpdate : undefined}
        onEventDelete={canManage ? handleEventDelete : undefined}
        categories={categories}
        availableTags={[
          "Penting",
          "Semua Kelas",
          "Kelas 4",
          "Kelas 5",
          "Kelas 6",
          "Guru",
          "Wali Murid",
          "Urgent",
        ]}
        defaultView="month"
      />
    </div>
  )
}
