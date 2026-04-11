import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { API_BASE } from '../lib/api'
import { Calendar as CalendarIcon, Download, CheckCircle2, XCircle } from 'lucide-react'

export default function AttendanceHistory({ classId, classTitle }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [classId])

  const fetchLogs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch(`${API_BASE}/api/attendance/class/${classId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      if (res.ok) {
        setLogs(await res.json())
      }
    } catch (err) {
      console.error('Failed to fetch attendance logs:', err)
    }
    setLoading(false)
  }

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Time,Student Name,Email,Status,Distance(m)\n"
      + logs.map(e => {
        const d = e.scanTime ? new Date(e.scanTime) : new Date()
        return `${d.toLocaleDateString()},${d.toLocaleTimeString()},${e.student?.fullName || 'N/A'},${e.student?.email || 'N/A'},${e.status},${e.distanceMeters?.toFixed(1) || '0'}`
      }).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${classTitle || 'class'}_attendance_export.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CalendarIcon size={20} className="text-sky-500"/> Attendance History
        </h2>
        <button 
          onClick={handleExportCSV}
          disabled={logs.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-bold rounded-lg transition-colors">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
              <th className="p-4">Date & Time</th>
              <th className="p-4">Student</th>
              <th className="p-4">Status</th>
              <th className="p-4">Distance</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center p-8 text-slate-500">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="4" className="text-center p-8 text-slate-500">No attendance records found.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-4 text-slate-600 font-mono text-xs">
                    {log.scanTime ? new Date(log.scanTime).toLocaleString() : 'N/A'}
                  </td>
                  <td className="p-4 font-bold text-slate-800">
                    {log.student?.fullName || 'Unknown'}
                  </td>
                  <td className="p-4">
                    {log.status === 'PRESENT' ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-md w-max text-xs">
                        <CheckCircle2 size={14}/> Present
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded-md w-max text-xs">
                        <XCircle size={14}/> Rejected
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500 text-xs font-mono">
                    {log.distanceMeters != null ? log.distanceMeters.toFixed(1) : '0'} m
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
