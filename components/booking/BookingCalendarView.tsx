"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { subscribeToTable } from "@/lib/realtime";
import { buildMonthGrid, toDateKey, MONTH_NAMES_MS, WEEKDAY_NAMES_MS } from "@/lib/calendar";
import Button from "@/components/ui/Button";
import type { ApprovalStatus, RoomBooking } from "@/lib/supabase/types";

const MAX_GROUPS_SHOWN = 2;

interface BookingGroup {
  startTime: string;
  endTime: string;
  label: string;
  status: ApprovalStatus;
}

/** Gabungkan slot berturutan yang kongsi tujuan/pegawai sama jadi satu blok. */
function buildGroups(dayBookings: RoomBooking[]): BookingGroup[] {
  const sorted = [...dayBookings].sort((a, b) => a.start_time.localeCompare(b.start_time));
  const groups: BookingGroup[] = [];

  for (const b of sorted) {
    const startTime = b.start_time.slice(0, 5);
    const endTime = b.end_time.slice(0, 5);
    const label = b.purpose?.trim() || b.officer_name;
    const last = groups[groups.length - 1];

    if (last && last.endTime === startTime && last.label === label && last.status === b.status) {
      last.endTime = endTime;
    } else {
      groups.push({ startTime, endTime, label, status: b.status });
    }
  }

  return groups;
}

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

  const groupsByDate = useMemo(() => {
    const byDate: Record<string, RoomBooking[]> = {};
    for (const b of bookings) {
      (byDate[b.booking_date] ??= []).push(b);
    }
    const result: Record<string, BookingGroup[]> = {};
    for (const date in byDate) {
      result[date] = buildGroups(byDate[date]);
    }
    return result;
  }, [bookings]);

  const days = buildMonthGrid(year, month);
  const todayKey = toDateKey(now);

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
                const groups = groupsByDate[key] ?? [];
                const visibleGroups = groups.slice(0, MAX_GROUPS_SHOWN);
                const hiddenCount = groups.length - visibleGroups.length;

                const bgClass = !inMonth
                  ? "bg-slate-50 text-slate-300"
                  : isWeekend
                    ? "bg-amber-50/60"
                    : "bg-white";

                return (
                  <button
                    key={key}
                    onClick={() => onSelectDate(key)}
                    className={`flex min-h-[92px] flex-col items-start gap-1 border border-slate-100 p-2 text-left transition hover:bg-slate-50 ${bgClass}`}
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
                    {visibleGroups.map((g, i) => (
                      <span
                        key={i}
                        className={`w-full truncate rounded px-1.5 py-0.5 text-[11px] font-medium ${
                          g.status === "menunggu"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-vri-terracotta/10 text-vri-terracotta"
                        }`}
                        title={`${g.startTime}-${g.endTime} ${g.label}`}
                      >
                        {g.startTime}-{g.endTime} {g.label}
                      </span>
                    ))}
                    {hiddenCount > 0 && (
                      <span className="w-full truncate rounded px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
                        +{hiddenCount} lagi
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
