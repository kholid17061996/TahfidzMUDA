-- 1. Buat Tabel Penguji
CREATE TABLE penguji (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  kode_penguji TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Copy data dari tabel pengajar saat ini ke tabel penguji
INSERT INTO penguji (nama, kode_penguji, status, created_at, updated_at)
SELECT nama, kode_pengajar, status, created_at, updated_at FROM pengajar;

-- 3. Trigger untuk update waktu
CREATE TRIGGER update_penguji_modtime BEFORE UPDATE ON penguji FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
