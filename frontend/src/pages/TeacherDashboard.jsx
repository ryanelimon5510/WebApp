import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { API_BASE } from '../lib/api'
import { LogOut, Plus, MapPin, UserCircle } from 'lucide-react'
import QRGenerator from '../components/QRGenerator'
import AttendanceHistory from '../components/AttendanceHistory'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function TeacherDashboard() {
  const [classes, setClasses] = useState([])
  const [className, setClassName] = useState('')
  const [classCode, setClassCode] = useState('')
  const [roomLat, setRoomLat] = useState('')
  const [roomLng, setRoomLng] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeSessionClassId, setActiveSessionClassId] = useState(null)

  const handleLogout = async () => await supabase.auth.signOut()

  const fetchClasses = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch(`${API_BASE}/api/classes/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
    if (res.ok) {
      setClasses(await res.json())
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [])

  const handleCreateClass = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch(`${API_BASE}/api/classes`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}` 
      },
      body: JSON.stringify({ 
        className, 
        classCode, 
        roomLat: parseFloat(roomLat), 
        roomLng: parseFloat(roomLng) 
      })
    })

    if (res.ok) {
      setClassName('')
      setClassCode('')
      setRoomLat('')
      setRoomLng('')
      toast.success('Class created successfully!')
      fetchClasses()
    } else {
      toast.error('Failed to create class. Check if code is unique.')
    }
    setLoading(false)
  }

  const captureGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setRoomLat(pos.coords.latitude.toFixed(6))
          setRoomLng(pos.coords.longitude.toFixed(6))
        },
        () => alert('Please allow GPS access')
      )
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Teacher Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your classes and start attendance sessions.</p>
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
          {/* Create Class Form */}
          <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Create New Class</h2>
            <form onSubmit={handleCreateClass} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5">Class Name</label>
                <input required type="text" value={className} onChange={e => setClassName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="e.g. Data Structures" />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5">Class Code</label>
                <input required type="text" value={classCode} onChange={e => setClassCode(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase" placeholder="CS101" />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5 flex justify-between">
                  <span>Room Coordinates</span>
                  <button type="button" onClick={captureGPS} className="text-sky-500 hover:text-sky-600 flex items-center gap-1"><MapPin size={12}/> Cur. Loc</button>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input required type="number" step="any" value={roomLat} onChange={e => setRoomLat(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Lat" />
                  <input required type="number" step="any" value={roomLng} onChange={e => setRoomLng(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Lng" />
                </div>
              </div>
              <button disabled={loading} type="submit" className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors">
                <Plus size={18} /> Create Class
              </button>
            </form>
          </div>

          {/* Classes List */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Your Classes</h2>
            <div className="grid gap-4">
              {classes.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-500 text-sm">
                  No classes created yet. Create one to get started!
                </div>
              ) : classes.map(c => (
                <div key={c.id} className="flex flex-col gap-4 mb-8">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="px-2.5 py-1 bg-sky-100 text-sky-700 text-xs font-black rounded-md">{c.classCode}</span>
                        <h3 className="font-bold text-slate-900">{c.className}</h3>
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-2">
                        <MapPin size={14} className="text-slate-400"/> {c.roomLat}, {c.roomLng}
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveSessionClassId(c.id)}
                      className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold rounded-xl transition-colors shrink-0">
                      Start Session
                    </button>
                  </div>
                  
                  {/* Embedded History View */}
                  <AttendanceHistory classId={c.id} classTitle={c.className} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {activeSessionClassId && (
        <QRGenerator classId={activeSessionClassId} onClose={() => setActiveSessionClassId(null)} />
      )}
    </div>
  )
}
