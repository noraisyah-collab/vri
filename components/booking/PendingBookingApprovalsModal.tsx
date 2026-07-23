"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useAdminGate } from "@/components/ui/AdminGate";
import { supabase } from "@/lib/supabase/client";
import { formatFullDateMs } from "@/lib/calendar";
import { ROOMS } from "@/lib/constants";
import type { RoomBooking } from "@/lib/supabase/types";

function addHour(slot: string): string {
  const [h] = slot.split(":").map(Number);
  return `${String(h + 1).padStart(2, "0")}:00`;
}

function roomName(roomId: string): string {
  return ROOMS.find((r) => r.id === roomId)?.name ?? roomId;
}

export default function PendingBookingApprovalsModal({
  open,
  onClose,
  bookings,
}: {
  open: boolean;
  onClose: () => void;
  bookings: RoomBooking[];
}) {
  const { requireAdmin, gateElement } = useAdminGate();

  async function handleApprove(booking: RoomBooking) {
    const ok = await requireAdmin();
    if (!ok) return;
    await supabase.from("room_bookings").update({ status: "diluluskan" }).eq("id", booking.id);
  }

  async function handleReject(booking: RoomBooking) {
    if (!confirm(`Tolak tempahan "${booking.officer_name}"?`)) return;
    const ok = await requireAdmin();
    if (!ok) return;
    await supabase.from("room_bookings").delete().eq("id", booking.id);
  }

  return (
    <Modal open={open} onClose={onClose} title="Permohonan Tempahan Menunggu Kelulusan">
      <div className="space-y-2">
        {bookings.length === 0 && (
          <p className="py-2 text-sm text-slate-400">Tiada permohonan menunggu.</p>
        )}
        {bookings.map((b) => (
          <div key={b.id} className="rounded-md border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-slate-800">{roomName(b.room_id)}</span>
              <span className="shrink-0 text-xs font-semibold text-amber-700">
                {b.start_time.slice(0, 5)}-{addHour(b.start_time.slice(0, 5))}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {formatFullDateMs(b.booking_date)} · {b.officer_name} · {b.department}
              {b.purpose ? ` · ${b.purpose}` : ""}
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="danger" onClick={() => handleReject(b)}>
                Tolak
              </Button>
              <Button variant="terracotta" onClick={() => handleApprove(b)}>
                Lulus
              </Button>
            </div>
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
      {gateElement}
    </Modal>
  );
}
