-- Skema pangkalan data: Sistem Takwim & Tempahan Bilik VRI Ipoh
-- Jalankan fail ini dalam Supabase SQL Editor (atau `supabase db push`).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. rooms — senarai tetap 3 bilik
-- ---------------------------------------------------------------------
create table if not exists rooms (
  id text primary key,
  name text not null,
  sort_order int not null default 0
);

insert into rooms (id, name, sort_order) values
  ('seminar_patologi', 'Bilik Seminar Patologi', 1),
  ('seminar_apdrtc', 'Bilik Seminar APDRTC', 2),
  ('mesyuarat_mofy', 'Bilik Mesyuarat MOFY', 3)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 2. public_holidays — cuti umum (persekutuan + negeri Perak)
--    Staf boleh betulkan tarikh/nama di sini bila tarikh rasmi digazetkan.
-- ---------------------------------------------------------------------
create table if not exists public_holidays (
  id uuid primary key default gen_random_uuid(),
  holiday_date date not null,
  name text not null,
  scope text not null check (scope in ('persekutuan', 'negeri_perak')),
  year int not null,
  updated_at timestamptz not null default now(),
  constraint public_holidays_unique unique (holiday_date, scope, name)
);

create index if not exists idx_public_holidays_year on public_holidays (year);

-- ---------------------------------------------------------------------
-- 3. office_events — acara pejabat (CRUD penuh oleh staf)
-- ---------------------------------------------------------------------
create table if not exists office_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  start_time time not null,
  end_time time not null,
  location text,
  organizer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint office_events_time_check check (end_time > start_time)
);

create index if not exists idx_office_events_date on office_events (event_date);

-- ---------------------------------------------------------------------
-- 4. room_bookings — tempahan bilik, slot sejam 08:00-17:00
--    UNIQUE constraint menghalang dua tempahan pada bilik/tarikh/slot sama.
-- ---------------------------------------------------------------------
create table if not exists room_bookings (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references rooms (id),
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  officer_name text not null,
  department text not null,
  purpose text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint room_bookings_time_check check (end_time > start_time),
  constraint room_bookings_no_overlap unique (room_id, booking_date, start_time)
);

create index if not exists idx_room_bookings_date on room_bookings (room_id, booking_date);

-- ---------------------------------------------------------------------
-- Row Level Security
-- Buat masa ini sistem tiada login (akses terbuka kepada sesiapa yang ada
-- link). Policy dibuka penuh untuk role anon supaya senang diketatkan nanti
-- bila login staf ditambah — tukar policy sahaja, skema jadual tak berubah.
-- ---------------------------------------------------------------------
alter table rooms enable row level security;
alter table public_holidays enable row level security;
alter table office_events enable row level security;
alter table room_bookings enable row level security;

create policy "rooms_read_all" on rooms for select using (true);

create policy "public_holidays_read_all" on public_holidays for select using (true);
create policy "public_holidays_write_all" on public_holidays for all using (true) with check (true);

create policy "office_events_read_all" on office_events for select using (true);
create policy "office_events_write_all" on office_events for all using (true) with check (true);

create policy "room_bookings_read_all" on room_bookings for select using (true);
create policy "room_bookings_write_all" on room_bookings for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- Realtime — daftar jadual yang perlu kemaskini serta-merta di semua pelayar
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table office_events;
alter publication supabase_realtime add table room_bookings;
alter publication supabase_realtime add table public_holidays;
