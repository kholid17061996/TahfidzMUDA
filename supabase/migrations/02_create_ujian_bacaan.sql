CREATE TABLE ujian_bacaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
  penguji_id UUID REFERENCES penguji(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  surat_ayat TEXT NOT NULL,
  nilai_makharijul INTEGER CHECK (nilai_makharijul >= 0 AND nilai_makharijul <= 100),
  nilai_tajwid INTEGER CHECK (nilai_tajwid >= 0 AND nilai_tajwid <= 100),
  nilai_kelancaran INTEGER CHECK (nilai_kelancaran >= 0 AND nilai_kelancaran <= 100),
  nilai_fashahah INTEGER CHECK (nilai_fashahah >= 0 AND nilai_fashahah <= 100),
  nilai_mad INTEGER CHECK (nilai_mad >= 0 AND nilai_mad <= 100),
  nilai_waqaf INTEGER CHECK (nilai_waqaf >= 0 AND nilai_waqaf <= 100),
  nilai_akhir DECIMAL(5,2),
  predikat TEXT,
  status_kelulusan TEXT,
  catatan_penguji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger untuk update waktu
CREATE TRIGGER update_ujian_bacaan_modtime BEFORE UPDATE ON ujian_bacaan FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
