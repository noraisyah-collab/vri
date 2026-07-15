"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { subscribeToTable } from "@/lib/realtime";
import { getServerOffset } from "@/lib/serverTime";
import { MONTH_NAMES_MS, toDateKey } from "@/lib/calendar";
import CalendarGrid from "./CalendarGrid";
import EventFormModal from "./EventFormModal";
import HolidayEditModal from "./HolidayEditModal";
import DayDetailModal from "./DayDetailModal";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import type { OfficeEvent, PublicHoliday } from "@/lib/supabase/types";

export default function CalendarView({ year }: { year: number }) {
  const [today, setToday] = useState(() => new Date());
  const [month, setMonth] = useState(() => (today.getFullYear() === year ? today.getMonth() : 0));
  const [monthTouched, setMonthTouched] = useState(false);
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [events, setEvents] = useState<OfficeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventModalDefaultDate, setEventModalDefaultDate] = useState("");
  const [editingEvent, setEditingEvent] = useState<OfficeEvent | null>(null);

  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  const [holidayModalDefaultDate, setHolidayModalDefaultDate] = useState("");
  const [editingHoliday, setEditingHoliday] = useState<PublicHoliday | null>(null);

  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const [dayDetailOpen, setDayDetailOpen] = useState(false);
  const [dayDetailDate, setDayDetailDate] = useState("");

  // Betulkan "hari ini"/bulan lalai ikut tarikh sebenar (pelayan), bukan jam
  // peranti pengguna — hanya jika pengguna belum sendiri navigasi bulan.
  useEffect(() => {
    getServerOffset().then((offset) => {
      const corrected = new Date(Date.now() + offset);
      setToday(corrected);
      if (!monthTouched && corrected.getFullYear() === year) {
        setMonth(corrected.getMonth());
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const todayKey = useMemo(() => toDateKey(today), [today]);

  function goToMonth(idx: number) {
    setMonthTouched(true);
    setMonth(idx);
  }

  const loadData = useCallback(async () => {
    const [holidaysRes, eventsRes] = await Promise.all([
      supabase.from("public_holidays").select("*").eq("year", year),
      supabase
        .from("office_events")
        .select("*")
        .gte("event_date", `${year}-01-01`)
        .lte("event_date", `${year}-12-31`),
    ]);
    setHolidays(holidaysRes.data ?? []);
    setEvents(eventsRes.data ?? []);
    setLoading(false);
  }, [year]);

  useEffect(() => {
    setLoading(true);
    loadData();
    const unsubHolidays = subscribeToTable("public_holidays", loadData);
    const unsubEvents = subscribeToTable("office_events", loadData);
    return () => {
      unsubHolidays();
      unsubEvents();
    };
  }, [loadData]);

  const holidaysByDate = useMemo(() => {
    const map: Record<string, PublicHoliday[]> = {};
    for (const h of holidays) {
      (map[h.holiday_date] ??= []).push(h);
    }
    return map;
  }, [holidays]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, OfficeEvent[]> = {};
    for (const e of events) {
      (map[e.event_date] ??= []).push(e);
    }
    for (const key in map) {
      map[key].sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    return map;
  }, [events]);

  function openAddEvent(dateKey: string) {
    setEditingEvent(null);
    setEventModalDefaultDate(dateKey);
    setEventModalOpen(true);
  }

  function openEditEvent(event: OfficeEvent) {
    setEditingEvent(event);
    setEventModalDefaultDate(event.event_date);
    setEventModalOpen(true);
  }

  function openEditHoliday(holiday: PublicHoliday) {
    setEditingHoliday(holiday);
    setHolidayModalDefaultDate(holiday.holiday_date);
    setHolidayModalOpen(true);
  }

  function openAddHoliday() {
    setEditingHoliday(null);
    setHolidayModalDefaultDate(todayKey);
    setHolidayModalOpen(true);
  }

  function openDayDetail(dateKey: string) {
    setDayDetailDate(dateKey);
    setDayDetailOpen(true);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => goToMonth(Math.max(0, month - 1))} disabled={month === 0}>
            &larr;
          </Button>
          <button
            onClick={() => setMonthPickerOpen(true)}
            className={`flex w-56 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-lg font-medium transition hover:bg-opacity-80 ${
              year === 2027
                ? "border-vri-purple/20 bg-vri-purple/10 text-vri-purple"
                : "border-vri-blue/20 bg-vri-blue/10 text-vri-blue"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <line x1="16" y1="3" x2="16" y2="7" />
              <line x1="8" y1="3" x2="8" y2="7" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {MONTH_NAMES_MS[month]} {year}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <Button variant="secondary" onClick={() => goToMonth(Math.min(11, month + 1))} disabled={month === 11}>
            &rarr;
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={openAddHoliday}>+ Tambah Cuti</Button>
          <Button onClick={() => openAddEvent(todayKey)}>+ Tambah Program</Button>
        </div>
      </div>

      <div className="mb-4 flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-emerald-600" /> Cuti Persekutuan
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-amber-600" /> Cuti Negeri Perak
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-indigo-500" /> Program Pejabat
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Memuatkan...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <div className="min-w-[700px]">
            <CalendarGrid
              year={year}
              month={month}
              todayKey={todayKey}
              holidaysByDate={holidaysByDate}
              eventsByDate={eventsByDate}
              onAddEvent={openAddEvent}
              onEditEvent={openEditEvent}
              onEditHoliday={openEditHoliday}
              onViewDay={openDayDetail}
            />
          </div>
        </div>
      )}

      <EventFormModal
        open={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        defaultDate={eventModalDefaultDate}
        event={editingEvent}
      />
      <HolidayEditModal
        open={holidayModalOpen}
        onClose={() => setHolidayModalOpen(false)}
        holiday={editingHoliday}
        defaultDate={holidayModalDefaultDate}
      />

      <DayDetailModal
        open={dayDetailOpen}
        onClose={() => setDayDetailOpen(false)}
        dateKey={dayDetailDate}
        holidays={holidaysByDate[dayDetailDate] ?? []}
        events={eventsByDate[dayDetailDate] ?? []}
        onAddEvent={() => {
          setDayDetailOpen(false);
          openAddEvent(dayDetailDate);
        }}
        onEditEvent={(event) => {
          setDayDetailOpen(false);
          openEditEvent(event);
        }}
        onEditHoliday={(holiday) => {
          setDayDetailOpen(false);
          openEditHoliday(holiday);
        }}
      />

      <Modal open={monthPickerOpen} onClose={() => setMonthPickerOpen(false)} title={`Pilih Bulan ${year}`}>
        <div className="grid grid-cols-4 gap-2">
          {MONTH_NAMES_MS.map((name, idx) => (
            <button
              key={name}
              onClick={() => {
                goToMonth(idx);
                setMonthPickerOpen(false);
              }}
              className={`rounded-md px-2 py-3 text-sm font-medium transition ${
                idx === month ? "bg-vri-blue text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
