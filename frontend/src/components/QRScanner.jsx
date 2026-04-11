import React, { useEffect, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { supabase } from '../lib/supabase'
import { API_BASE } from '../lib/api'
import { X, MapPin } from 'lucide-react'

export default function QRScanner({ onClose }) {
  const [status, setStatus] = useState('Initialize scanner...')
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { 
      qrbox: { width: 250, height: 250 }, 
      fps: 10 
    })

    scanner.render(async (text) => {
      // Pause scanning on successful read
      scanner.pause()
      try {
        const payload = JSON.parse(text)
        if (!payload.token) throw new Error("Invalid QR code")
        
        setStatus('Acquiring GPS location...')
        if (!navigator.geolocation) throw new Error("GPS not supported")

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                setStatus('Verifying attendance...')
                const { data: { session } } = await supabase.auth.getSession()
                
                const res = await fetch(`${API_BASE}/api/attendance/verify`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}` 
                    },
                    body: JSON.stringify({
                        token: payload.token,
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    })
                })

                if (res.ok) {
                    setSuccess(true)
                    setStatus("You're signed in!")
                    scanner.clear()
                    setTimeout(onClose, 2500)
                } else {
                    const err = await res.json()
                    setErrorMsg(err.message || 'Verification failed')
                    setStatus('Failed')
                    setTimeout(() => { setErrorMsg(''); setStatus('Scan QR'); scanner.resume() }, 3000)
                }
            },
            (err) => {
                const msgs = {
                    1: 'Location permission denied. Please allow location access in your browser settings.',
                    2: 'Could not determine location. Make sure GPS/Location is enabled.',
                    3: 'Location request timed out. Please try again.'
                }
                setErrorMsg(msgs[err.code] || `GPS Error (${err.code}): ${err.message}`)
                setStatus('Failed')
                setTimeout(() => { setErrorMsg(''); setStatus('Scan QR'); scanner.resume() }, 4000)
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
        )

      } catch (err) {
        setErrorMsg('Not a valid attendance QR')
        setStatus('Failed')
        setTimeout(() => { setErrorMsg(''); setStatus('Scan QR'); scanner.resume() }, 3000)
      }
    }, (err) => {
      // ignore scanning errors
    })

    return () => {
        scanner.clear().catch(console.error)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl relative animate-pop-in">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <MapPin size={18} className="text-sky-500" /> Scanner
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full p-1.5"><X size={18}/></button>
        </div>
        
        <div className="relative">
            {success && (
                <div className="absolute inset-0 z-10 bg-emerald-50 flex flex-col items-center justify-center gap-2 animate-fade-in">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div className="font-extrabold text-emerald-700 text-lg">Present</div>
                </div>
            )}
            <div id="reader" className="w-full"></div>
        </div>

        <div className="p-4 bg-slate-50 text-center">
            {errorMsg ? (
                <div className="text-red-500 font-bold text-sm truncate px-2">{errorMsg}</div>
            ) : (
                <div className="text-sky-600 font-bold text-sm truncate px-2">{status}</div>
            )}
        </div>
        
        {/* Custom CSS to hide html5-qrcode garbage styles */}
        <style>{`
            #reader { border: none !important; }
            #reader img { display: none !important; }
            #reader button { background: #0f172a !important; color: white !important; border: none !important; padding: 6px 12px !important; border-radius: 8px !important; font-size: 13px!important; font-weight: bold!important; margin-bottom: 15px!important; cursor: pointer; }
            #reader a { display: none !important; }
            #reader select { padding: 6px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 10px; width: 80%; }
        `}</style>
      </div>
    </div>
  )
}
