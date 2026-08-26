'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { X, Save, Loader2 } from 'lucide-react'
import { createPortal } from 'react-dom'

interface EditMutabaahModalProps {
  enabled: boolean
  setEnabled: (val: boolean) => void
  mutabaahData: any
  santriName: string
  onSuccess: () => void
}

export default function EditMutabaahModal({ enabled, setEnabled, mutabaahData, santriName, onSuccess }: EditMutabaahModalProps) {
  const [loading, setLoading] = useState(false)
  const [kehadiran, setKehadiran] = useState('hadir')
  const [setoran, setSetoran] = useState(false)
  const [murojaah, setMurojaah] = useState(false)

  useEffect(() => {
    if (mutabaahData) {
      setKehadiran(mutabaahData.kehadiran)
      setSetoran(mutabaahData.setoran)
      setMurojaah(mutabaahData.murojaah)
    }
  }, [mutabaahData])

  if (!enabled || !mutabaahData) return null

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('mutabaah_harian')
        .update({
          kehadiran,
          setoran,
          murojaah
        })
        .eq('id', mutabaahData.id)

      if (error) throw error
      
      onSuccess()
      setEnabled(false)
    } catch (error) {
      console.error("Gagal menyimpan perubahan mutabaah:", error)
      alert("Terjadi kesalahan saat menyimpan perubahan.")
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-white text-lg">Edit Mutaba'ah</h3>
          <button 
            onClick={() => setEnabled(false)} 
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-sm text-gray-500 mb-1">Nama Santri</p>
            <p className="font-bold text-gray-800 text-lg">{santriName}</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Status Kehadiran</label>
            <select 
              value={kehadiran}
              onChange={(e) => setKehadiran(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none capitalize"
            >
              <option value="hadir">Hadir</option>
              <option value="sakit">Sakit</option>
              <option value="izin">Izin</option>
              <option value="alpa">Alpa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Amalan Yaumi</label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={setoran}
                  onChange={(e) => setSetoran(e.target.checked)}
                  className="w-5 h-5 accent-teal-500 rounded"
                />
                <span className="font-medium text-gray-700">Setoran Hafalan</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={murojaah}
                  onChange={(e) => setMurojaah(e.target.checked)}
                  className="w-5 h-5 accent-purple-500 rounded"
                />
                <span className="font-medium text-gray-700">Murojaah</span>
              </label>
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 mt-4"
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
