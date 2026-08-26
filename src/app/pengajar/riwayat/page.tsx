'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Loader2, Calendar, Search, Edit2, Trash2 } from 'lucide-react'
import EditMutabaahModal from '@/components/EditMutabaahModal'
import EditSetoranModal from '@/components/EditSetoranModal'

export default function RiwayatInputPage() {
  const [loading, setLoading] = useState(true)
  const [santriList, setSantriList] = useState<any[]>([])
  const [mutabaahData, setMutabaahData] = useState<any[]>([])
  const [setoranData, setSetoranData] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedMutabaah, setSelectedMutabaah] = useState<any>(null)
  const [selectedSantriName, setSelectedSantriName] = useState('')

  const [editSetoranModalOpen, setEditSetoranModalOpen] = useState(false)
  const [selectedSetoran, setSelectedSetoran] = useState<any>(null)
  const [selectedSetoranSantriName, setSelectedSetoranSantriName] = useState('')

  useEffect(() => {
    fetchData()
  }, [selectedDate])

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data: pengajar } = await supabase.from('pengajar').select('id').eq('profile_id', user.id).single()
    if (!pengajar) {
      setLoading(false)
      return
    }

    // Ambil daftar santri
    const { data: santris } = await supabase.from('santri').select('id, nama, nis').eq('pengajar_id', pengajar.id).order('nama')
    if (santris) setSantriList(santris)

    // Ambil mutabaah
    const { data: mutabaah } = await supabase.from('mutabaah_harian')
      .select('*')
      .eq('pengajar_id', pengajar.id)
      .eq('tanggal', selectedDate)
    
    if (mutabaah) setMutabaahData(mutabaah)

    // Ambil setoran
    const { data: setoran } = await supabase.from('setoran_hafalan')
      .select('*')
      .eq('pengajar_id', pengajar.id)
      .eq('tanggal_setoran', selectedDate)
    
    if (setoran) setSetoranData(setoran)

    setLoading(false)
  }

  const handleDeleteMutabaah = async (id: string, santriName: string) => {
    if (!confirm(`Hapus riwayat mutaba'ah untuk ${santriName}?`)) return
    try {
      const { error } = await supabase.from('mutabaah_harian').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (err) {
      console.error(err)
      alert("Gagal menghapus data mutaba'ah.")
    }
  }

  const handleDeleteSetoran = async (id: string) => {
    if (!confirm(`Hapus data setoran ini?`)) return
    try {
      const { error } = await supabase.from('setoran_hafalan').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (err) {
      console.error(err)
      alert("Gagal menghapus data setoran.")
    }
  }

  const filteredSantri = santriList.filter(s => s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || s.nis?.includes(searchQuery))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Riwayat Hasil Input</h1>
            <p className="text-white/70">Pantau data kehadiran, amalan yaumi, dan setoran hafalan seluruh santri.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md p-2 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 px-3 text-white/80">
              <Calendar size={18} />
              <span className="text-sm font-medium">Pilih Tanggal:</span>
            </div>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white/10 text-white border-0 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-400 outline-none w-40 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.15)] p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-white">Daftar Santri ({filteredSantri.length})</h2>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau NIS santri..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-400/50 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-teal-300" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/60 text-sm">
                  <th className="pb-3 px-4 font-semibold uppercase tracking-wider whitespace-nowrap">Nama Santri</th>
                  <th className="pb-3 px-4 font-semibold uppercase tracking-wider whitespace-nowrap">Kehadiran</th>
                  <th className="pb-3 px-4 font-semibold uppercase tracking-wider whitespace-nowrap">Amalan Yaumi</th>
                  <th className="pb-3 px-4 font-semibold uppercase tracking-wider whitespace-nowrap">Setoran Hafalan</th>
                  <th className="pb-3 px-4 font-semibold uppercase tracking-wider whitespace-nowrap text-center">Aksi Mutaba'ah</th>
                </tr>
              </thead>
              <tbody className="text-white text-sm">
                {filteredSantri.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-white/50">
                      Tidak ada data santri ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredSantri.map((santri) => {
                    const mData = mutabaahData.find(m => m.santri_id === santri.id)
                    const sDataList = setoranData.filter(s => s.santri_id === santri.id)
                    
                    return (
                      <tr key={santri.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="py-4 px-4 min-w-[200px]">
                          <p className="font-bold text-base group-hover:text-teal-300 transition-colors">{santri.nama}</p>
                          <p className="text-xs text-white/50 mt-1">NIS: {santri.nis || '-'}</p>
                        </td>
                        
                        {/* Kehadiran */}
                        <td className="py-4 px-4">
                          {mData ? (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize shadow-sm inline-block ${
                              mData.kehadiran === 'hadir' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                              mData.kehadiran === 'sakit' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                              mData.kehadiran === 'izin' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 
                              'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                              {mData.kehadiran}
                            </span>
                          ) : (
                            <span className="text-white/30 italic text-xs bg-white/5 px-2 py-1 rounded-md">Belum diinput</span>
                          )}
                        </td>
                        
                        {/* Mutabaah Yaumi */}
                        <td className="py-4 px-4">
                          {mData ? (
                            <div className="flex flex-wrap gap-2">
                              {mData.setoran && <span className="bg-teal-500/20 text-teal-300 text-[10px] px-2 py-1 rounded-md font-medium border border-teal-500/30 shadow-sm">Setoran ✅</span>}
                              {mData.murojaah && <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-1 rounded-md font-medium border border-purple-500/30 shadow-sm">Murojaah ✅</span>}
                              {!mData.setoran && !mData.murojaah && <span className="text-white/40 text-xs italic">Tidak ada amalan</span>}
                            </div>
                          ) : (
                            <span className="text-white/30">-</span>
                          )}
                        </td>
                        
                        {/* Setoran Hafalan */}
                        <td className="py-4 px-4 min-w-[250px]">
                          {sDataList.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {sDataList.map((sData, idx) => (
                                <div key={idx} className="bg-black/20 px-3 py-2 rounded-xl border border-white/10 flex flex-col gap-1 shadow-inner relative group/setoran">
                                  <div className="flex justify-between items-start">
                                    <p className="text-xs font-bold text-emas tracking-wide">{sData.surat}</p>
                                    <div className="flex items-center opacity-0 group-hover/setoran:opacity-100 transition-opacity ml-2 gap-1">
                                      <button 
                                        onClick={() => {
                                          setSelectedSetoran(sData)
                                          setSelectedSetoranSantriName(santri.nama)
                                          setEditSetoranModalOpen(true)
                                        }}
                                        className="text-blue-400 hover:text-blue-300 p-0.5 rounded hover:bg-white/10"
                                        title="Edit setoran"
                                      >
                                        <Edit2 size={12} />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteSetoran(sData.id)}
                                        className="text-red-400 hover:text-red-300 p-0.5 rounded hover:bg-white/10"
                                        title="Hapus setoran"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-[10px] text-white/70">
                                    Ayat {sData.ayat_mulai}-{sData.ayat_selesai} • 
                                    <span className={sData.jenis_setoran === 'hafalan_baru' ? 'text-teal-300 ml-1' : 'text-purple-300 ml-1'}>
                                      {sData.jenis_setoran === 'hafalan_baru' ? 'Ziyadah' : 'Murojaah'}
                                    </span>
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-white/30 italic text-xs">Belum ada setoran tercatat</span>
                          )}
                        </td>
                        
                        {/* Aksi Mutabaah */}
                        <td className="py-4 px-4 text-center">
                          {mData && (
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedMutabaah(mData)
                                  setSelectedSantriName(santri.nama)
                                  setEditModalOpen(true)
                                }}
                                className="p-2 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                                title="Edit Mutaba'ah"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteMutabaah(mData.id, santri.nama)}
                                className="p-2 bg-red-500/10 text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="Hapus Mutaba'ah"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditMutabaahModal 
        enabled={editModalOpen} 
        setEnabled={setEditModalOpen} 
        mutabaahData={selectedMutabaah} 
        santriName={selectedSantriName}
        onSuccess={() => fetchData()}
      />
      <EditSetoranModal
        enabled={editSetoranModalOpen}
        setEnabled={setEditSetoranModalOpen}
        setoranData={selectedSetoran}
        santriName={selectedSetoranSantriName}
        onSuccess={() => fetchData()}
      />
    </div>
  )
}
