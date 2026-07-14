"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import DateInput from "@/components/ui/DateInput";
import { supabase } from "@/lib/supabase/client";
import type { PublicHoliday } from "@/lib/supabase/types";

export default function HolidayEditModal({
  open,
  onClose,
  holiday,
}: {
  open: boolean;
  onClose: () => void;
  holiday: PublicHoliday | null;
}) {
  const [name, setName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [scope, setScope] = useState<"persekutuan" | "negeri_perak">("persekutuan");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (holiday) {
      setName(holiday.name);
      setHolidayDate(holiday.holiday_date);
      setScope(holiday.scope);
    }
    setError(null);
  }, [holiday, open]);

  async function handleSave() {
    if (!holiday) return;
    if (!name.trim()) {
      setError("Sila isi nama cuti.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("public_holidays")
      .update({
        name: name.trim(),
        holiday_date: holidayDate,
        scope,
        year: new Date(holidayDate).getFullYear(),
      })
      .eq("id", holiday.id);
    setSaving(false);
    if (error) {
      setError("Gagal simpan: " + error.message);
      return;
    }
    onClose();
  }

  if (!holiday) return null;

  return (
    <Modal open={open} onClose={onClose} title="Betulkan Cuti Umum">
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          Gunakan borang ini untuk membetulkan tarikh/nama cuti umum apabila
          tarikh rasmi telah digazetkan.
        </p>
        <div>
          <label className="block text-sm font-medium text-slate-600">Nama Cuti</label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
