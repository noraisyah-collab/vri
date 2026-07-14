import { supabase } from "./supabase/client";

/**
 * Dengar perubahan (insert/update/delete) pada satu jadual Supabase dan
 * jalankan `onChange` bila berlaku — dipanggil dalam useEffect komponen
 * client supaya semua pelayar yang terbuka nampak kemaskini serta-merta.
 */
export function subscribeToTable(table: string, onChange: () => void) {
  const channel = supabase
    .channel(`realtime:${table}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table },
      () => onChange()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
