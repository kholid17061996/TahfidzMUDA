'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { CheckSquare, Target, Users, BookOpen, Loader2, UserCircle } from 'lucide-react'
import Link from 'next/link'

export default function PengajarDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [pengajarData, setPengajarData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSantri: 0,
    setoranHariIni: 0,
    mutabaahHariIni: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // 1. Ambil Profile
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)

      // 2. Ambil data Pengajar terkait profil ini
      const { data: pData } = await supabase.from('pengajar').select('*').eq('profile_id', user.id).single()
      setPengajarData(pData)

      if (pData) {
        const today = new Date().toISOString().split('T')[0]

        // 3. Ambil statistik
        const [resSantri, resSetoran, resMutabaah] = await Promise.all([
          supabase.from('santri').select('id', { count: 'exact' }).eq('pengajar_id', pData.id),
          supabase.from('setoran_hafalan').select('id', { count: 'exact' }).eq('pengajar_id', pData.id).eq('tanggal_setoran', today),
          supabase.from('mutabaah_harian').select('id', { count: 'exact' }).eq('pengajar_id', pData.id).eq('tanggal', today)
        ])

        setStats({
          totalSantri: resSantri.count || 0,
          setoranHariIni: resSetoran.count || 0,
          mutabaahHariIni: resMutabaah.count || 0
        })
      }
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-teal-300" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner — Glassmorphism */}
      <div className="relative overflow-hidden bg-white/10 backdrop-blur-2xl text-white rounded-3xl p-8 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
        {/* Glow accent */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emas/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 shadow-xl shrink-0 bg-white/10 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <UserCircle size={48} className="text-white/50" />
            )}
          </div>
          <div>
            <p className="text-teal-300 text-sm font-semibold uppercase tracking-widest mb-1">Selamat Datang</p>
            <h1 className="text-3xl font-bold mb-2 drop-shadow">Ahlan wa Sahlan, {profile?.full_name || 'Ustaz/Ustazah'} 👋</h1>
            <p className="text-white/70 max-w-xl leading-relaxed">
              Semoga Allah memberkahi waktu Anda dalam membersamai para penghafal Al-Qur'an.
            </p>
            {pengajarData && (
              <div className="mt-6 inline-flex gap-4 bg-black/20 backdrop-blur-sm border border-white/10 px-5 py-2.5 rounded-2xl text-sm">
                <span className="text-white/80"><strong className="text-white">Kode:</strong> {pengajarData.kode_pengajar}</span>
                <span className="text-white/30">|</span>
                <span className="text-white/80"><strong className="text-white">Kelas:</strong> {pengajarData.kelas || 'Belum diatur'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards — Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="group bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center gap-4 hover:bg-white/15 transition-all duration-300 hover:-translate-y-0.5">
          <div className="w-14 h-14 rounded-xl bg-teal-400/20 border border-teal-300/30 text-teal-300 flex items-center justify-center shadow-inner flex-shrink-0">
            <Users size={26} />
          </div>
          <div>
            <p className="text-sm text-white/60 font-medium">Santri Bimbingan</p>
            <p className="text-3xl font-bold text-white">{stats.totalSantri}</p>
          </div>
        </div>

        <div className="group bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center gap-4 hover:bg-white/15 transition-all duration-300 hover:-translate-y-0.5">
          <div className="w-14 h-14 rounded-xl bg-green-400/20 border border-green-300/30 text-green-300 flex items-center justify-center shadow-inner flex-shrink-0">
            <CheckSquare size={26} />
          </div>
          <div>
            <p className="text-sm text-white/60 font-medium">Mutaba'ah Hari Ini</p>
            <p className="text-3xl font-bold text-white">{stats.mutabaahHariIni}</p>
          </div>
        </div>

        <div className="group bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center gap-4 hover:bg-white/15 transition-all duration-300 hover:-translate-y-0.5">
          <div className="w-14 h-14 rounded-xl bg-emas/20 border border-emas/30 text-emas flex items-center justify-center shadow-inner flex-shrink-0">
            <Target size={26} />
          </div>
          <div>
            <p className="text-sm text-white/60 font-medium">Setoran Hari Ini</p>
            <p className="text-3xl font-bold text-white">{stats.setoranHariIni}</p>
          </div>
        </div>
      </div>


    </div>
  )
}
