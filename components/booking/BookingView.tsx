"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { subscribeToTable } from "@/lib/realtime";
import { getServerOffset } from "@/lib/serverTime";
import { ROOMS } from "@/lib/constants";
import { toDateKey } from "@/lib/calendar";
import RoomTabs from "./RoomTabs";
import ScheduleGrid from "./ScheduleGrid";
import BookingFormModal from "./BookingFormModal";
import DateInput from "@/components/ui/DateInput";
import type { RoomBooking } from "@/lib/supabase/types";

export default function BookingView() {
  const [roomId, setRoomId] = useState<string>(ROOMS[0].id);
  const [date, setDate] = useState<string>(() => toDateKey(new Date()));
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const dateChangedByUser = useRef(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<string>("");
  const [activeBooking, setActiveBooking] = useState<RoomBooking | null>(null);

  // Betulkan tarikh lalai supaya ikut tarikh sebenar (pelayan), bukan jam
  // peranti pengguna yang mungkin tersalah tetap — hanya jika pengguna belum
  // sendiri menukar tarikh.
  useEffect(() => {
    getServerOffset().then((offset) => {
      if (dateChangedByUser.current) return;
      setDate(toDateKey(new Date(Date.now() + offset)));
    });
  }, []);

  function handleDateChange(value: string) {
    dateChangedByUser.current = true;
    setDate(value);
  }

  const loadData = useCallback(async () => {
    const { data } = await supabase
      .from("room_bookings")
      .select("*")
      .eq("room_id", roomId)
      .eq("booking_date", date);
    setBookings(data ?? []);
    setLoading(false);
  }, [roomId, date]);

  useEffect(() => {
    setLoading(true);
    loadData();
    const unsub = subscribeToTable("room_bookings", loadData);
    return () => unsub();
  }, [loadData]);

  const bookingsBySlot = useMemo(() => {
    const map: Record<string, RoomBooking> = {};
    for (const b of bookings) {
      map[b.start_time.slice(0, 5)] = b;
    }
    return map;
  }, [bookings]);

  function handleSlotClick(slot: string, booking: RoomBooking | null) {
    setActiveSlot(slot);
    setActiveBooking(booking);
    setModalOpen(true);
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-slate-800">Tempahan Bilik</h2>

      <RoomTabs activeRoomId={roomId} onChange={setRoomId} />

      <div className="my-4 flex items-center gap-3">
        <label className="text-sm font-medium text-slate-600">Tarikh</label>
        <DateInput value={date} onChange={handleDateChange} className="w-36" />
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Memuatkan...</p>
      ) : (
        <>
          <ScheduleGrid bookingsBySlot={bookingsBySlot} onSlotClick={handleSlotClick} />
          <p className="mt-2 text-xs text-slate-400">
            Sila pilih tarikh dan waktu untuk membuat tempahan.
          </p>
        </>
      )}

      <BookingFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        roomId={roomId}
        bookingDate={date}
        slot={activeSlot}
        booking={activeBooking}
      />
    </div>
  );
}
