import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    if (!email || !password) {
      setError('Please fill in all fields.')
      setLoading(false)
      return
    }
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      // Router will automatically handle redirect based on session role from App.jsx
    } catch (err) {
      setError(err.message || 'Invalid login credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left: Visual Panel ── */}
      <div className="flex-1 relative bg-slate-900 flex flex-col justify-end p-14 overflow-hidden hidden md:flex">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop"
          alt="Login Cover"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        <div className="relative z-10 animate-fade-in">
          <div className="text-3xl font-black bg-gradient-to-br from-sky-400 to-sky-600 bg-clip-text text-transparent mb-8 tracking-tight">QR ATTENDANCE</div>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-5 tracking-tight">
            Streamline your<br />
            <span className="bg-gradient-to-br from-sky-400 to-sky-600 bg-clip-text text-transparent">classroom.</span>
          </h1>
          <p className="text-lg text-white/70 leading-relaxed max-w-sm mb-8">
            Sign in to access your sessions, manage classes, and view attendance logs securely.
          </p>
          <div className="flex gap-3 flex-wrap">
            {['📍 GPS Geofencing', '🔒 Secure QR', '⚡ Real-time Data'].map(f => (
              <span key={f} className="px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-sm backdrop-blur-md">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="w-full max-w-[520px] flex flex-col justify-center p-10 bg-white overflow-y-auto">
        <div className="max-w-[380px] mx-auto w-full animate-slide-up">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Welcome back</h2>
          <p className="text-slate-500 mb-9 text-sm">
            Don't have an account? <Link to="/register" className="text-sky-500 font-semibold hover:text-sky-600 transition-colors">Sign up</Link>
          </p>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-200 mb-6 text-sm">
              <AlertCircle size={18} className="shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[11px] font-extrabold text-sky-600 uppercase tracking-wide mb-2">Email address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-1.5 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all"
                  placeholder="you@university.edu" 
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-sky-600 uppercase tracking-wide mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-white border-1.5 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all"
                  placeholder="Enter your password" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full h-[52px] flex items-center justify-center gap-2 text-[15px] font-bold text-white rounded-xl transition-all mt-2 ${loading ? 'bg-sky-200 cursor-not-allowed' : 'bg-gradient-to-br from-sky-500 to-sky-600 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(14,165,233,0.3)]'}`}
            >
              {loading ? "Signing in…" : <><span>Continue</span><ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-500 flex items-center gap-2">
            🔒 Connection secured via Supabase Auth.
          </div>
        </div>
      </div>
    </div>
  )
}
