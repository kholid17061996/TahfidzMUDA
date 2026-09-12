'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react'
import { getPengujiAction, createPengujiAction, updatePengujiAction, deletePengujiAction } from '@/app/actions/penguji'

type Penguji = {
  id: string
  nama: string
  kode_penguji: string
  status: string
}

export default function DataPengujiPage() {
  const [pengujiList, setPengujiList] = useState<Penguji[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  
  // Form states
  const [nama, setNama] = useState('')
  const [kodePenguji, setKodePenguji] = useState('')
  const [status, setStatus] = useState('aktif')
  
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data } = await getPengujiAction()
    if (data) setPengujiList(data)
    setLoading(false)
  }

  const handleOpenModal = (penguji?: Penguji) => {
    if (penguji) {
      setEditId(penguji.id)
      setNama(penguji.nama)
      setKodePenguji(penguji.kode_penguji)
      setStatus(penguji.status)
    } else {
      setEditId(null)
      setNama('')
      setKodePenguji(`PGJ-${Math.floor(1000 + Math.random() * 9000)}`)
      setStatus('aktif')
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editId) {
        await updatePengujiAction(editId, nama, kodePenguji, status)
      } else {
        await createPengujiAction(nama, kodePenguji)
      }
      await fetchData()
      handleCloseModal()
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, namaPenguji: string) => {
    if (!confirm(`Yakin ingin menghapus data penguji ${namaPenguji}?`)) return
    
    setLoading(true)
    await deletePengujiAction(id)
    await fetchData()
  }

  const filteredData = pengujiList.filter(item => 
    item.nama.toLowerCase().includes(search.toLowerCase()) ||
    item.kode_penguji.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Data Penguji</h1>
          <p className="text-gray-400">Kelola data penguji tanpa akses login password</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emas hover:bg-emasHover text-slate font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} />
          Tambah Penguji
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama atau kode penguji..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emas focus:border-transparent transition-all placeholder:text-gray-500"
            />
          </div>
          <div className="text-gray-300 font-medium">
            Total: <span className="text-emas">{filteredData.length}</span> Penguji
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-gray-300">
                <th className="p-4 font-semibold text-sm w-16 text-center">No</th>
                <th className="p-4 font-semibold text-sm">Nama Lengkap</th>
                <th className="p-4 font-semibold text-sm w-32">Kode</th>
                <th className="p-4 font-semibold text-sm w-32 text-center">Status</th>
                <th className="p-4 font-semibold text-sm w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && pengujiList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    Tidak ada data penguji yang ditemukan
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-center text-gray-400">{index + 1}</td>
                    <td className="p-4 font-medium text-white">{item.nama}</td>
                    <td className="p-4"><span className="bg-white/10 text-gray-300 px-3 py-1 rounded-lg text-sm">{item.kode_penguji}</span></td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${item.status === 'aktif' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-400 hover:text-blue-400 bg-white/5 hover:bg-blue-500/10 rounded-lg transition-all" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id, item.nama)} className="p-2 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all" title="Hapus">
                          <Trash2 size={16} />
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate/80 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate mb-6">
              {editId ? 'Edit Data Penguji' : 'Tambah Penguji Baru'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate ml-1">Nama Lengkap</label>
                <input type="text" required value={nama} onChange={(e) => setNama(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-emas focus:border-emas outline-none transition-all text-slate" placeholder="Masukkan nama..." />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate ml-1">Kode</label>
                  <input type="text" required value={kodePenguji} onChange={(e) => setKodePenguji(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-emas focus:border-emas outline-none transition-all text-slate" placeholder="Kode..." />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate ml-1">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-emas focus:border-emas outline-none transition-all text-slate">
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-3 px-4 rounded-xl text-slate font-bold bg-gray-100 hover:bg-gray-200 transition-all">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 px-4 rounded-xl text-slate font-bold bg-emas hover:bg-emasHover transition-all flex items-center justify-center gap-2">
                  {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
