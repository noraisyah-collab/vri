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
        return (
          <button
            key={slot}
            onClick={() => onSlotClick(slot, booking)}
            className={`flex w-full items-center justify-between px-4 py-3 text-left transition ${
              booking ? "bg-vri-terracotta/10 hover:bg-vri-terracotta/20" : "bg-white hover:bg-slate-50"
            }`}
          >
            <span className="w-28 shrink-0 text-sm font-medium text-slate-600">
              {slot} - {addHour(slot)}
            </span>
            {booking ? (
              <span className="flex-1 text-sm text-slate-700">
                <span className="font-medium text-vri-terracotta">{booking.officer_name}</span>
                {" · "}
                {booking.department}
                {booking.purpose ? ` · ${booking.purpose}` : ""}
              </span>
            ) : (
              <span className="flex-1 text-sm text-slate-400">Kosong — klik untuk tempah</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
