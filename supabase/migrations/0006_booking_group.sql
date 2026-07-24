-- Kumpulan tempahan: kaitkan slot sejam-sejam yang dicipta daripada SATU
-- penyerahan julat masa (contoh 9am-12pm) supaya admin boleh lulus/tolak
-- keseluruhan program sekali gus, bukan jam demi jam.

alter table room_bookings add column if not exists booking_group_id uuid;

create index if not exists idx_room_bookings_group on room_bookings (booking_group_id);
