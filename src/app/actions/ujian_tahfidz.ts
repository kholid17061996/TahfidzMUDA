'use server'

import { createClient } from '@supabase/supabase-js'

const getAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('Kunci konfigurasi SUPABASE_SERVICE_ROLE_KEY belum disetel.')
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export type UjianTahfidzPayload = {
  santri_id: string
  penguji_id: string
  tanggal: string
  materi_tahfidz: string
  nilai_kelancaran: number
  nilai_ketepatan: number
  nilai_tajwid: number
  nilai_murojaah: number
  nilai_adab: number
  nilai_akhir: number
  predikat: string
  status_kelulusan: string
  catatan_penguji: string
}

export async function createUjianTahfidzAction(payload: UjianTahfidzPayload) {
  const supabaseAdmin = getAdminClient()
  try {
    const { data, error } = await supabaseAdmin
      .from('ujian_tahfidz')
      .insert(payload)
      
    if (error) return { error: error.message }

    // Update santri agar tidak muncul lagi di form ujian tahfidz
    const { error: updateError } = await supabaseAdmin
      .from('santri')
      .update({ can_ujian_tahfidz: false })
      .eq('id', payload.santri_id)

    if (updateError) {
      console.error('Gagal update status can_ujian_tahfidz santri:', updateError)
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function getUjianTahfidzByPengujiAction(penguji_id: string) {
  const supabaseAdmin = getAdminClient()
  try {
    const { data, error } = await supabaseAdmin
      .from('ujian_tahfidz')
      .select(`
        id,
        tanggal,
        materi_tahfidz,
        nilai_kelancaran,
        nilai_ketepatan,
        nilai_tajwid,
        nilai_murojaah,
        nilai_adab,
        nilai_akhir,
        predikat,
        status_kelulusan,
        catatan_penguji,
        santri ( id, nama, kelas ( nama ) )
      `)
      .eq('penguji_id', penguji_id)
      .order('created_at', { ascending: false })
      
    if (error) return { error: error.message }
    return { data }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateUjianTahfidzAction(id: string, payload: Partial<UjianTahfidzPayload>) {
  const supabaseAdmin = getAdminClient()
  try {
    const { error } = await supabaseAdmin
      .from('ujian_tahfidz')
      .update(payload)
      .eq('id', id)
    if (error) return { error: error.message }
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteUjianTahfidzAction(id: string, santriId: string) {
  const supabaseAdmin = getAdminClient()
  try {
    const { error } = await supabaseAdmin
      .from('ujian_tahfidz')
      .delete()
      .eq('id', id)
    if (error) return { error: error.message }

    // Reset can_ujian_tahfidz agar santri bisa diuji kembali
    await supabaseAdmin
      .from('santri')
      .update({ can_ujian_tahfidz: true })
      .eq('id', santriId)

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
