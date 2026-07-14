// Anggaran tarikh/masa sebenar berdasarkan header "Date" respons pelayan
// Supabase (bukan jam peranti pengguna, yang mungkin tersalah tetap).

let offsetPromise: Promise<number> | null = null;

async function fetchOffset(): Promise<number> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url) return 0;
    const res = await fetch(`${url}/rest/v1/`, {
      method: "HEAD",
      cache: "no-store",
      headers: key ? { apikey: key } : undefined,
    });
    const dateHeader = res.headers.get("date");
    if (dateHeader) {
      return new Date(dateHeader).getTime() - Date.now();
    }
  } catch {
    // Tiada sambungan rangkaian — guna jam peranti sebagai fallback.
  }
  return 0;
}

/** Dapatkan anjakan masa (ms) antara jam peranti dan jam pelayan. Cache
 * sepanjang sesi pelayar supaya cuma satu permintaan rangkaian diperlukan. */
export function getServerOffset(): Promise<number> {
  if (!offsetPromise) offsetPromise = fetchOffset();
  return offsetPromise;
}
