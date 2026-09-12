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

export async function getAllPengujiForLoginAction() {
  const supabaseAdmin = getAdminClient()
  try {
    const { data, error } = await supabaseAdmin
      .from('penguji')
      .select('id, nama, tipe_penguji')
      .eq('status', 'aktif')
      .order('nama', { ascending: true })
      
    if (error) return { error: error.message }
    return { data }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function getPengujiAction() {
  const supabaseAdmin = getAdminClient()
  try {
    const { data, error } = await supabaseAdmin
      .from('penguji')
      .select('*')
      .order('nama', { ascending: true })
      
    if (error) return { error: error.message }
    return { data }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function createPengujiAction(nama: string, kode_penguji: string, tipe_penguji: string) {
  const supabaseAdmin = getAdminClient()
  try {
    const { data, error } = await supabaseAdmin
      .from('penguji')
      .insert({ nama, kode_penguji, tipe_penguji })
      
    if (error) return { error: error.message }
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updatePengujiAction(id: string, nama: string, kode_penguji: string, status: string, tipe_penguji: string) {
  const supabaseAdmin = getAdminClient()
  try {
    const { data, error } = await supabaseAdmin
      .from('penguji')
      .update({ nama, kode_penguji, status, tipe_penguji, updated_at: new Date().toISOString() })
      .eq('id', id)
      
    if (error) return { error: error.message }
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deletePengujiAction(id: string) {
  const supabaseAdmin = getAdminClient()
  try {
    const { error } = await supabaseAdmin
      .from('penguji')
      .delete()
      .eq('id', id)
      
    if (error) return { error: error.message }
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
