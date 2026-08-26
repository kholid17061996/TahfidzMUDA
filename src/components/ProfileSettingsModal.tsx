'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/utils/supabase/client'
import { X, Upload, Lock, Save, Loader2, Camera } from 'lucide-react'
import { createPortal } from 'react-dom'

interface ProfileSettingsModalProps {
  enabled: boolean
  setEnabled: (val: boolean) => void
  profile: any
  onProfileUpdated: (newProfile: any) => void
}

export default function ProfileSettingsModal({ enabled, setEnabled, profile, onProfileUpdated }: ProfileSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'photo' | 'password'>('photo')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Photo State
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.avatar_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Password State
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  if (!enabled) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setMessage({ type: '', text: '' })
    }
  }

  const handleUploadPhoto = async () => {
    if (!avatarFile) {
      setMessage({ type: 'error', text: 'Pilih foto terlebih dahulu.' })
      return
    }
    if (!profile?.id) {
      setMessage({ type: 'error', text: 'Data profil belum termuat atau ada error database (pastikan kolom avatar_url sudah ditambahkan).' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const avatarUrl = publicUrlData.publicUrl

      // Update profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setMessage({ type: 'success', text: 'Foto profil berhasil diperbarui!' })
      onProfileUpdated({ ...profile, avatar_url: avatarUrl })
      setAvatarFile(null)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal mengunggah foto.' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Kata sandi minimal 6 karakter.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Kata sandi tidak cocok.' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Kata sandi berhasil diubah!' })
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal merubah kata sandi.' })
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-white text-lg">Pengaturan Profil</h3>
          <button 
            onClick={() => setEnabled(false)} 
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button 
            className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'photo' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => { setActiveTab('photo'); setMessage({ type: '', text: '' }) }}
          >
            Ganti Foto
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'password' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => { setActiveTab('password'); setMessage({ type: '', text: '' }) }}
          >
            Ganti Password
          </button>
        </div>

        <div className="p-6">
          {message.text && (
            <div className={`p-3 rounded-xl mb-4 text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          {activeTab === 'photo' && (
            <div className="space-y-6 flex flex-col items-center">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-100 bg-gray-100 flex items-center justify-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={40} className="text-gray-300" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="text-white" size={24} />
                </div>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
              />
              
              <p className="text-sm text-gray-500 text-center">Format yang didukung: JPG, PNG. Maksimal 2MB.</p>

              <button 
                onClick={handleUploadPhoto}
                disabled={!avatarFile || loading}
                className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {loading ? 'Mengunggah...' : 'Simpan Foto'}
              </button>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Kata Sandi Baru</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Konfirmasi Kata Sandi</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Ulangi kata sandi baru"
                />
              </div>

              <button 
                onClick={handleUpdatePassword}
                disabled={!newPassword || !confirmPassword || loading}
                className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                {loading ? 'Menyimpan...' : 'Perbarui Password'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
