-- Data awal (seed) cuti umum 2026 & 2027 untuk Semenanjung / Perak.
--
-- PENTING: Tarikh cuti tetap (Hari Pekerja, Hari Kebangsaan, Hari Malaysia,
-- Hari Krismas) adalah tepat kerana ia sentiasa jatuh pada tarikh Gregorian
-- yang sama setiap tahun. Tarikh cuti berdasarkan kalendar Islam/Cina/Hindu
-- (Hari Raya, Tahun Baru Cina, Wesak, Deepavali, dll) adalah ANGGARAN sahaja
-- berdasarkan unjuran kalendar, terutamanya bagi tahun 2027 yang masih jauh.
-- Nama diberi label "(anggaran)" untuk tarikh sebegini — staf perlu
-- kemaskini terus dalam sistem apabila JPM / Kerajaan Negeri Perak
-- mengumumkan tarikh rasmi (rujuk calendar.gov.my).
--
-- Hari Keputeraan Sultan Perak SENGAJA tidak dimasukkan kerana tarikh rasmi
-- tidak dapat disahkan — sila tambah secara manual dalam sistem bila
-- disahkan.

insert into public_holidays (holiday_date, name, scope, year) values
  -- ===== 2026 : Persekutuan =====
  ('2026-02-17', 'Tahun Baru Cina (Hari 1)', 'persekutuan', 2026),
  ('2026-02-18', 'Tahun Baru Cina (Hari 2)', 'persekutuan', 2026),
  ('2026-03-20', 'Hari Raya Aidilfitri (Hari 1) (anggaran)', 'persekutuan', 2026),
  ('2026-03-21', 'Hari Raya Aidilfitri (Hari 2) (anggaran)', 'persekutuan', 2026),
  ('2026-05-01', 'Hari Pekerja', 'persekutuan', 2026),
  ('2026-05-27', 'Hari Raya Aidiladha (anggaran)', 'persekutuan', 2026),
  ('2026-05-31', 'Hari Wesak (anggaran)', 'persekutuan', 2026),
  ('2026-06-01', 'Hari Keputeraan Yang di-Pertuan Agong (anggaran)', 'persekutuan', 2026),
  ('2026-06-16', 'Awal Muharram (anggaran)', 'persekutuan', 2026),
  ('2026-08-26', 'Maulidur Rasul (anggaran)', 'persekutuan', 2026),
  ('2026-08-31', 'Hari Kebangsaan', 'persekutuan', 2026),
  ('2026-09-16', 'Hari Malaysia', 'persekutuan', 2026),
  ('2026-11-08', 'Hari Deepavali (anggaran)', 'persekutuan', 2026),
  ('2026-12-25', 'Hari Krismas', 'persekutuan', 2026),
  -- ===== 2026 : Negeri Perak =====
  ('2026-02-01', 'Hari Thaipusam (anggaran)', 'negeri_perak', 2026),

  -- ===== 2027 : Persekutuan =====
  ('2027-02-06', 'Tahun Baru Cina (Hari 1) (anggaran)', 'persekutuan', 2027),
  ('2027-02-07', 'Tahun Baru Cina (Hari 2) (anggaran)', 'persekutuan', 2027),
  ('2027-03-10', 'Hari Raya Aidilfitri (Hari 1) (anggaran)', 'persekutuan', 2027),
  ('2027-03-11', 'Hari Raya Aidilfitri (Hari 2) (anggaran)', 'persekutuan', 2027),
  ('2027-05-01', 'Hari Pekerja', 'persekutuan', 2027),
  ('2027-05-17', 'Hari Raya Aidiladha (anggaran)', 'persekutuan', 2027),
  ('2027-05-20', 'Hari Wesak (anggaran)', 'persekutuan', 2027),
  ('2027-06-06', 'Awal Muharram (anggaran)', 'persekutuan', 2027),
  ('2027-06-07', 'Hari Keputeraan Yang di-Pertuan Agong (anggaran)', 'persekutuan', 2027),
  ('2027-08-16', 'Maulidur Rasul (anggaran)', 'persekutuan', 2027),
  ('2027-08-31', 'Hari Kebangsaan', 'persekutuan', 2027),
  ('2027-09-16', 'Hari Malaysia', 'persekutuan', 2027),
  ('2027-10-29', 'Hari Deepavali (anggaran)', 'persekutuan', 2027),
  ('2027-12-25', 'Hari Krismas', 'persekutuan', 2027),
  -- ===== 2027 : Negeri Perak =====
  ('2027-01-25', 'Hari Thaipusam (anggaran)', 'negeri_perak', 2027)
on conflict do nothing;
