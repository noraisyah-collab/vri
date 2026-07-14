"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { formatFullDateMs } from "@/lib/calendar";
import type { OfficeEvent, PublicHoliday } from "@/lib/supabase/types";

export default function DayDetailModal({
  open,
  onClose,
  dateKey,
  holidays,
  events,
  onAddEvent,
  onEditEvent,
  onEditHoliday,
}: {
  open: boolean;
  onClose: () => void;
  dateKey: string;
  holidays: PublicHoliday[];
  events: OfficeEvent[];
  onAddEvent: () => void;
  onEditEvent: (event: OfficeEvent) => void;
  onEditHoliday: (holiday: PublicHoliday) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={dateKey ? formatFullDateMs(dateKey) : ""}>
      <div className="space-y-2">
        {holidays.map((h) => (
          <button
            key={h.id}
            onClick={() => onEditHoliday(h)}
            className={`block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-white ${
              h.scope === "persekutuan" ? "bg-emerald-600" : "bg-amber-600"
            }`}
          >
            {h.name}
          </button>
        ))}

        {events.length === 0 && holidays.length === 0 && (
          <p className="py-2 text-sm text-slate-400">Tiada program pada hari ini.</p>
        )}

        {events.map((ev) => (
          <button
            key={ev.id}
            onClick={() => onEditEvent(ev)}
            className="block w-full rounded-md border border-vri-blue/20 bg-vri-blue/5 px-3 py-2 text-left hover:bg-vri-blue/10"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-slate-800">{ev.title}</span>
              <span className="shrink-0 text-xs font-semibold text-vri-blue">
                {ev.start_time.slice(0, 5)}-{ev.end_time.slice(0, 5)}
              </span>
            </div>
            {(ev.location || ev.organizer) && (
              <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                {ev.location && <div>Lokasi: {ev.location}</div>}
                {ev.organizer && <div>Anjuran: {ev.organizer}</div>}
              </div>
            )}
          </button>
        ))}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
          <Button onClick={onAddEvent}>+ Tambah Program</Button>
        </div>
      </div>
    </Modal>
  );
}
