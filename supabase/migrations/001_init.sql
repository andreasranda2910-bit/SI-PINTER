-- =============================================
-- SI PINTER - Skema Database Supabase
-- Irban V Inspektorat Kabupaten Sumba Barat
-- =============================================

-- Tabel profil pengguna (extend auth.users bawaan Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT NOT NULL,
  nip         TEXT UNIQUE,
  jabatan     TEXT,
  role        TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin','operator','viewer')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel kategori dokumen
CREATE TABLE IF NOT EXISTS public.kategori_dokumen (
  id          SERIAL PRIMARY KEY,
  kode        TEXT UNIQUE NOT NULL,
  nama        TEXT NOT NULL,
  deskripsi   TEXT,
  warna       TEXT DEFAULT '#3b82f6',
  ikon        TEXT DEFAULT 'folder',
  urutan      INT DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed kategori dokumen
INSERT INTO public.kategori_dokumen (kode, nama, deskripsi, warna, ikon, urutan) VALUES
  ('RENSTRA',  'Renstra',              'Rencana Strategis',                                '#1d4ed8', 'target',        1),
  ('RENJA',    'Renja',                'Rencana Kerja Tahunan',                             '#2563eb', 'calendar',      2),
  ('RKA',      'RKA',                  'Rencana Kerja dan Anggaran',                        '#059669', 'file-text',     3),
  ('DPA',      'DPA',                  'Dokumen Pelaksanaan Anggaran',                      '#0891b2', 'clipboard',     4),
  ('DPPA',     'DPPA',                 'Dokumen Perubahan Pelaksanaan Anggaran',            '#7c3aed', 'edit',          5),
  ('POK',      'POK',                  'Petunjuk Operasional Kegiatan',                     '#c2410c', 'list',          6),
  ('LAKIP',    'LKjIP / LAKIP',        'Laporan Kinerja Instansi Pemerintah',               '#b45309', 'award',         7),
  ('LAPBUL',   'Laporan Bulanan',      'Laporan Kegiatan Bulanan',                          '#0f766e', 'bar-chart',     8),
  ('LAPTRI',   'Laporan Triwulan',     'Laporan Kegiatan Triwulanan',                       '#0369a1', 'trending-up',   9),
  ('LAPSEM',   'Laporan Semester',     'Laporan Kegiatan Semester',                         '#4338ca', 'pie-chart',    10),
  ('LAPTAH',   'Laporan Tahunan',      'Laporan Kegiatan Tahunan',                          '#dc2626', 'book-open',    11),
  ('SK',       'SK / Keputusan',       'Surat Keputusan dan Keputusan Kepala',              '#9333ea', 'stamp',        12),
  ('SURAT',    'Surat Dinas',          'Surat Masuk dan Keluar',                            '#64748b', 'mail',         13),
  ('LAINNYA',  'Lainnya',              'Dokumen lain yang tidak terklasifikasi',             '#94a3b8', 'more-horizontal',14)
ON CONFLICT (kode) DO NOTHING;

-- Tabel utama dokumen
CREATE TABLE IF NOT EXISTS public.dokumen (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul           TEXT NOT NULL,
  deskripsi       TEXT,
  kategori_id     INT REFERENCES public.kategori_dokumen(id),
  tahun_anggaran  INT NOT NULL,
  nomor_dokumen   TEXT,
  tanggal_dokumen DATE,
  file_path       TEXT NOT NULL,   -- path di Supabase Storage
  file_name       TEXT NOT NULL,
  file_size       BIGINT,
  file_type       TEXT,
  tags            TEXT[],
  status          TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif','arsip','draft')),
  uploaded_by     UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel log aktivitas
CREATE TABLE IF NOT EXISTS public.activity_log (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id),
  action      TEXT NOT NULL,  -- 'upload','download','delete','update','view'
  dokumen_id  UUID REFERENCES public.dokumen(id) ON DELETE SET NULL,
  detail      JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dokumen          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kategori_dokumen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log     ENABLE ROW LEVEL SECURITY;

-- Profiles: setiap user bisa lihat semua profil, tapi hanya bisa update miliknya
CREATE POLICY "profiles_select_all"  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own"  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own"  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Dokumen: semua user login bisa baca; operator/admin bisa insert; admin bisa hapus
CREATE POLICY "dokumen_select_authenticated" ON public.dokumen
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "dokumen_insert_operator" ON public.dokumen
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','operator'))
  );
CREATE POLICY "dokumen_update_operator" ON public.dokumen
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','operator'))
  );
CREATE POLICY "dokumen_delete_admin" ON public.dokumen
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Kategori: semua bisa lihat
CREATE POLICY "kategori_select_all" ON public.kategori_dokumen FOR SELECT USING (true);

-- Activity log: admin bisa lihat semua, user hanya lihat miliknya
CREATE POLICY "log_select_own" ON public.activity_log
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "log_insert_authenticated" ON public.activity_log
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- Storage bucket
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('dokumen-sipinter', 'dokumen-sipinter', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_select_auth" ON storage.objects
  FOR SELECT USING (bucket_id = 'dokumen-sipinter' AND auth.role() = 'authenticated');
CREATE POLICY "storage_insert_operator" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'dokumen-sipinter' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','operator'))
  );
CREATE POLICY "storage_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'dokumen-sipinter' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- Fungsi otomatis buat profil setelah signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'viewer'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp otomatis
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER dokumen_updated_at   BEFORE UPDATE ON public.dokumen   FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER profiles_updated_at  BEFORE UPDATE ON public.profiles  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
