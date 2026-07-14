"use client";

import type { OfficeEvent, PublicHoliday } from "@/lib/supabase/types";

const MAX_EVENTS_SHOWN = 2;

export default function DayCell({
  date,
  inCurrentMonth,
  isToday,
  holidays,
  events,
  onAddEvent,
  onEditEvent,
  onEditHoliday,
  onViewDay,
}: {
  date: Date;
  inCurrentMonth: boolean;
  isToday: boolean;
  holidays: PublicHoliday[];
  events: OfficeEvent[];
  onAddEvent: () => void;
  onEditEvent: (event: OfficeEvent) => void;
  onEditHoliday: (holiday: PublicHoliday) => void;
  onViewDay: () => void;
}) {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  const bgClass = !inCurrentMonth
    ? "bg-slate-50 text-slate-400"
    : isWeekend
      ? "bg-amber-50/60"
      : "bg-white";

  const visibleEvents = events.slice(0, MAX_EVENTS_SHOWN);
  const hiddenCount = events.length - visibleEvents.length;

  return (
    <div
      className={`flex min-h-[110px] flex-col gap-1 border border-slate-100 p-2 text-left align-top ${bgClass}`}
    >
      <div className="flex items-center justify-between">
        <button
          onClick={onViewDay}
          className={`text-sm hover:underline ${
            isToday ? "flex h-6 w-6 items-center justify-center rounded-full bg-vri-blue font-semibold text-white hover:no-underline" : ""
          }`}
          title="Lihat semua program hari ini"
        >
          {date.getDate()}
        </button>
        <button
          onClick={onAddEvent}
          className="text-xs text-slate-400 hover:text-vri-blue"
          title="Tambah program"
        >
          +
        </button>
      </div>

      {holidays.map((h) => (
        <button
          key={h.id}
          onClick={() => onEditHoliday(h)}
          className={`truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium text-white ${
            h.scope === "persekutuan" ? "bg-emerald-600" : "bg-amber-600"
          }`}
          title={h.name}
        >
          {h.name}
        </button>
      ))}

      {visibleEvents.map((ev) => (
        <button
          key={ev.id}
          onClick={() => onEditEvent(ev)}
          className="flex w-full flex-col items-start rounded border border-teal-200 bg-teal-50 px-1.5 py-0.5 text-left hover:bg-teal-100"
          title={`${ev.title} (${ev.start_time.slice(0, 5)}-${ev.end_time.slice(0, 5)})`}
        >
          <span className="w-full truncate text-[11px] font-medium text-teal-800">{ev.title}</span>
          <span className="w-full truncate text-[10px] text-teal-700/80">
            {ev.start_time.slice(0, 5)}-{ev.end_time.slice(0, 5)}
          </span>
        </button>
      ))}

      {hiddenCount > 0 && (
        <button
          onClick={onViewDay}
          className="w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium text-slate-500 hover:bg-slate-100"
        >
          +{hiddenCount} lagi program
        </button>
      )}
    </div>
  );
}
