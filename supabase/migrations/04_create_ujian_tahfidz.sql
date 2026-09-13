-- 1. Tambah kolom materi_ujian_tahfidz dan can_ujian_tahfidz di tabel santri
ALTER TABLE santri ADD COLUMN materi_ujian_tahfidz TEXT;
ALTER TABLE santri ADD COLUMN can_ujian_tahfidz BOOLEAN DEFAULT true;

-- 2. Buat tabel ujian_tahfidz
CREATE TABLE ujian_tahfidz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
  penguji_id UUID REFERENCES penguji(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  materi_tahfidz TEXT NOT NULL,
  nilai_kelancaran INTEGER CHECK (nilai_kelancaran >= 0 AND nilai_kelancaran <= 100),
  nilai_ketepatan INTEGER CHECK (nilai_ketepatan >= 0 AND nilai_ketepatan <= 100),
  nilai_tajwid INTEGER CHECK (nilai_tajwid >= 0 AND nilai_tajwid <= 100),
  nilai_murojaah INTEGER CHECK (nilai_murojaah >= 0 AND nilai_murojaah <= 100),
  nilai_adab INTEGER CHECK (nilai_adab >= 0 AND nilai_adab <= 100),
  nilai_akhir DECIMAL(5,2),
  predikat TEXT,
  status_kelulusan TEXT,
  catatan_penguji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trigger untuk update waktu
CREATE TRIGGER update_ujian_tahfidz_modtime BEFORE UPDATE ON ujian_tahfidz FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
