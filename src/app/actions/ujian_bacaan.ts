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

export type UjianBacaanPayload = {
  santri_id: string
  penguji_id: string
  tanggal: string
  surat_ayat: string
  nilai_makharijul: number
  nilai_tajwid: number
  nilai_kelancaran: number
  nilai_fashahah: number
  nilai_mad: number
  nilai_waqaf: number
  nilai_akhir: number
  predikat: string
  status_kelulusan: string
  catatan_penguji: string
}

export async function createUjianBacaanAction(payload: UjianBacaanPayload) {
  const supabaseAdmin = getAdminClient()
  try {
      const { data, error } = await supabaseAdmin
        .from('ujian_bacaan')
        .insert(payload)
        
      if (error) return { error: error.message }

      // Update santri agar tidak muncul lagi di form ujian bacaan
      const { error: updateError } = await supabaseAdmin
        .from('santri')
        .update({ can_ujian_bacaan: false })
        .eq('id', payload.santri_id)

      if (updateError) {
        console.error('Gagal update status can_ujian_bacaan santri:', updateError)
      }

      return { success: true }
    } catch (err: any) {
    return { error: err.message }
  }
}

export async function getUjianBacaanByPengujiAction(penguji_id: string) {
  const supabaseAdmin = getAdminClient()
  try {
    const { data, error } = await supabaseAdmin
      .from('ujian_bacaan')
      .select(`
        id,
        tanggal,
        surat_ayat,
        nilai_akhir,
        predikat,
        status_kelulusan,
        santri ( nama, kelas ( nama ) )
      `)
      .eq('penguji_id', penguji_id)
      .order('created_at', { ascending: false })
      
    if (error) return { error: error.message }
    return { data }
  } catch (err: any) {
    return { error: err.message }
  }
}
