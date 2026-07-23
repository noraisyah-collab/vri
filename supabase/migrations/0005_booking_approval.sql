-- Kelulusan admin untuk tempahan bilik baharu.
-- Tempahan sedia ada dikira "diluluskan" (kekal dipaparkan); tempahan
-- baharu lalai "menunggu" sehingga admin luluskan. Slot tetap dikira
-- "diduduki" semasa menunggu supaya tiada tempahan berganda.

alter table room_bookings
  add column if not exists status text not null default 'menunggu'
    check (status in ('menunggu', 'diluluskan'));

update room_bookings set status = 'diluluskan' where status = 'menunggu';
