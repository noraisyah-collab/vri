"use client";

import type { OfficeEvent, PublicHoliday } from "@/lib/supabase/types";

export default function DayCell({
  date,
  inCurrentMonth,
  isToday,
  holidays,
  events,
  onAddEvent,
  onEditEvent,
  onEditHoliday,
}: {
  date: Date;
  inCurrentMonth: boolean;
  isToday: boolean;
  holidays: PublicHoliday[];
  events: OfficeEvent[];
  onAddEvent: () => void;
  onEditEvent: (event: OfficeEvent) => void;
  onEditHoliday: (holiday: PublicHoliday) => void;
}) {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  const bgClass = !inCurrentMonth
    ? "bg-slate-50 text-slate-400"
    : isWeekend
      ? "bg-amber-50/60"
      : "bg-white";

  return (
    <div
      className={`flex min-h-[110px] flex-col gap-1 border border-slate-100 p-2 text-left align-top ${bgClass}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-sm ${
            isToday ? "flex h-6 w-6 items-center justify-center rounded-full bg-vri-blue font-semibold text-white" : ""
          }`}
        >
          {date.getDate()}
        </span>
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

      {events.map((ev) => (
        <button
          key={ev.id}
          onClick={() => onEditEvent(ev)}
          className="flex w-full flex-col items-start rounded bg-vri-blue/10 px-1.5 py-0.5 text-left hover:bg-vri-blue/20"
          title={`${ev.title} (${ev.start_time.slice(0, 5)}-${ev.end_time.slice(0, 5)})`}
        >
          <span className="w-full truncate text-[11px] font-medium text-vri-blue">{ev.title}</span>
          <span className="w-full truncate text-[10px] text-vri-blue/70">
            {ev.start_time.slice(0, 5)}-{ev.end_time.slice(0, 5)}
          </span>
        </button>
      ))}
    </div>
  );
}
