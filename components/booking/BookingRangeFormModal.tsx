"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import DateInput from "@/components/ui/DateInput";
import { supabase } from "@/lib/supabase/client";
import { ROOMS, BOOKING_HOURS } from "@/lib/constants";

function addHour(slot: string): string {
  const [h] = slot.split(":").map(Number);
  return `${String(h + 1).padStart(2, "0")}:00`;
}

/** Senarai slot sejam bermula dari start (termasuk) hingga end (tak termasuk). */
function slotsInRange(start: string, end: string): string[] {
  return BOOKING_HOURS.filter((h) => h >= start && h < end);
}

export default function BookingRangeFormModal({
  open,
  onClose,
  defaultRoomId,
  defaultDate,
}: {
  open: boolean;
  onClose: () => void;
  defaultRoomId: string;
  defaultDate: string;
}) {
  const [roomId, setRoomId] = useState(defaultRoomId);
  const [bookingDate, setBookingDate] = useState(defaultDate);
  const [startSlot, setStartSlot] = useState<string>(BOOKING_HOURS[0]);
  const [endSlot, setEndSlot] = useState<string>(BOOKING_HOURS[1]);
  const [officerName, setOfficerName] = useState("");
  const [department, setDepartment] = useState("");
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setRoomId(defaultRoomId);
      setBookingDate(defaultDate);
      setStartSlot(BOOKING_HOURS[0]);
      setEndSlot(BOOKING_HOURS[1]);
      setOfficerName("");
      setDepartment("");
      setPurpose("");
      setError(null);
    }
  }, [open, defaultRoomId, defaultDate]);

  const startOptions = BOOKING_HOURS.slice(0, -1);
  const endOptions = BOOKING_HOURS.filter((h) => h > startSlot);

  function handleStartChange(value: string) {
    setStartSlot(value);
    if (endSlot <= value) {
      const next = BOOKING_HOURS.find((h) => h > value);
      if (next) setEndSlot(next);
    }
  }

  async function handleSave() {
    if (!officerName.trim() || !department.trim()) {
      setError("Sila isi nama pegawai dan seksyen/unit.");
      return;
    }
    if (!bookingDate) {
      setError("Sila pilih tarikh.");
      return;
    }
    if (endSlot <= startSlot) {
      setError("Masa tamat mesti selepas masa mula.");
      return;
    }

    setSaving(true);
    setError(null);

    const slots = slotsInRange(startSlot, endSlot);

    // Semak semula tempahan sedia ada terkini (elak pertindihan) sebelum insert.
    const { data: existing, error: fetchError } = await supabase
      .from("room_bookings")
      .select("start_time")
      .eq("room_id", roomId)
      .eq("booking_date", bookingDate);

    if (fetchError) {
      setSaving(false);
      setError("Gagal semak tempahan sedia ada: " + fetchError.message);
      return;
    }

    const existingSlots = new Set((existing ?? []).map((b) => b.start_time.slice(0, 5)));
    const clashes = slots.filter((s) => existingSlots.has(s));
    if (clashes.length > 0) {
      setSaving(false);
      setError(`Bertindih dengan tempahan sedia ada pada ${clashes.join(", ")}. Sila pilih julat masa lain.`);
      return;
    }

    const groupId = crypto.randomUUID();

    const payloads = slots.map((s) => ({
      room_id: roomId,
      booking_date: bookingDate,
      start_time: s,
      end_time: addHour(s),
      officer_name: officerName.trim(),
      department: department.trim(),
      purpose: purpose.trim() || null,
      booking_group_id: groupId,
    }));

    const { error: insertError } = await supabase.from("room_bookings").insert(payloads);

    setSaving(false);
    if (insertError) {
      if (insertError.code === "23505") {
        setError("Salah satu slot dalam julat ini baru sahaja ditempah orang lain. Sila pilih julat masa lain.");
      } else {
        setError("Gagal simpan: " + insertError.message);
      }
      return;
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Tempah Bilik">
      <div className="space-y-3">
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Tempahan akan menunggu kelulusan admin sebelum disahkan. Slot tetap
          dikhaskan untuk anda semasa menunggu.
        </p>
        <div>
          <label className="block text-sm font-medium text-slate-600">Lokasi</label>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          >
            {ROOMS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600">Tarikh</label>
          <DateInput value={bookingDate} onChange={setBookingDate} className="mt-1" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-600">Masa Mula</label>
            <select
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={startSlot}
              onChange={(e) => handleStartChange(e.target.value)}
            >
              {startOptions.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Masa Tamat</label>
            <select
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={endSlot}
              onChange={(e) => setEndSlot(e.target.value)}
            >
              {endOptions.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600">Nama Pegawai</label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={officerName}
            onChange={(e) => setOfficerName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Seksyen/Unit</label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="cth: Seksyen Patologi"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Program / Tujuan</label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="cth: Mesyuarat Projek X"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button variant="terracotta" onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
