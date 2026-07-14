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

export interface OfficeEvent {
  id: string;
  title: string;
  event_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  location: string | null;
  organizer: string | null;
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
  created_at: string;
  updated_at: string;
}

// Jenis Database untuk hint jenis supabase-js (ringkas, bukan generate penuh)
export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: Room;
        Insert: Partial<Room> & Pick<Room, "id" | "name">;
        Update: Partial<Room>;
      };
      public_holidays: {
        Row: PublicHoliday;
        Insert: Omit<PublicHoliday, "id" | "updated_at"> & { id?: string };
        Update: Partial<Omit<PublicHoliday, "id">>;
      };
      office_events: {
        Row: OfficeEvent;
        Insert: Omit<OfficeEvent, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Omit<OfficeEvent, "id">>;
      };
      room_bookings: {
        Row: RoomBooking;
        Insert: Omit<RoomBooking, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Omit<RoomBooking, "id">>;
      };
    };
  };
}
