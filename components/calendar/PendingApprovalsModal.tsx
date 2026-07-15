"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useAdminGate } from "@/components/ui/AdminGate";
import { supabase } from "@/lib/supabase/client";
import { formatFullDateMs } from "@/lib/calendar";
import type { OfficeEvent } from "@/lib/supabase/types";

export default function PendingApprovalsModal({
  open,
  onClose,
  events,
}: {
  open: boolean;
  onClose: () => void;
  events: OfficeEvent[];
}) {
  const { requireAdmin, gateElement } = useAdminGate();

  async function handleApprove(event: OfficeEvent) {
    const ok = await requireAdmin();
    if (!ok) return;
    await supabase.from("office_events").update({ status: "diluluskan" }).eq("id", event.id);
  }

  async function handleReject(event: OfficeEvent) {
    if (!confirm(`Tolak permohonan "${event.title}"?`)) return;
    const ok = await requireAdmin();
    if (!ok) return;
    await supabase.from("office_events").delete().eq("id", event.id);
  }

  return (
    <Modal open={open} onClose={onClose} title="Permohonan Menunggu Kelulusan">
      <div className="space-y-2">
        {events.length === 0 && (
          <p className="py-2 text-sm text-slate-400">Tiada permohonan menunggu.</p>
        )}
        {events.map((ev) => (
          <div key={ev.id} className="rounded-md border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-slate-800">{ev.title}</span>
              <span className="shrink-0 text-xs font-semibold text-amber-700">
                {ev.start_time.slice(0, 5)}-{ev.end_time.slice(0, 5)}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {formatFullDateMs(ev.event_date)}
              {ev.location ? ` · Lokasi: ${ev.location}` : ""}
              {ev.organizer ? ` · Anjuran: ${ev.organizer}` : ""}
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="danger" onClick={() => handleReject(ev)}>
                Tolak
              </Button>
              <Button onClick={() => handleApprove(ev)}>Lulus</Button>
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
