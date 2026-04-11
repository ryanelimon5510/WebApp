import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { User, Mail, Phone, Hash, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ProfilePage({ role }) {
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      toast.error('Failed to load profile parameters')
    } else {
      setProfile(data)
    }
  }

  if (!profile) return <div className="p-10 text-center text-slate-500">Loading profile...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-bold transition-colors">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-6 mb-8 border-b border-slate-100 pb-8">
            <div className="w-24 h-24 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center">
              <User size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{profile.full_name}</h1>
              <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg tracking-widest uppercase">
                {profile.role}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-2"><Mail size={14}/> Email Address</label>
              <div className="text-slate-900 font-medium px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">{profile.email}</div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-2"><Phone size={14}/> Mobile Number</label>
              <div className="text-slate-900 font-medium px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">{profile.mobile_number || 'Not provided'}</div>
            </div>

            {profile.role === 'STUDENT' && (
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-2"><Hash size={14}/> Student ID</label>
                <div className="text-slate-900 font-mono font-bold px-4 py-3 bg-sky-50 text-sky-900 rounded-xl border border-sky-100">{profile.student_number || 'N/A'}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
