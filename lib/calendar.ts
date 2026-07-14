import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
} from "date-fns";

/** Bina senarai tarikh untuk grid kalendar bulanan (termasuk hari bulan
 * sebelum/selepas supaya minggu genap 7 hari). */
export function buildMonthGrid(year: number, month: number): Date[] {
  const first = startOfMonth(new Date(year, month, 1));
  const last = endOfMonth(first);
  const gridStart = startOfWeek(first, { weekStartsOn: 1 }); // Isnin
  const gridEnd = endOfWeek(last, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export const MONTH_NAMES_MS = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
];

export const WEEKDAY_NAMES_MS = [
  "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad",
];

/** Tukar "2026-07-14" -> "14 JULAI 2026". */
export function formatFullDateMs(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!y || !m || !d) return dateKey;
  return `${d} ${MONTH_NAMES_MS[m - 1].toUpperCase()} ${y}`;
}
