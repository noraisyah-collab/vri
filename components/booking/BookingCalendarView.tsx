"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { subscribeToTable } from "@/lib/realtime";
import { buildMonthGrid, toDateKey, MONTH_NAMES_MS, WEEKDAY_NAMES_MS } from "@/lib/calendar";
import { BOOKING_SLOTS } from "@/lib/constants";
import Button from "@/components/ui/Button";
import type { RoomBooking } from "@/lib/supabase/types";

export default function BookingCalendarView({
  roomId,
  onSelectDate,
}: {
  roomId: string;
  onSelectDate: (dateKey: string) => void;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const monthEnd = toDateKey(new Date(year, month + 1, 0));

  const loadData = useCallback(async () => {
    const { data } = await supabase
      .from("room_bookings")
      .select("*")
      .eq("room_id", roomId)
      .gte("booking_date", monthStart)
      .lte("booking_date", monthEnd);
    setBookings(data ?? []);
    setLoading(false);
  }, [roomId, monthStart, monthEnd]);

  useEffect(() => {
    setLoading(true);
    loadData();
    const unsub = subscribeToTable("room_bookings", loadData);
    return () => unsub();
  }, [loadData]);

  const countByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of bookings) {
      map[b.booking_date] = (map[b.booking_date] ?? 0) + 1;
    }
    return map;
  }, [bookings]);

  const days = buildMonthGrid(year, month);
  const todayKey = toDateKey(now);
  const totalSlots = BOOKING_SLOTS.length;

  function goToMonth(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setMonth(newMonth);
    setYear(newYear);
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Button variant="secondary" onClick={() => goToMonth(-1)}>
          &larr;
        </Button>
        <span className="w-40 text-center text-lg font-medium text-slate-800">
          {MONTH_NAMES_MS[month]} {year}
        </span>
        <Button variant="secondary" onClick={() => goToMonth(1)}>
          &rarr;
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Memuatkan...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <div className="min-w-[700px]">
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
                const inMonth = date.getMonth() === month;
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const count = countByDate[key] ?? 0;

                const bgClass = !inMonth
                  ? "bg-slate-50 text-slate-300"
                  : isWeekend
                    ? "bg-amber-50/60"
                    : "bg-white";

                return (
                  <button
                    key={key}
                    onClick={() => onSelectDate(key)}
                    className={`flex min-h-[84px] flex-col items-start gap-1.5 border border-slate-100 p-2 text-left transition hover:bg-slate-50 ${bgClass}`}
                  >
                    <span
                      className={`text-sm ${
                        key === todayKey
                          ? "flex h-6 w-6 items-center justify-center rounded-full bg-vri-terracotta font-semibold text-white"
                          : ""
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {count > 0 && (
                      <span className="rounded bg-vri-terracotta/10 px-1.5 py-0.5 text-[11px] font-medium text-vri-terracotta">
                        {count}/{totalSlots} ditempah
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
