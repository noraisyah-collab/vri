import { supabase } from "./supabase/client";

let channelCounter = 0;

/**
 * Dengar perubahan (insert/update/delete) pada satu jadual Supabase dan
 * jalankan `onChange` bila berlaku — dipanggil dalam useEffect komponen
 * client supaya semua pelayar yang terbuka nampak kemaskini serta-merta.
 *
 * Nama channel diberi sufiks unik supaya beberapa komponen yang
 * mendengar jadual yang sama pada masa sama tak berlanggar (Supabase
 * tak benarkan tambah callback pada channel yang dah subscribe).
 */
export function subscribeToTable(table: string, onChange: () => void) {
  const channel = supabase
    .channel(`realtime:${table}:${++channelCounter}`)
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
