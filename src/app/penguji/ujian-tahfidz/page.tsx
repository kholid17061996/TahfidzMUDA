'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Calculator } from 'lucide-react'
import BackgroundEffects from '@/components/BackgroundEffects'
import AutocompleteInput from '@/components/AutocompleteInput'
import { getSantriByPengujiUjianTahfidzAction } from '@/app/actions/santri'
import { createUjianTahfidzAction } from '@/app/actions/ujian_tahfidz'

export default function FormUjianTahfidz() {
  const router = useRouter()
  const [penguji, setPenguji] = useState<{id: string, nama: string} | null>(null)
  const [distribusiAktif, setDistribusiAktif] = useState(false)
  
  const [santriList, setSantriList] = useState<any[]>([])
  const [kelasList, setKelasList] = useState<{id: string, nama: string}[]>([])
  const [santriNames, setSantriNames] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form State
  const [selectedKelasId, setSelectedKelasId] = useState('')
  const [selectedSantriName, setSelectedSantriName] = useState('')
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0])
  const [materiTahfidz, setMateriTahfidz] = useState('')
  
  // Scoring State
  const [nilaiKelancaran, setNilaiKelancaran] = useState<number | ''>('')
  const [nilaiKetepatan, setNilaiKetepatan] = useState<number | ''>('')
  const [nilaiTajwid, setNilaiTajwid] = useState<number | ''>('')
  const [nilaiMurojaah, setNilaiMurojaah] = useState<number | ''>('')
  const [nilaiAdab, setNilaiAdab] = useState<number | ''>('')
  
  const [statusKelulusan, setStatusKelulusan] = useState('Lulus')
  const [catatan, setCatatan] = useState('')

  useEffect(() => {
    const sessionStr = localStorage.getItem('penguji_session')
    if (!sessionStr) {
      router.push('/')
      return
    }
    const session = JSON.parse(sessionStr)
    setPenguji(session)
    
    // Coba ambil santri berdasarkan distribusi dulu
    getSantriByPengujiUjianTahfidzAction(session.id).then(res => {
      if (res.data && res.data.santri.length > 0) {
        // Distribusi sudah dijalankan, gunakan daftar yang sudah ditentukan
        setDistribusiAktif(true)
        setKelasList(res.data.kelas)
        setSantriList(res.data.santri)
      } else {
        // Distribusi belum dijalankan, fallback: tampilkan semua santri
        setDistribusiAktif(false)
        import('@/app/actions/santri').then(mod => {
          mod.getAllSantriForPengujiTahfidzAction().then(res2 => {
            if (res2.data) {
              setKelasList(res2.data.kelas)
              setSantriList(res2.data.santri)
            }
          })
        })
      }
    })
  }, [router])

  useEffect(() => {
    if (selectedKelasId) {
      const filtered = santriList.filter(s => s.kelas_id === selectedKelasId)
      setSantriNames(filtered.map(s => s.nama))
    } else {
      setSantriNames([])
    }
    setSelectedSantriName('')
  }, [selectedKelasId, santriList])

  useEffect(() => {
    if (selectedSantriName && selectedKelasId) {
      const foundSantri = santriList.find(s => s.nama === selectedSantriName && s.kelas_id === selectedKelasId)
      if (foundSantri && foundSantri.materi_ujian_tahfidz) {
        setMateriTahfidz(foundSantri.materi_ujian_tahfidz)
      }
    }
  }, [selectedSantriName, selectedKelasId, santriList])

  // Kalkulasi Otomatis
  const { nilaiAkhir, predikat } = useMemo(() => {
    const kel = Number(nilaiKelancaran) || 0
    const ket = Number(nilaiKetepatan) || 0
    const taj = Number(nilaiTajwid) || 0
    const mur = Number(nilaiMurojaah) || 0
    const adb = Number(nilaiAdab) || 0

    const total = (kel * 0.30) + (ket * 0.25) + (taj * 0.20) + (mur * 0.15) + (adb * 0.10)
    
    let p = 'D'
    if (total >= 90) p = 'A'
    else if (total >= 80) p = 'B'
    else if (total >= 70) p = 'C'

    return { 
      nilaiAkhir: Number(total.toFixed(2)), 
      predikat: p 
    }
  }, [nilaiKelancaran, nilaiKetepatan, nilaiTajwid, nilaiMurojaah, nilaiAdab])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!penguji) return
    
    const foundSantri = santriList.find(s => s.nama === selectedSantriName && s.kelas_id === selectedKelasId)
    if (!foundSantri) {
      alert('Nama Santri tidak valid. Silakan pilih dari daftar setelah memilih kelas.')
      return
    }
    
    setIsSubmitting(true)
    
    const payload = {
      santri_id: foundSantri.id,
      penguji_id: penguji.id,
      tanggal,
      materi_tahfidz: materiTahfidz,
      nilai_kelancaran: Number(nilaiKelancaran) || 0,
      nilai_ketepatan: Number(nilaiKetepatan) || 0,
      nilai_tajwid: Number(nilaiTajwid) || 0,
      nilai_murojaah: Number(nilaiMurojaah) || 0,
      nilai_adab: Number(nilaiAdab) || 0,
      nilai_akhir: nilaiAkhir,
      predikat: predikat,
      status_kelulusan: statusKelulusan,
      catatan_penguji: catatan
    }
    
    const res = await createUjianTahfidzAction(payload)
    setIsSubmitting(false)
    
    if (res.error) {
      alert('Gagal menyimpan: ' + res.error)
    } else {
      alert('Berhasil menyimpan data ujian!')
      router.push('/penguji')
    }
  }

  if (!penguji) return null

  return (
    <div className="relative min-h-screen bg-slate overflow-hidden py-10">
      <BackgroundEffects />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <Link 
          href="/penguji"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Kembali ke Dashboard
        </Link>
        
        <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-6 md:p-10 shadow-2xl">
          <div className="text-center mb-10 pb-6 border-b border-white/10">
            <h1 className="text-3xl font-bold text-white mb-2">Form Penilaian</h1>
            <h2 className="text-xl text-emas font-semibold">Ujian Tahfidz Al-Qur'an</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Bagian A: Identitas */}
            <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4 border-l-4 border-emas pl-3">A. Identitas Peserta</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm text-gray-300">Pilih Kelas</label>
                  <select 
                    value={selectedKelasId} 
                    onChange={(e) => setSelectedKelasId(e.target.value)} 
                    className="w-full bg-white/5 text-white p-3 rounded-xl border border-white/10 outline-none focus:border-emas focus:ring-1 focus:ring-emas"
                  >
                    <option value="" className="text-slate">-- Pilih Kelas --</option>
                    {kelasList.map(k => (
                      <option key={k.id} value={k.id} className="text-slate">{k.nama}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-300">Nama Santri</label>
                  <AutocompleteInput
                    value={selectedSantriName}
                    onChange={setSelectedSantriName}
                    options={santriNames}
                    disabled={!selectedKelasId}
                    placeholder={selectedKelasId ? "Ketik/Pilih Nama Santri" : "Pilih Kelas Terlebih Dahulu"}
                    className="w-full text-slate"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-300">Penguji</label>
                  <input type="text" value={penguji.nama} disabled className="w-full bg-gray-500/20 text-gray-400 p-3 rounded-xl border border-white/10" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-300">Hari/Tanggal</label>
                  <input type="date" required value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full bg-white/5 text-white p-3 rounded-xl border border-white/10 outline-none focus:border-emas focus:ring-1 focus:ring-emas" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm text-gray-300">Materi Ujian Tahfidz</label>
                  <input type="text" required placeholder="Cth: Juz 30" value={materiTahfidz} onChange={(e) => setMateriTahfidz(e.target.value)} className="w-full bg-white/5 text-white p-3 rounded-xl border border-white/10 outline-none focus:border-emas focus:ring-1 focus:ring-emas" />
                  <p className="text-xs text-gray-400 mt-1">Otomatis terisi jika sudah diatur oleh Admin.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Bagian B: Aspek Penilaian */}
              <div className="lg:col-span-2 bg-white/10 rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4 border-l-4 border-emas pl-3 flex justify-between">
                  <span>B. Aspek Penilaian</span>
                  <span className="text-xs font-normal text-gray-400 bg-black/20 px-3 py-1 rounded-full">Skala 1 - 100</span>
                </h3>
                
                <div className="space-y-4">
                  {[
                    { label: 'Kelancaran Hafalan', weight: '30%', desc: 'Kefasihan dan kelancaran', val: nilaiKelancaran, set: setNilaiKelancaran },
                    { label: 'Ketepatan Ayat', weight: '25%', desc: 'Tidak tertukar ayat/surat', val: nilaiKetepatan, set: setNilaiKetepatan },
                    { label: 'Tajwid & Makharijul Huruf', weight: '20%', desc: 'Hukum bacaan & makhraj', val: nilaiTajwid, set: setNilaiTajwid },
                    { label: 'Murojaah / Kekuatan Hafalan', weight: '15%', desc: 'Ingatan jangka panjang', val: nilaiMurojaah, set: setNilaiMurojaah },
                    { label: 'Adab dan Sikap', weight: '10%', desc: 'Sikap santri saat ujian', val: nilaiAdab, set: setNilaiAdab },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group border border-transparent hover:border-white/10">
                      <div className="flex-1">
                        <div className="text-white font-semibold flex items-center gap-2">
                          {item.label} 
                          <span className="text-xs text-emas bg-emas/10 px-2 py-0.5 rounded-md">{item.weight}</span>
                        </div>
                        <div className="text-xs text-gray-400">{item.desc}</div>
                      </div>
                      <input 
                        type="number" 
                        min="0" max="100" required
                        value={item.val} 
                        onChange={(e) => item.set(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-20 text-center bg-black/40 text-white p-3 rounded-xl border border-white/10 outline-none focus:border-emas focus:ring-1 focus:ring-emas font-bold text-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bagian C & D: Hasil Akhir */}
              <div className="space-y-6">
                <div className="bg-gradient-to-b from-emas/20 to-transparent rounded-2xl p-6 border border-emas/30 text-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Calculator size={64} />
                  </div>
                  <h3 className="text-sm font-bold text-emas uppercase tracking-widest mb-2 relative z-10">Nilai Akhir</h3>
                  <div className="text-6xl font-black text-white mb-2 relative z-10">{nilaiAkhir}</div>
                  <div className="flex justify-center items-center gap-3 relative z-10">
                    <span className="text-gray-300">Predikat:</span>
                    <span className="text-2xl font-black text-emas bg-black/30 w-12 h-12 flex items-center justify-center rounded-xl border border-emas/50 shadow-[0_0_15px_rgba(248,210,28,0.3)]">
                      {predikat}
                    </span>
                  </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white block">Status Hasil Akhir</label>
                      <select required value={statusKelulusan} onChange={(e) => setStatusKelulusan(e.target.value)} className="w-full bg-white/5 text-white p-3 rounded-xl border border-white/10 outline-none focus:border-emas text-sm">
                        <option value="Lulus" className="text-slate">Lulus</option>
                        <option value="Lulus Dengan Catatan" className="text-slate">Lulus Dengan Catatan</option>
                        <option value="Tidak Lulus" className="text-slate">Tidak Lulus</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white block">Catatan Penguji</label>
                      <textarea 
                        rows={4} 
                        value={catatan} 
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder="Tuliskan catatan evaluasi..." 
                        className="w-full bg-white/5 text-white p-3 rounded-xl border border-white/10 outline-none focus:border-emas text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-emas hover:bg-emasHover text-slate font-bold px-8 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-[0_5px_20px_rgba(248,210,28,0.3)] active:scale-95 disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                {isSubmitting ? 'Menyimpan...' : 'Simpan Hasil Penilaian'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
