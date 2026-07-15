-- Kelulusan admin untuk program pejabat baharu.
-- Program sedia ada dikira "diluluskan" (supaya kekal dipaparkan); program
-- baharu lalai "menunggu" sehingga admin luluskan.

alter table office_events
  add column if not exists status text not null default 'menunggu'
    check (status in ('menunggu', 'diluluskan'));

update office_events set status = 'diluluskan' where status = 'menunggu';
