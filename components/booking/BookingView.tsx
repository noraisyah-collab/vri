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
import BookingRangeFormModal from "./BookingRangeFormModal";
import BookingCalendarView from "./BookingCalendarView";
import PendingBookingApprovalsModal from "./PendingBookingApprovalsModal";
import DateInput from "@/components/ui/DateInput";
import Button from "@/components/ui/Button";
import type { RoomBooking } from "@/lib/supabase/types";

export default function BookingView() {
  const [roomId, setRoomId] = useState<string>(ROOMS[0].id);
  const [date, setDate] = useState<string>(() => toDateKey(new Date()));
  const [viewMode, setViewMode] = useState<"senarai" | "kalendar">("senarai");
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const dateChangedByUser = useRef(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<string>("");
  const [activeBooking, setActiveBooking] = useState<RoomBooking | null>(null);

  const [rangeModalOpen, setRangeModalOpen] = useState(false);

  const [pendingBookings, setPendingBookings] = useState<RoomBooking[]>([]);
  const [pendingModalOpen, setPendingModalOpen] = useState(false);

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

  const loadPending = useCallback(async () => {
    const { data } = await supabase
      .from("room_bookings")
      .select("*")
      .eq("status", "menunggu")
      .order("booking_date", { ascending: true });
    setPendingBookings(data ?? []);
  }, []);

  useEffect(() => {
    loadPending();
    const unsub = subscribeToTable("room_bookings", loadPending);
    return () => unsub();
  }, [loadPending]);

  const bookingsBySlot = useMemo(() => {
    const map: Record<string, RoomBooking> = {};
    for (const b of bookings) {
      map[b.start_time.slice(0, 5)] = b;
    }
    return map;
  }, [bookings]);

  const pendingGroupCount = useMemo(() => {
    return new Set(pendingBookings.map((b) => b.booking_group_id ?? b.id)).size;
  }, [pendingBookings]);

  function handleSlotClick(slot: string, booking: RoomBooking | null) {
    setActiveSlot(slot);
    setActiveBooking(booking);
    setModalOpen(true);
  }

  function handleSelectDateFromCalendar(dateKey: string) {
    handleDateChange(dateKey);
    setViewMode("senarai");
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Tempahan Bilik</h2>
        <div className="flex gap-2">
          {pendingGroupCount > 0 && (
            <Button variant="secondary" onClick={() => setPendingModalOpen(true)}>
              Permohonan Menunggu ({pendingGroupCount})
            </Button>
          )}
          <Button variant="terracotta" onClick={() => setRangeModalOpen(true)}>
            + Tempah Bilik
          </Button>
        </div>
      </div>

      <RoomTabs activeRoomId={roomId} onChange={setRoomId} />

      <div className="my-4 flex items-center justify-between gap-3">
        {viewMode === "senarai" ? (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-600">Tarikh</label>
            <DateInput value={date} onChange={handleDateChange} className="w-36" />
          </div>
        ) : (
          <div />
        )}
        <div className="flex gap-2">
          <Button
            variant={viewMode === "senarai" ? "terracotta" : "secondary"}
            onClick={() => setViewMode("senarai")}
          >
            Senarai Harian
          </Button>
          <Button
            variant={viewMode === "kalendar" ? "terracotta" : "secondary"}
            onClick={() => setViewMode("kalendar")}
          >
            Kalendar Bulanan
          </Button>
        </div>
      </div>

      {viewMode === "kalendar" ? (
        <BookingCalendarView roomId={roomId} onSelectDate={handleSelectDateFromCalendar} />
      ) : loading ? (
        <p className="text-sm text-slate-400">Memuatkan...</p>
      ) : (
        <>
          <ScheduleGrid bookingsBySlot={bookingsBySlot} onSlotClick={handleSlotClick} />
          <p className="mt-2 text-xs text-slate-400">
            Klik butang "+ Tempah Bilik" di atas untuk buat tempahan baharu. Klik slot yang
            telah ditempah untuk lihat butiran atau batalkan.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Kelulusan permohonan dan pembatalan tempahan bilik boleh dirujuk kepada
            Dr Aisyah Han, Cik Siti Rahmah, atau En Syamil.
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

      <BookingRangeFormModal
        open={rangeModalOpen}
        onClose={() => setRangeModalOpen(false)}
        defaultRoomId={roomId}
        defaultDate={date}
      />

      <PendingBookingApprovalsModal
        open={pendingModalOpen}
        onClose={() => setPendingModalOpen(false)}
        bookings={pendingBookings}
      />
    </div>
  );
}
