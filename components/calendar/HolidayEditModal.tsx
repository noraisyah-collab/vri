"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import DateInput from "@/components/ui/DateInput";
import { useAdminGate } from "@/components/ui/AdminGate";
import { supabase } from "@/lib/supabase/client";
import type { PublicHoliday } from "@/lib/supabase/types";

export default function HolidayEditModal({
  open,
  onClose,
  holiday,
  defaultDate,
}: {
  open: boolean;
  onClose: () => void;
  holiday: PublicHoliday | null;
  defaultDate?: string;
}) {
  const [name, setName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [scope, setScope] = useState<"persekutuan" | "negeri_perak">("persekutuan");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { requireAdmin, gateElement } = useAdminGate();

  useEffect(() => {
    if (holiday) {
      setName(holiday.name);
      setHolidayDate(holiday.holiday_date);
      setScope(holiday.scope);
    } else {
      setName("");
      setHolidayDate(defaultDate ?? "");
      setScope("persekutuan");
    }
    setError(null);
  }, [holiday, defaultDate, open]);

  async function handleSave() {
    if (!name.trim()) {
      setError("Sila isi nama cuti.");
      return;
    }
    if (!holidayDate) {
      setError("Sila pilih tarikh.");
      return;
    }
    if (!holiday) {
      const ok = await requireAdmin();
      if (!ok) return;
    }
    setSaving(true);

    const payload = {
      name: name.trim(),
      holiday_date: holidayDate,
      scope,
      year: new Date(holidayDate).getFullYear(),
    };

    const { error } = holiday
      ? await supabase.from("public_holidays").update(payload).eq("id", holiday.id)
      : await supabase.from("public_holidays").insert(payload);

    setSaving(false);
    if (error) {
      setError("Gagal simpan: " + error.message);
      return;
    }
    onClose();
  }

  async function handleDelete() {
    if (!holiday) return;
    if (!confirm(`Padam cuti "${holiday.name}"?`)) return;
    const ok = await requireAdmin();
    if (!ok) return;
    setSaving(true);
    const { error } = await supabase.from("public_holidays").delete().eq("id", holiday.id);
    setSaving(false);
    if (error) {
      setError("Gagal padam: " + error.message);
      return;
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={holiday ? "Betulkan Cuti Umum" : "Tambah Cuti Umum"}>
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          {holiday
            ? "Betulkan tarikh/nama cuti umum apabila tarikh rasmi telah digazetkan."
            : "Tambah cuti umum yang belum ada dalam takwim (contoh: Hari Keputeraan Sultan Perak)."}
        </p>
        <div>
          <label className="block text-sm font-medium text-slate-600">Nama Cuti</label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="cth: Hari Keputeraan Sultan Perak"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Tarikh</label>
          <DateInput value={holidayDate} onChange={setHolidayDate} className="mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Skop</label>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={scope}
            onChange={(e) => setScope(e.target.value as "persekutuan" | "negeri_perak")}
          >
            <option value="persekutuan">Persekutuan</option>
            <option value="negeri_perak">Negeri Perak</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <div>
            {holiday && (
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
