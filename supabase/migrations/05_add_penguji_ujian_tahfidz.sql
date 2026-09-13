-- Tambah kolom penguji_ujian_tahfidz_id di tabel santri
-- Kolom ini menyimpan siapa yang akan menguji santri ini pada Ujian Tahfidz
-- Bersifat sementara, bisa di-reset oleh Admin setelah ujian selesai
ALTER TABLE santri ADD COLUMN penguji_ujian_tahfidz_id UUID REFERENCES penguji(id) ON DELETE SET NULL;
