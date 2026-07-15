"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import DateInput from "@/components/ui/DateInput";
import { useAdminGate } from "@/components/ui/AdminGate";
import { supabase } from "@/lib/supabase/client";
import type { OfficeEvent } from "@/lib/supabase/types";

export default function EventFormModal({
  open,
  onClose,
  defaultDate,
  event,
}: {
  open: boolean;
  onClose: () => void;
  defaultDate: string;
  event: OfficeEvent | null;
}) {
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { requireAdmin, gateElement } = useAdminGate();

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setEventDate(event.event_date);
      setStartTime(event.start_time.slice(0, 5));
      setEndTime(event.end_time.slice(0, 5));
      setLocation(event.location ?? "");
      setOrganizer(event.organizer ?? "");
    } else {
      setTitle("");
      setEventDate(defaultDate);
      setStartTime("09:00");
      setEndTime("10:00");
      setLocation("");
      setOrganizer("");
    }
    setError(null);
  }, [event, defaultDate, open]);

  async function handleSave() {
    if (!title.trim()) {
      setError("Sila isi nama program.");
      return;
    }
    if (endTime <= startTime) {
      setError("Masa tamat mesti selepas masa mula.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      title: title.trim(),
      event_date: eventDate,
      start_time: startTime,
      end_time: endTime,
      location: location.trim() || null,
      organizer: organizer.trim() || null,
    };

    const result = event
      ? await supabase.from("office_events").update(payload).eq("id", event.id)
      : await supabase.from("office_events").insert(payload);

    setSaving(false);
    if (result.error) {
      setError("Gagal simpan: " + result.error.message);
      return;
    }
    onClose();
  }

  async function handleDelete() {
    if (!event) return;
    if (!confirm(`Padam program "${event.title}"?`)) return;
    const ok = await requireAdmin();
    if (!ok) return;
    setSaving(true);
    const { error } = await supabase.from("office_events").delete().eq("id", event.id);
    setSaving(false);
    if (error) {
      setError("Gagal padam: " + error.message);
      return;
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={event ? "Edit Program Pejabat" : "Tambah Program Pejabat"}>
      <div className="space-y-3">
        {!event && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Program baharu akan menunggu kelulusan admin sebelum dipaparkan dalam Takwim.
          </p>
        )}
        {event && event.status === "menunggu" && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Program ini masih menunggu kelulusan admin.
          </p>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-600">Nama Program</label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="cth: Mesyuarat Bulanan Jabatan"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Tarikh</label>
          <DateInput value={eventDate} onChange={setEventDate} className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-600">Masa Mula</label>
            <input
              type="time"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Masa Tamat</label>
            <input
              type="time"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Lokasi</label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="cth: Dewan Serbaguna VRI"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Anjuran</label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
            placeholder="cth: Bahagian Pentadbiran"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <div>
            {event && (
              <Button variant="danger" onClick={handleDelete} disabled={saving}>
                Padam
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </div>
      {gateElement}
    </Modal>
  );
}
