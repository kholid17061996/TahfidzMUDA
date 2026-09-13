'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BackgroundEffects from '@/components/BackgroundEffects'
import { LogOut, UserCircle, Plus, FileText, Loader2, Search, Filter, ArrowUpDown, Edit2, Trash2, X, Save } from 'lucide-react'
import { getUjianBacaanByPengujiAction, updateUjianBacaanAction, deleteUjianBacaanAction } from '@/app/actions/ujian_bacaan'
import { getUjianTahfidzByPengujiAction, updateUjianTahfidzAction, deleteUjianTahfidzAction } from '@/app/actions/ujian_tahfidz'

export default function PengujiDashboard() {
  const router = useRouter()
  const [penguji, setPenguji] = useState<{id: string, nama: string, tipe_penguji: string} | null>(null)
  const [riwayatRaw, setRiwayatRaw] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [search, setSearch] = useState('')
  const [filterKelas, setFilterKelas] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortBy, setSortBy] = useState('terbaru')

  // Edit Modal State
  const [editItem, setEditItem] = useState<any | null>(null)
  const [editCatatan, setEditCatatan] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  useEffect(() => {
    const sessionStr = localStorage.getItem('penguji_session')
    if (!sessionStr) {
      router.push('/')
      return
    }

    try {
      const session = JSON.parse(sessionStr)
      setPenguji(session)
      fetchRiwayat(session)
    } catch (e) {
      router.push('/')
    }
  }, [router])

  // Menghitung Ujian Ke-berapa dan menerapkan filter
  const { filteredRiwayat, kelasOptions } = useMemo(() => {
    // 1. Hitung Ujian Ke- (Attempt Number)
    // Urutkan dari yang terlama ke terbaru untuk menghitung iterasi
    const ascList = [...riwayatRaw].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
    
    const santriAttemptCount: Record<string, number> = {}
    const riwayatWithAttempt = ascList.map(item => {
      const sName = item.santri?.nama || 'Unknown'
      if (!santriAttemptCount[sName]) santriAttemptCount[sName] = 0
      santriAttemptCount[sName]++
      return { ...item, ujian_ke: santriAttemptCount[sName] }
    })

    // Dapatkan daftar kelas unik untuk filter
    const kOptions = Array.from(new Set(riwayatWithAttempt.map(item => item.santri?.kelas?.nama).filter(Boolean))) as string[]

    // 2. Terapkan Pencarian & Filter
    let filtered = riwayatWithAttempt.filter(item => {
      const matchSearch = item.santri?.nama.toLowerCase().includes(search.toLowerCase())
      const matchKelas = filterKelas ? item.santri?.kelas?.nama === filterKelas : true
      const matchStatus = filterStatus ? item.status_kelulusan === filterStatus : true
      return matchSearch && matchKelas && matchStatus
    })

    // 3. Terapkan Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'terbaru') return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
      if (sortBy === 'terlama') return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
      if (sortBy === 'nilai_tinggi') return b.nilai_akhir - a.nilai_akhir
      if (sortBy === 'nilai_rendah') return a.nilai_akhir - b.nilai_akhir
      return 0
    })

    return { filteredRiwayat: filtered, kelasOptions: kOptions }
  }, [riwayatRaw, search, filterKelas, filterStatus, sortBy])

  const handleLogout = () => {
    localStorage.removeItem('penguji_session')
    router.push('/')
  }

  const fetchRiwayat = (session: any) => {
    setLoading(true)
    if (session.tipe_penguji === 'Tahfidz') {
      getUjianTahfidzByPengujiAction(session.id).then(res => {
        if (res.data) setRiwayatRaw(res.data)
        setLoading(false)
      })
    } else {
      getUjianBacaanByPengujiAction(session.id).then(res => {
        if (res.data) setRiwayatRaw(res.data)
        setLoading(false)
      })
    }
  }

  const handleOpenEdit = (item: any) => {
    setEditItem(item)
    setEditCatatan(item.catatan_penguji || '')
    setEditStatus(item.status_kelulusan || 'Lulus')
  }

  const handleSaveEdit = async () => {
    if (!editItem || !penguji) return
    setIsSavingEdit(true)
    let res
    if (penguji.tipe_penguji === 'Tahfidz') {
      res = await updateUjianTahfidzAction(editItem.id, {
        catatan_penguji: editCatatan,
        status_kelulusan: editStatus
      } as any)
    } else {
      res = await updateUjianBacaanAction(editItem.id, {
        catatan_penguji: editCatatan,
        status_kelulusan: editStatus
      } as any)
    }
    setIsSavingEdit(false)
    if (res.error) {
      alert('Gagal menyimpan: ' + res.error)
    } else {
      alert('Berhasil diperbarui!')
      setEditItem(null)
      const sessionStr = localStorage.getItem('penguji_session')
      if (sessionStr) fetchRiwayat(JSON.parse(sessionStr))
    }
  }

  const handleDelete = async (item: any) => {
    if (!penguji) return
    if (!confirm(`Hapus data ujian ${item.santri?.nama}? Siswa ini akan bisa diuji ulang.`)) return
    let res
    const santriId = item.santri?.id
    if (penguji.tipe_penguji === 'Tahfidz') {
      res = await deleteUjianTahfidzAction(item.id, santriId)
    } else {
      res = await deleteUjianBacaanAction(item.id, santriId)
    }
    if (res.error) {
      alert('Gagal menghapus: ' + res.error)
    } else {
      alert('Data berhasil dihapus!')
      const sessionStr = localStorage.getItem('penguji_session')
      if (sessionStr) fetchRiwayat(JSON.parse(sessionStr))
    }
  }

  if (!penguji) return null

  return (
    <>
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="text-emas" />
              Riwayat Penilaian Ujian {penguji.tipe_penguji}
            </h2>
            <Link 
              href={penguji.tipe_penguji === 'Tahfidz' ? "/penguji/ujian-tahfidz" : "/penguji/ujian-bacaan"}
              className="bg-emas hover:bg-emasHover text-slate font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-emas/20 active:scale-95"
            >
              <Plus size={20} />
              Mulai Ujian Baru
            </Link>
          </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-auto flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Cari nama santri..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-black/20 text-white pl-10 pr-4 py-2.5 rounded-xl border border-white/10 outline-none focus:border-emas text-sm placeholder-gray-400"
                  />
                </div>
                
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-xl border border-white/10">
                    <Filter size={14} className="text-emas" />
                    <select 
                      value={filterKelas} 
                      onChange={(e) => setFilterKelas(e.target.value)}
                      className="bg-transparent text-white text-sm outline-none cursor-pointer"
                    >
                      <option value="" className="text-slate">Semua Kelas</option>
                      {kelasOptions.map(k => (
                        <option key={k} value={k} className="text-slate">{k}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-xl border border-white/10">
                    <Filter size={14} className="text-emas" />
                    <select 
                      value={filterStatus} 
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-transparent text-white text-sm outline-none cursor-pointer"
                    >
                      <option value="" className="text-slate">Semua Status</option>
                      <option value="Lulus" className="text-slate">Lulus</option>
                      <option value="Lulus Dengan Catatan" className="text-slate">Lulus Dengan Catatan</option>
                      <option value="Tidak Lulus" className="text-slate">Tidak Lulus</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-xl border border-white/10">
                    <ArrowUpDown size={14} className="text-emas" />
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-white text-sm outline-none cursor-pointer"
                    >
                      <option value="terbaru" className="text-slate">Terbaru</option>
                      <option value="terlama" className="text-slate">Terlama</option>
                      <option value="nilai_tinggi" className="text-slate">Nilai Tertinggi</option>
                      <option value="nilai_rendah" className="text-slate">Nilai Terendah</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-300">
                      <th className="p-4 font-semibold text-sm">Tanggal</th>
                      <th className="p-4 font-semibold text-sm">Santri</th>
                      <th className="p-4 font-semibold text-sm">Materi</th>
                      <th className="p-4 font-semibold text-sm text-center">Nilai</th>
                      <th className="p-4 font-semibold text-sm text-center">Predikat</th>
                      <th className="p-4 font-semibold text-sm text-center">Status</th>
                      <th className="p-4 font-semibold text-sm text-center">Aksi</th>
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
                    ) : riwayatRaw.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">
                          Belum ada riwayat ujian yang Anda nilai.
                        </td>
                      </tr>
                    ) : filteredRiwayat.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">
                          Tidak ada data yang cocok dengan filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredRiwayat.map((item) => (
                        <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 text-gray-300">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                          <td className="p-4 font-bold text-white">
                            {item.santri?.nama}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-normal text-gray-400">{item.santri?.kelas?.nama || '-'}</span>
                              <span className="text-[10px] bg-white/10 text-emas px-2 py-0.5 rounded-full">
                                Ujian ke-{item.ujian_ke}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300">{item.surat_ayat || item.materi_tahfidz}</td>
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
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 transition-colors"
                              title="Edit Catatan & Status"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors"
                              title="Hapus Data Ujian"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>

    {/* Modal Edit */}
    {editItem && (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Edit Data Ujian</h2>
            <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-white"><X size={24} /></button>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm">Santri</p>
              <p className="text-white font-bold">{editItem.santri?.nama} — {editItem.santri?.kelas?.nama}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Materi</p>
              <p className="text-white">{editItem.surat_ayat || editItem.materi_tahfidz}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Nilai Akhir & Predikat</p>
              <p className="text-emas font-black text-2xl">{editItem.nilai_akhir} <span className="text-base font-normal">({editItem.predikat})</span></p>
              <p className="text-xs text-gray-500 mt-1">* Nilai tidak dapat diubah langsung. Hapus & isi ulang jika perlu.</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-300">Status Kelulusan</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full bg-white/5 text-white p-3 rounded-xl border border-white/10 outline-none focus:border-emas"
              >
                <option value="Lulus" className="text-slate">Lulus</option>
                <option value="Lulus Dengan Catatan" className="text-slate">Lulus Dengan Catatan</option>
                <option value="Tidak Lulus" className="text-slate">Tidak Lulus</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-300">Catatan Penguji</label>
              <textarea
                rows={4}
                value={editCatatan}
                onChange={(e) => setEditCatatan(e.target.value)}
                className="w-full bg-white/5 text-white p-3 rounded-xl border border-white/10 outline-none focus:border-emas text-sm resize-none"
                placeholder="Tuliskan catatan..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setEditItem(null)}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isSavingEdit}
              className="flex-1 bg-emas hover:bg-emasHover text-slate font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              {isSavingEdit ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Simpan
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  )
}
