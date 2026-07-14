"use client";

import { buildMonthGrid, toDateKey, WEEKDAY_NAMES_MS } from "@/lib/calendar";
import DayCell from "./DayCell";
import type { OfficeEvent, PublicHoliday } from "@/lib/supabase/types";

export default function CalendarGrid({
  year,
  month,
  todayKey,
  holidaysByDate,
  eventsByDate,
  onAddEvent,
  onEditEvent,
  onEditHoliday,
  onViewDay,
}: {
  year: number;
  month: number;
  todayKey: string;
  holidaysByDate: Record<string, PublicHoliday[]>;
  eventsByDate: Record<string, OfficeEvent[]>;
  onAddEvent: (dateKey: string) => void;
  onEditEvent: (event: OfficeEvent) => void;
  onEditHoliday: (holiday: PublicHoliday) => void;
  onViewDay: (dateKey: string) => void;
}) {
  const days = buildMonthGrid(year, month);

  return (
    <div>
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-500">
        {WEEKDAY_NAMES_MS.map((d, idx) => (
          <div key={d} className={`py-2 ${idx >= 5 ? "text-amber-700" : ""}`}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((date) => {
          const key = toDateKey(date);
          return (
            <DayCell
              key={key}
              date={date}
              inCurrentMonth={date.getMonth() === month}
              isToday={key === todayKey}
              holidays={holidaysByDate[key] ?? []}
              events={eventsByDate[key] ?? []}
              onAddEvent={() => onAddEvent(key)}
              onEditEvent={onEditEvent}
              onEditHoliday={onEditHoliday}
              onViewDay={() => onViewDay(key)}
            />
          );
        })}
      </div>
    </div>
  );
}
