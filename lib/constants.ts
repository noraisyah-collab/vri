export const ROOMS = [
  { id: "seminar_patologi", name: "Bilik Seminar Patologi" },
  { id: "seminar_apdrtc", name: "Bilik Seminar APDRTC" },
  { id: "mesyuarat_mofy", name: "Bilik Mesyuarat MOFY" },
] as const;

// Slot tempahan sejam, 8 pagi hingga 5 petang (slot terakhir bermula 4 ptg)
export const BOOKING_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00",
] as const;

export const CALENDAR_YEARS = [2026, 2027] as const;

export const YEAR_THEME: Record<number, { accent: string; bg: string; label: string }> = {
  2026: { accent: "vri-blue", bg: "bg-vri-blue", label: "Takwim 2026" },
  2027: { accent: "vri-purple", bg: "bg-vri-purple", label: "Takwim 2027" },
};
