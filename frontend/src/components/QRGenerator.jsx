import React, { useState, useEffect, useRef, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabase'
import { API_BASE, WS_BASE } from '../lib/api'
import { X, RefreshCw, Users, CheckCircle2 } from 'lucide-react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export default function QRGenerator({ classId, onClose }) {
  const [tokenData, setTokenData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liveFeed, setLiveFeed] = useState([])
  const stompClientRef = useRef(null)
  const sessionIdRef = useRef(null)
  
  const startSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${API_BASE}/api/sessions/start/${classId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      if (res.ok) {
        const data = await res.json()
        sessionIdRef.current = data.id
        setTokenData({ token: data.activeQrToken, id: data.id })
        setLoading(false)
        connectWebSocket(data.id)
      } else {
        console.error('Failed to start session:', res.status)
        setLoading(false)
        setTokenData(null)
      }
    } catch (err) {
      console.error('Error starting session:', err)
      setLoading(false)
      setTokenData(null)
    }
  }, [classId])

  const connectWebSocket = (sessionId) => {
    const socket = new SockJS(WS_BASE)
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: function (str) {},
      onConnect: () => {
        stompClient.subscribe(`/topic/session/${sessionId}`, (message) => {
          if (message.body) {
            const parsed = JSON.parse(message.body)
            setLiveFeed(prev => [parsed, ...prev])
          }
        })
      }
    })
    stompClient.activate()
    stompClientRef.current = stompClient
  }

  useEffect(() => {
    startSession()
    return () => {
      // Clean up WebSocket on unmount
      if (stompClientRef.current) {
        stompClientRef.current.deactivate()
      }
    }
  }, [startSession])

  // Token auto-refresh every 15 seconds — uses ref to avoid dependency loop
  useEffect(() => {
    if (!sessionIdRef.current) return

    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !sessionIdRef.current) return
      
      const res = await fetch(`${API_BASE}/api/sessions/refresh/${sessionIdRef.current}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setTokenData(prev => ({ ...prev, token: data.token }))
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [loading]) // Only re-run when loading changes (i.e., when session is established)

  const handleClose = async () => {
    // Stop the session when closing
    if (sessionIdRef.current) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        await fetch(`${API_BASE}/api/sessions/stop/${sessionIdRef.current}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
      } catch (e) {
        console.error('Failed to stop session:', e)
      }
    }
    if (stompClientRef.current) {
      stompClientRef.current.deactivate()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full flex shadow-2xl relative animate-pop-in h-[600px]">
        
        {/* Close Button */}
        <button onClick={handleClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-2 z-10">
          <X size={20} />
        </button>

        {/* ── Left: QR Code Generator ── */}
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50 border-r border-slate-200">
          <h2 className="text-3xl font-black text-slate-900 mb-2">Scan to join</h2>
          <p className="text-slate-500 mb-8 text-center text-sm leading-relaxed">
            Must be inside the classroom to sign in.<br/>
            Token auto-rotates every 15 seconds.
          </p>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8">
            {loading ? (
              <div className="w-[240px] h-[240px] flex items-center justify-center">
                <RefreshCw className="animate-spin text-sky-500" size={36} />
              </div>
            ) : tokenData ? (
              <div className="animate-fade-in relative group">
                <QRCodeSVG value={JSON.stringify({ token: tokenData.token })} size={240} level="M" />
              </div>
            ) : (
              <div className="w-[240px] h-[240px] flex flex-col items-center justify-center gap-3">
                <p className="text-red-500 font-bold text-sm">Failed to start session</p>
                <button onClick={() => { setLoading(true); startSession() }} className="bg-sky-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-sky-600">
                  Retry
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs font-bold text-sky-500 uppercase tracking-widest bg-sky-50 px-4 py-2 rounded-full border border-sky-100">
            <RefreshCw size={14} className="animate-spin" style={{ animationDuration: '3s'}} /> Live Session Active
          </div>
        </div>

        {/* ── Right: Real-time Feed ── */}
        <div className="w-[360px] bg-white flex flex-col relative">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Live Feed</h3>
              <p className="text-xs text-slate-500 font-medium">Real-time attendance logs</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {liveFeed.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={24} className="text-slate-300"/>
                </div>
                <p className="text-sm font-medium">No one has scanned yet.</p>
              </div>
            ) : (
              liveFeed.map((log, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 animate-slide-in">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${log.status === 'PRESENT' || log.status?.includes('PRESENT') ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-slate-800 truncate">{log.studentName}</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {log.status === 'PRESENT' || log.status?.includes('PRESENT') ? 'Recorded' : 'Rejected'}
                    </p>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
      </div>
    </div>
  )
}
