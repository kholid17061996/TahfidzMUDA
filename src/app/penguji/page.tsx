'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BackgroundEffects from '@/components/BackgroundEffects'
import { LogOut, UserCircle, Plus, FileText, Loader2 } from 'lucide-react'
import { getUjianBacaanByPengujiAction } from '@/app/actions/ujian_bacaan'

export default function PengujiDashboard() {
  const router = useRouter()
  const [penguji, setPenguji] = useState<{id: string, nama: string, tipe_penguji: string} | null>(null)
  const [riwayat, setRiwayat] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionStr = localStorage.getItem('penguji_session')
    if (!sessionStr) {
      router.push('/')
      return
    }

    try {
      const session = JSON.parse(sessionStr)
      setPenguji(session)
      
      // Fetch Riwayat Ujian
      getUjianBacaanByPengujiAction(session.id).then(res => {
        if (res.data) setRiwayat(res.data)
        setLoading(false)
      })
    } catch (e) {
      router.push('/')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('penguji_session')
    router.push('/')
  }

  if (!penguji) return null

  return (
    <div className="relative min-h-screen bg-slate overflow-hidden">
      <BackgroundEffects />
      
      <div className="relative z-10 flex flex-col min-h-screen p-6 md:p-10 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-3xl mb-8 shadow-lg gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emas to-yellow-600 text-slate flex items-center justify-center shadow-lg shadow-emas/20">
              <UserCircle size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">Selamat Datang,</h1>
              <p className="text-emas font-semibold text-lg">{penguji.nama}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-100 px-5 py-2.5 rounded-xl transition-all font-bold border border-red-500/30"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </header>

        <main className="flex-1 space-y-6">
          {penguji.tipe_penguji === 'Tahfidz' ? (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl flex flex-col items-center justify-center text-center mt-10">
              <FileText size={64} className="text-gray-400 mb-4 opacity-50" />
              <h2 className="text-2xl font-bold text-white mb-2">Form Ujian Tahfidz Belum Tersedia</h2>
              <p className="text-gray-400 max-w-md">Mohon maaf, halaman dan form penilaian untuk Penguji Tahfidz saat ini sedang dalam tahap pengembangan.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="text-emas" />
                  Riwayat Penilaian Ujian
                </h2>
                <Link 
                  href="/penguji/ujian-bacaan"
                  className="bg-emas hover:bg-emasHover text-slate font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-emas/20 active:scale-95"
                >
                  <Plus size={20} />
                  Mulai Ujian Baru
                </Link>
              </div>

              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-300">
                        <th className="p-4 font-semibold text-sm">Tanggal</th>
                        <th className="p-4 font-semibold text-sm">Santri</th>
                        <th className="p-4 font-semibold text-sm">Surat/Ayat</th>
                        <th className="p-4 font-semibold text-sm text-center">Nilai Akhir</th>
                        <th className="p-4 font-semibold text-sm text-center">Predikat</th>
                        <th className="p-4 font-semibold text-sm text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-400">
                            <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                            Memuat riwayat...
                          </td>
                        </tr>
                      ) : riwayat.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-400">
                            Belum ada riwayat ujian yang Anda nilai.
                          </td>
                        </tr>
                      ) : (
                        riwayat.map((item) => (
                          <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4 text-gray-300">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                            <td className="p-4 font-bold text-white">
                              {item.santri?.nama}
                              <div className="text-xs font-normal text-gray-400 mt-1">{item.santri?.kelas?.nama || '-'}</div>
                            </td>
                            <td className="p-4 text-gray-300">{item.surat_ayat}</td>
                            <td className="p-4 text-center font-bold text-emas text-lg">{item.nilai_akhir}</td>
                            <td className="p-4 text-center">
                              <span className={`px-3 py-1 rounded-lg font-bold text-sm ${
                                item.predikat === 'A' ? 'bg-green-500/20 text-green-400' :
                                item.predikat === 'B' ? 'bg-blue-500/20 text-blue-400' :
                                item.predikat === 'C' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {item.predikat}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="text-sm font-medium text-gray-300">{item.status_kelulusan}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
