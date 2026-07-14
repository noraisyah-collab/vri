"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase/client";
import { formatFullDateMs } from "@/lib/calendar";
import type { RoomBooking } from "@/lib/supabase/types";

function addHour(slot: string): string {
  const [h] = slot.split(":").map(Number);
  return `${String(h + 1).padStart(2, "0")}:00`;
}

export default function BookingFormModal({
  open,
  onClose,
  roomId,
  bookingDate,
  slot,
  booking,
}: {
  open: boolean;
  onClose: () => void;
  roomId: string;
  bookingDate: string;
  slot: string;
  booking: RoomBooking | null;
}) {
  const [officerName, setOfficerName] = useState("");
  const [department, setDepartment] = useState("");
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (booking) {
      setOfficerName(booking.officer_name);
      setDepartment(booking.department);
      setPurpose(booking.purpose ?? "");
    } else {
      setOfficerName("");
      setDepartment("");
      setPurpose("");
    }
    setError(null);
  }, [booking, open]);

  async function handleSave() {
    if (!officerName.trim() || !department.trim()) {
      setError("Sila isi nama pegawai dan seksyen/unit.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      room_id: roomId,
      booking_date: bookingDate,
      start_time: slot,
      end_time: addHour(slot),
      officer_name: officerName.trim(),
      department: department.trim(),
      purpose: purpose.trim() || null,
    };

    const result = booking
      ? await supabase.from("room_bookings").update(payload).eq("id", booking.id)
      : await supabase.from("room_bookings").insert(payload);

    setSaving(false);
    if (result.error) {
      if (result.error.code === "23505") {
        setError("Slot ini baru sahaja ditempah orang lain. Sila pilih slot lain.");
      } else {
        setError("Gagal simpan: " + result.error.message);
      }
      return;
    }
    onClose();
  }

  async function handleCancel() {
    if (!booking) return;
    if (!confirm("Batalkan tempahan ini?")) return;
    setSaving(true);
    const { error } = await supabase.from("room_bookings").delete().eq("id", booking.id);
    setSaving(false);
    if (error) {
      setError("Gagal batalkan: " + error.message);
      return;
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${booking ? "Edit" : "Tempah"} Slot ${slot}-${addHour(slot)}`}
    >
      <div className="space-y-3">
        <p className="text-lg font-semibold text-slate-700">
          {formatFullDateMs(bookingDate)}
        </p>
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
          <label className="block text-sm font-medium text-slate-600">Tujuan</label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="cth: Mesyuarat Projek X"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <div>
            {booking && (
              <Button variant="danger" onClick={handleCancel} disabled={saving}>
                Batalkan Tempahan
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Tutup
            </Button>
            <Button variant="terracotta" onClick={handleSave} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
