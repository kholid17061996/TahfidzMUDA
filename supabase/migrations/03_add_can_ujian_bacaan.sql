-- Menambahkan kolom can_ujian_bacaan untuk melacak apakah siswa bisa ikut ujian bacaan
ALTER TABLE santri ADD COLUMN can_ujian_bacaan BOOLEAN DEFAULT true;
