"use client";

import { BOOKING_SLOTS } from "@/lib/constants";
import type { RoomBooking } from "@/lib/supabase/types";

function addHour(slot: string): string {
  const [h] = slot.split(":").map(Number);
  return `${String(h + 1).padStart(2, "0")}:00`;
}

export default function ScheduleGrid({
  bookingsBySlot,
  onSlotClick,
}: {
  bookingsBySlot: Record<string, RoomBooking>;
  onSlotClick: (slot: string, booking: RoomBooking | null) => void;
}) {
  return (
    <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
      {BOOKING_SLOTS.map((slot) => {
        const booking = bookingsBySlot[slot] ?? null;
        const isPending = booking?.status === "menunggu";
        const content = (
          <>
            <span className="w-28 shrink-0 text-sm font-medium text-slate-600">
              {slot} - {addHour(slot)}
            </span>
            {booking ? (
              <span className="flex-1 text-sm text-slate-700">
                <span className={`font-medium ${isPending ? "text-amber-700" : "text-vri-terracotta"}`}>
                  {booking.officer_name}
                </span>
                {" · "}
                {booking.department}
                {booking.purpose ? ` · ${booking.purpose}` : ""}
                {isPending && (
                  <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
                    Menunggu Kelulusan
                  </span>
                )}
              </span>
            ) : (
              <span className="flex-1 text-sm font-medium text-emerald-600">Tersedia</span>
            )}
          </>
        );

        if (!booking) {
          return (
            <div key={slot} className="flex w-full items-center justify-between bg-white px-4 py-3">
              {content}
            </div>
          );
        }

        return (
          <button
            key={slot}
            onClick={() => onSlotClick(slot, booking)}
            className={`flex w-full items-center justify-between px-4 py-3 text-left transition ${
              isPending ? "bg-amber-50 hover:bg-amber-100" : "bg-vri-terracotta/10 hover:bg-vri-terracotta/20"
            }`}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
