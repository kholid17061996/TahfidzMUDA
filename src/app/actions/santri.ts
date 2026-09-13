'use server'

import { createClient } from '@supabase/supabase-js'
import { getCurrentAcademicPeriod } from '@/utils/dateHelpers'

export async function searchSantriAction(query: string) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Kunci konfigurasi SUPABASE_SERVICE_ROLE_KEY belum disetel.' }
  }

  // Gunakan admin client agar bisa membypass RLS saat belum login
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    const { data, error } = await supabaseAdmin
      .from('santri')
      .select('id, nama, nis, kelas(nama)')
      .ilike('nama', `%${query}%`)
      .eq('status', 'aktif')
      .limit(5)

    if (error) {
      return { error: 'Gagal mencari data: ' + error.message }
    }

    return { data }
  } catch (err: any) {
    return { error: 'Terjadi kesalahan sistem.' }
  }
}

export async function getSantriDashboardData(santriId: string) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Kunci konfigurasi SUPABASE_SERVICE_ROLE_KEY belum disetel.' }
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    const { semester, tahun_ajaran } = getCurrentAcademicPeriod()
    
    const [resSantri, resCapaian, resTarget, resLaporan, resQuran] = await Promise.all([
      supabaseAdmin.from('santri').select('*, kelas(nama), pengajar(nama)').eq('id', santriId).single(),
      supabaseAdmin.from('setoran_hafalan').select('*').eq('santri_id', santriId).order('created_at', { ascending: false }),
      supabaseAdmin.from('target_santri')
        .select('*')
        .eq('santri_id', santriId)
        .eq('semester', semester)
        .eq('tahun_ajaran', tahun_ajaran)
        .maybeSingle(),
      supabaseAdmin.from('laporan_pekanan').select('*').eq('santri_id', santriId).order('tanggal_laporan', { ascending: false }).limit(1).maybeSingle(),
      supabaseAdmin.from('master_quran').select('*')
    ])

    if (resSantri.error) {
      return { error: 'Gagal memuat data santri: ' + resSantri.error.message }
    }

    return { 
      data: {
        santri: resSantri.data,
        riwayatCapaian: resCapaian.data || [],
        targetSantri: resTarget.data,
        laporanTerakhir: resLaporan.data,
        masterQuran: resQuran.data || []
      }
    }
  } catch (err: any) {
    return { error: 'Terjadi kesalahan sistem.' }
  }
}

export async function getAllSantriNamesAction() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Kunci konfigurasi SUPABASE_SERVICE_ROLE_KEY belum disetel.' }
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    const { data, error } = await supabaseAdmin
      .from('santri')
      .select('nama')
      .eq('status', 'aktif')

    if (error) {
      return { error: 'Gagal mengambil data: ' + error.message }
    }

    const names = data.map(s => s.nama)
    return { data: names }
  } catch (err: any) {
    return { error: 'Terjadi kesalahan sistem.' }
  }
}

export async function getAllUserEmailsAction() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Kunci konfigurasi SUPABASE_SERVICE_ROLE_KEY belum disetel.' }
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      return { error: 'Gagal mengambil data email.' }
    }

    const emails = data.users.map(u => u.email).filter(Boolean) as string[]
    return { data: emails }
  } catch (err: any) {
    return { error: 'Terjadi kesalahan sistem.' }
  }
}

export async function getAllSantriForPengujiAction() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Kunci konfigurasi SUPABASE_SERVICE_ROLE_KEY belum disetel.' }
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    const [resSantri, resKelas] = await Promise.all([
      supabaseAdmin
        .from('santri')
        .select('id, nama, kelas_id, kelas(nama), materi_ujian')
        .eq('status', 'aktif')
        .eq('can_ujian_bacaan', true)
        .order('nama', { ascending: true }),
      supabaseAdmin
        .from('kelas')
        .select('id, nama')
        .eq('status', 'aktif')
        .order('nama', { ascending: true })
    ])

    if (resSantri.error) {
      return { error: 'Gagal mengambil data santri: ' + resSantri.error.message }
    }
    
    if (resKelas.error) {
      return { error: 'Gagal mengambil data kelas: ' + resKelas.error.message }
    }

    return { 
      data: {
        santri: resSantri.data,
        kelas: resKelas.data
      } 
    }
  } catch (err: any) {
    return { error: 'Terjadi kesalahan sistem.' }
  }
}

export async function allowRetestBacaanAction(santriId: string) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Kunci konfigurasi SUPABASE_SERVICE_ROLE_KEY belum disetel.' }
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    const { error } = await supabaseAdmin
      .from('santri')
      .update({ can_ujian_bacaan: true })
      .eq('id', santriId)

    if (error) {
      return { error: 'Gagal mengizinkan ulang ujian: ' + error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { error: 'Terjadi kesalahan sistem.' }
  }
}

export async function getAllSantriForPengujiTahfidzAction() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Kunci konfigurasi SUPABASE_SERVICE_ROLE_KEY belum disetel.' }
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    const [resSantri, resKelas] = await Promise.all([
      supabaseAdmin
        .from('santri')
        .select('id, nama, kelas_id, kelas(nama), materi_ujian_tahfidz')
        .eq('status', 'aktif')
        .eq('can_ujian_tahfidz', true)
        .order('nama', { ascending: true }),
      supabaseAdmin
        .from('kelas')
        .select('id, nama')
        .eq('status', 'aktif')
        .order('nama', { ascending: true })
    ])

    if (resSantri.error) {
      return { error: 'Gagal mengambil data santri: ' + resSantri.error.message }
    }
    
    if (resKelas.error) {
      return { error: 'Gagal mengambil data kelas: ' + resKelas.error.message }
    }

    return { 
      data: {
        santri: resSantri.data,
        kelas: resKelas.data
      } 
    }
  } catch (err: any) {
    return { error: 'Terjadi kesalahan sistem.' }
  }
}

export async function allowRetestTahfidzAction(santriId: string) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Kunci konfigurasi SUPABASE_SERVICE_ROLE_KEY belum disetel.' }
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    const { error } = await supabaseAdmin
      .from('santri')
      .update({ can_ujian_tahfidz: true })
      .eq('id', santriId)

    if (error) {
      return { error: 'Gagal mengizinkan ulang ujian tahfidz: ' + error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { error: 'Terjadi kesalahan sistem.' }
  }
}

// --- DISTRIBUSI UJIAN TAHFIDZ ---

// Helper: shuffle array secara acak (Fisher-Yates)
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function distribusiUjianTahfidzAction(namaPengajarDikecualikan: string = 'Siti Aisyah') {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Kunci konfigurasi SUPABASE_SERVICE_ROLE_KEY belum disetel.' }
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    // 1. Ambil semua pengajar
    const { data: allPengajar, error: errPengajar } = await supabaseAdmin
      .from('pengajar')
      .select('id, nama')
    if (errPengajar || !allPengajar) return { error: 'Gagal mengambil data pengajar.' }

    // 2. Pisahkan: pengajar dikecualikan (Siti Aisyah) vs 3 penguji aktif
    const pengajarDikecualikan = allPengajar.find(p => p.nama === namaPengajarDikecualikan)
    const pengujiAktif = allPengajar.filter(p => p.nama !== namaPengajarDikecualikan)

    if (pengujiAktif.length < 2) return { error: 'Jumlah penguji aktif kurang dari 2.' }

    // 3. Ambil semua santri aktif beserta pengajar_id mereka
    const { data: semuaSantri, error: errSantri } = await supabaseAdmin
      .from('santri')
      .select('id, nama, pengajar_id')
      .eq('status', 'aktif')
    if (errSantri || !semuaSantri) return { error: 'Gagal mengambil data santri.' }

    // 4. Kelompokkan santri berdasarkan pengajar
    const santriABK = pengajarDikecualikan
      ? shuffleArray(semuaSantri.filter(s => s.pengajar_id === pengajarDikecualikan.id))
      : []
    
    // Santri milik masing-masing penguji aktif (tidak boleh diuji sendiri)
    const kelompokPerPenguji: Record<string, string[]> = {}
    for (const pg of pengujiAktif) {
      const milikMereka = shuffleArray(semuaSantri.filter(s => s.pengajar_id === pg.id)).map(s => s.id)
      kelompokPerPenguji[pg.id] = milikMereka
    }

    // 5. Hitung target jumlah per penguji (supaya merata)
    const totalSantri = semuaSantri.length
    const jumlahPenguji = pengujiAktif.length
    const targetPerPenguji = Math.ceil(totalSantri / jumlahPenguji)

    // 6. Buat antrian distribusi per penguji
    // Format: { pengujiId: [list santriId yang akan diuji oleh penguji ini] }
    const hasilDistribusi: Record<string, string[]> = {}
    for (const pg of pengujiAktif) hasilDistribusi[pg.id] = []

    // 6a. Distribusi santri ABK (dari Siti Aisyah) secara merata ke semua penguji
    let idx = 0
    for (const santri of santriABK) {
      hasilDistribusi[pengujiAktif[idx % jumlahPenguji].id].push(santri.id)
      idx++
    }

    // 6b. Distribusi santri milik masing-masing penguji aktif ke penguji LAIN secara merata
    // Gunakan round-robin: siswa pengajar A → dibagi ke semua penguji selain A
    for (const pg of pengujiAktif) {
      const santrinya = kelompokPerPenguji[pg.id]
      // Daftar penguji yang boleh menerima (selain diri sendiri)
      const penerimaBoleh = shuffleArray(pengujiAktif.filter(p => p.id !== pg.id))
      
      let i = 0
      for (const santriId of santrinya) {
        hasilDistribusi[penerimaBoleh[i % penerimaBoleh.length].id].push(santriId)
        i++
      }
    }

    // 7. Simpan ke database: update kolom penguji_ujian_tahfidz_id untuk setiap santri
    const updates: Promise<any>[] = []
    for (const [pengujiId, daftarSantriId] of Object.entries(hasilDistribusi)) {
      if (daftarSantriId.length === 0) continue
      updates.push(
        Promise.resolve(
          supabaseAdmin
            .from('santri')
            .update({ penguji_ujian_tahfidz_id: pengujiId })
            .in('id', daftarSantriId)
        )
      )
    }

    await Promise.all(updates)

    // 8. Return ringkasan distribusi
    const ringkasan = pengujiAktif.map(pg => ({
      nama: pg.nama,
      jumlah: hasilDistribusi[pg.id].length
    }))

    return { success: true, ringkasan }
  } catch (err: any) {
    return { error: 'Terjadi kesalahan: ' + err.message }
  }
}

export async function resetDistribusiUjianTahfidzAction() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Kunci konfigurasi SUPABASE_SERVICE_ROLE_KEY belum disetel.' }
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    const { error } = await supabaseAdmin
      .from('santri')
      .update({ penguji_ujian_tahfidz_id: null })
      .not('id', 'is', null) // update semua baris

    if (error) return { error: 'Gagal mereset distribusi: ' + error.message }
    return { success: true }
  } catch (err: any) {
    return { error: 'Terjadi kesalahan: ' + err.message }
  }
}

export async function getSantriByPengujiUjianTahfidzAction(pengujiId: string) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Kunci konfigurasi SUPABASE_SERVICE_ROLE_KEY belum disetel.' }
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    const [resSantri, resKelas] = await Promise.all([
      supabaseAdmin
        .from('santri')
        .select('id, nama, kelas_id, kelas(nama), materi_ujian_tahfidz')
        .eq('status', 'aktif')
        .eq('can_ujian_tahfidz', true)
        .eq('penguji_ujian_tahfidz_id', pengujiId)
        .order('nama', { ascending: true }),
      supabaseAdmin
        .from('kelas')
        .select('id, nama')
        .eq('status', 'aktif')
        .order('nama', { ascending: true })
    ])

    if (resSantri.error) return { error: resSantri.error.message }
    if (resKelas.error) return { error: resKelas.error.message }

    return { data: { santri: resSantri.data, kelas: resKelas.data } }
  } catch (err: any) {
    return { error: 'Terjadi kesalahan sistem.' }
  }
}

