export type HolidayScope = "persekutuan" | "negeri_perak";

export interface Room {
  id: string;
  name: string;
  sort_order: number;
}

export interface PublicHoliday {
  id: string;
  holiday_date: string; // YYYY-MM-DD
  name: string;
  scope: HolidayScope;
  year: number;
  updated_at: string;
}

/** Status kelulusan admin, dikongsi acara pejabat & tempahan bilik. */
export type ApprovalStatus = "menunggu" | "diluluskan";

export interface OfficeEvent {
  id: string;
  title: string;
  event_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  location: string | null;
  organizer: string | null;
  status: ApprovalStatus;
  created_at: string;
  updated_at: string;
}

export interface RoomBooking {
  id: string;
  room_id: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  officer_name: string;
  department: string;
  purpose: string | null;
  status: ApprovalStatus;
  booking_group_id: string | null;
  created_at: string;
  updated_at: string;
}
