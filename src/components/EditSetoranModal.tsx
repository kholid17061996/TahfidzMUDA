'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { X, Save, Loader2 } from 'lucide-react'
import { createPortal } from 'react-dom'

interface EditSetoranModalProps {
  enabled: boolean
  setEnabled: (val: boolean) => void
  setoranData: any
  santriName: string
  onSuccess: () => void
}

export default function EditSetoranModal({ enabled, setEnabled, setoranData, santriName, onSuccess }: EditSetoranModalProps) {
  const [loading, setLoading] = useState(false)
  
  const [jenisSetoran, setJenisSetoran] = useState('hafalan_baru')
  const [tanggalSetoran, setTanggalSetoran] = useState(new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0])
  const [surat, setSurat] = useState('')
  const [ayatMulai, setAyatMulai] = useState(1)
  const [ayatSelesai, setAyatSelesai] = useState(1)
  const [juz, setJuz] = useState(30)

  useEffect(() => {
    if (setoranData) {
      setJenisSetoran(setoranData.jenis_setoran)
      setTanggalSetoran(setoranData.tanggal_setoran || new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0])
      setSurat(setoranData.surat)
      setAyatMulai(setoranData.ayat_mulai)
      setAyatSelesai(setoranData.ayat_selesai)
      setJuz(setoranData.juz || 30)
    }
  }, [setoranData])

  if (!enabled || !setoranData) return null

  const handleSave = async () => {
    if (!surat || ayatMulai > ayatSelesai) {
      alert("Input tidak valid. Periksa nama surat dan rentang ayat.")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('setoran_hafalan')
        .update({
          jenis_setoran: jenisSetoran,
          tanggal_setoran: tanggalSetoran,
          surat,
          ayat_mulai: ayatMulai,
          ayat_selesai: ayatSelesai,
          juz
        })
        .eq('id', setoranData.id)

      if (error) throw error
      
      onSuccess()
      setEnabled(false)
    } catch (error) {
      console.error("Gagal menyimpan perubahan setoran:", error)
      alert("Terjadi kesalahan saat menyimpan perubahan setoran.")
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emas to-yellow-600 px-6 py-4 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-white text-lg">Edit Setoran Hafalan</h3>
          <button 
            onClick={() => setEnabled(false)} 
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <p className="text-sm text-gray-500 mb-1">Nama Santri</p>
            <p className="font-bold text-gray-800 text-lg">{santriName}</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Setoran</label>
            <input 
              type="date"
              value={tanggalSetoran}
              onChange={(e) => setTanggalSetoran(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emas outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Jenis Setoran</label>
            <select 
              value={jenisSetoran}
              onChange={(e) => setJenisSetoran(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emas outline-none"
            >
              <option value="hafalan_baru">Ziyadah (Hafalan Baru)</option>
              <option value="murojaah">Murojaah (Ulang Hafalan)</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Juz</label>
              <input 
                type="number" 
                value={juz}
                onChange={(e) => setJuz(parseInt(e.target.value) || 1)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emas outline-none"
                min={1} max={30}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nama Surat</label>
              <input 
                type="text" 
                value={surat}
                onChange={(e) => setSurat(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emas outline-none"
                placeholder="Cth: An-Naba"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Ayat Mulai</label>
              <input 
                type="number" 
                value={ayatMulai}
                onChange={(e) => setAyatMulai(parseInt(e.target.value) || 1)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emas outline-none"
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Ayat Selesai</label>
              <input 
                type="number" 
                value={ayatSelesai}
                onChange={(e) => setAyatSelesai(parseInt(e.target.value) || 1)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emas outline-none"
                min={1}
              />
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emas hover:bg-yellow-600 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
