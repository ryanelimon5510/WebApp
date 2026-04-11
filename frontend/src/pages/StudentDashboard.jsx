import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { API_BASE } from '../lib/api'
import { LogOut, ArrowRight, CheckCircle, QrCode, UserCircle } from 'lucide-react'
import QRScanner from '../components/QRScanner'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([])
  const [classCode, setClassCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)

  const handleLogout = async () => await supabase.auth.signOut()

  const fetchEnrollments = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch(`${API_BASE}/api/enrollments/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
    if (res.ok) {
      setEnrollments(await res.json())
    }
  }

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const handleJoinClass = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch(`${API_BASE}/api/enrollments/join`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}` 
      },
      body: JSON.stringify({ classCode })
    })

    if (res.ok) {
      setClassCode('')
      toast.success(`Successfully joined class!`)
      fetchEnrollments()
    } else {
      const err = await res.json()
      toast.error(err.message || 'Failed to join class. Invalid code?')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Dashboard</h1>
            <p className="text-slate-500 mt-1">Enroll in classes and scan QR codes for attendance.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl font-bold transition-all shadow-sm">
              <UserCircle size={18} /> Profile
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-xl text-slate-700 font-bold transition-all shadow-sm">
              <LogOut size={16} /> Log out
            </button>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Join Class Form */}
          <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Join Class</h2>
            <form onSubmit={handleJoinClass} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5">Class Code</label>
                <div className="flex gap-2">
                  <input required type="text" value={classCode} onChange={e => setClassCode(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase" placeholder="e.g. CS101" />
                  <button disabled={loading} type="submit" className="flex shrink-0 items-center justify-center w-[42px] bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors">
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Enrolled Classes List */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-bold text-slate-900 mb-5">My Classes</h2>
            <div className="grid gap-4">
              {enrollments.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-500 text-sm">
                  You are not enrolled in any classes yet.
                </div>
              ) : enrollments.map(e => (
                <div key={e.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{e.classEntity?.className || 'Unknown Class'}</h3>
                      <div className="text-sm text-slate-500 mt-0.5">{e.classEntity?.classCode || ''}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setScannerOpen(true)}
                    className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white flex items-center gap-2 font-bold rounded-xl transition-colors shadow-sm">
                    <QrCode size={18} /> Scan QR
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {scannerOpen && (
        <QRScanner onClose={() => setScannerOpen(false)} />
      )}
    </div>
  )
}
