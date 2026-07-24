"use client";

import { useMemo } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useAdminGate } from "@/components/ui/AdminGate";
import { supabase } from "@/lib/supabase/client";
import { formatFullDateMs } from "@/lib/calendar";
import { ROOMS } from "@/lib/constants";
import type { RoomBooking } from "@/lib/supabase/types";

function roomName(roomId: string): string {
  return ROOMS.find((r) => r.id === roomId)?.name ?? roomId;
}

interface PendingGroup {
  ids: string[];
  roomId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  officerName: string;
  department: string;
  purpose: string | null;
}

/** Kumpulkan baris tempahan sejam-sejam yang datang dari satu penyerahan
 * julat masa (kongsi booking_group_id) jadi satu "program" untuk kelulusan. */
function groupBookings(bookings: RoomBooking[]): PendingGroup[] {
  const byGroup = new Map<string, RoomBooking[]>();
  for (const b of bookings) {
    const key = b.booking_group_id ?? b.id;
    (byGroup.get(key) ?? byGroup.set(key, []).get(key)!).push(b);
  }

  return Array.from(byGroup.values()).map((rows) => {
    const sorted = [...rows].sort((a, b) => a.start_time.localeCompare(b.start_time));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    return {
      ids: sorted.map((r) => r.id),
      roomId: first.room_id,
      bookingDate: first.booking_date,
      startTime: first.start_time.slice(0, 5),
      endTime: last.end_time.slice(0, 5),
      officerName: first.officer_name,
      department: first.department,
      purpose: first.purpose,
    };
  });
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
  const groups = useMemo(() => groupBookings(bookings), [bookings]);

  async function handleApprove(group: PendingGroup) {
    const ok = await requireAdmin();
    if (!ok) return;
    await supabase.from("room_bookings").update({ status: "diluluskan" }).in("id", group.ids);
  }

  async function handleReject(group: PendingGroup) {
    if (!confirm(`Tolak tempahan "${group.officerName}"?`)) return;
    const ok = await requireAdmin();
    if (!ok) return;
    await supabase.from("room_bookings").delete().in("id", group.ids);
  }

  return (
    <Modal open={open} onClose={onClose} title="Permohonan Tempahan Menunggu Kelulusan">
      <div className="space-y-2">
        {groups.length === 0 && (
          <p className="py-2 text-sm text-slate-400">Tiada permohonan menunggu.</p>
        )}
        {groups.map((g) => (
          <div key={g.ids.join(",")} className="rounded-md border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-slate-800">{roomName(g.roomId)}</span>
              <span className="shrink-0 text-xs font-semibold text-amber-700">
                {g.startTime}-{g.endTime}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {formatFullDateMs(g.bookingDate)} · {g.officerName} · {g.department}
              {g.purpose ? ` · ${g.purpose}` : ""}
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="danger" onClick={() => handleReject(g)}>
                Tolak
              </Button>
              <Button variant="terracotta" onClick={() => handleApprove(g)}>
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
