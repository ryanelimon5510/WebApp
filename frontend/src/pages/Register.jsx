import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Phone, AlertCircle, ArrowRight, Eye, EyeOff, Hash } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { API_BASE } from '../lib/api'

const ROLES = [
  { value: 'STUDENT', label: '🎓 Student', desc: 'Scan QR to log attendance' },
  { value: 'TEACHER', label: '👨‍🏫 Teacher', desc: 'Generate QR & manage classes' },
]

export default function Register() {
  const [role, setRole] = useState('STUDENT')
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [studentNumber, setStudentNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fullname || !email || !mobileNumber || !password || !confirmPassword) return setError('Please fill all required fields.')
    if (role === 'STUDENT' && !studentNumber) return setError('Student number is required for students.')
    if (password !== confirmPassword) return setError('Passwords do not match.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    
    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullname,
            role: role,
            mobile_number: mobileNumber,
            student_number: role === 'STUDENT' ? studentNumber : null,
          }
        }
      })
      if (authError) throw authError

      // Fallback: Notify backend to create public profile explicitly
      try {
          await fetch(`${API_BASE}/api/auth/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  id: data.user.id,
                  email: email,
                  fullName: fullname,
                  role: role,
                  mobileNumber: mobileNumber,
                  studentNumber: role === 'STUDENT' ? studentNumber : null
              })
          });
      } catch (backendErr) {
          console.error("Backend registration fallback failed:", backendErr);
      }

      alert('Account created! Please log in.')
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left: Visual Panel ── */}
      <div className="flex-1 relative bg-slate-900 flex flex-col justify-end p-14 overflow-hidden hidden lg:flex">
        <img 
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop"
          alt="Register Cover"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="relative z-10 animate-fade-in">
          <div className="text-3xl font-black bg-gradient-to-br from-sky-400 to-sky-600 bg-clip-text text-transparent mb-8 tracking-tight">QR ATTENDANCE</div>
          <h1 className="text-[2.75rem] font-extrabold text-white leading-tight mb-5 tracking-tight">
            Join the smart<br />
            <span className="bg-gradient-to-br from-sky-400 to-sky-600 bg-clip-text text-transparent">campus platform.</span>
          </h1>
          <p className="text-[15px] text-white/60 leading-relaxed max-w-[360px] mb-10">
            Sign up as a Student to scan into classes securely or as a Teacher to monitor attendance automatically.
          </p>
          <div className="flex flex-col gap-3 max-w-[340px]">
            {[
              { icon: '📍', title: 'Location Verified', desc: 'Prevents proxy attendance entirely' },
              { icon: '⏱️', title: 'Token Rotation', desc: 'QR codes expire every 15 seconds' },
              { icon: '⚡', title: 'Lightning Fast', desc: 'Scan and verified in ~2 seconds' }
            ].map(item => (
              <div key={item.title} className="flex items-center gap-4 p-3.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div className="text-white font-bold text-sm">{item.title}</div>
                  <div className="text-white/50 text-xs">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="w-full max-w-[560px] flex flex-col justify-center p-8 md:p-12 bg-white overflow-y-auto">
        <div className="max-w-[420px] mx-auto w-full animate-slide-up py-4">
          <h2 className="text-[1.85rem] font-extrabold text-slate-900 mb-1.5 tracking-tight">Create account</h2>
          <p className="text-slate-500 mb-7 text-sm">
            Already have an account? <Link to="/login" className="text-sky-500 font-semibold hover:text-sky-600 transition-colors">Sign in</Link>
          </p>

          {/* Role Selector */}
          <div className="flex gap-2.5 mb-6">
            {ROLES.map(r => (
              <button 
                key={r.value} 
                type="button" 
                onClick={() => setRole(r.value)}
                className={`flex-1 p-3 rounded-xl border-2 transition-all text-center ${role === r.value ? 'border-sky-500 bg-sky-50 text-slate-900' : 'border-slate-200 bg-white text-slate-500 hover:border-sky-200'}`}
              >
                <div className="text-[13px] font-bold">{r.label}</div>
                <div className="text-[11px] opacity-70 mt-0.5">{r.desc}</div>
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-200 mb-5 text-sm">
              <AlertCircle size={16} className="shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={fullname} onChange={e => setFullname(e.target.value)} className="w-full pl-10 pr-4 h-[48px] bg-white border-1.5 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all" placeholder="John Doe" />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 h-[48px] bg-white border-1.5 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all" placeholder="you@university.edu" />
                </div>
              </div>

              <div className={role === 'STUDENT' ? "col-span-1" : "col-span-2"}>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5">Mobile Number</label>
                <div className="relative">
                  <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} className="w-full pl-10 pr-4 h-[48px] bg-white border-1.5 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all" placeholder="09xxxxxxxxx" />
                </div>
              </div>

              {role === 'STUDENT' && (
                <div className="col-span-1 animate-fade-in">
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5">Student ID</label>
                  <div className="relative">
                    <Hash size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={studentNumber} onChange={e => setStudentNumber(e.target.value)} className="w-full pl-10 pr-4 h-[48px] bg-white border-1.5 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all" placeholder="2024-XXXX" />
                  </div>
                </div>
              )}
              
              <div className="col-span-1">
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-10 h-[48px] bg-white border-1.5 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all" placeholder="Min. 6 chars" />
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5">Confirm</label>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-10 h-[48px] bg-white border-1.5 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all" placeholder="Repeat" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full h-[52px] flex items-center justify-center gap-2 text-[15px] font-bold text-white rounded-xl transition-all mt-4 ${loading ? 'bg-sky-200 cursor-not-allowed' : 'bg-gradient-to-br from-sky-500 to-sky-600 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(14,165,233,0.3)]'}`}
            >
              {loading ? "Creating Account…" : <><span>Create Account</span><ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="text-center mt-6 text-xs text-slate-400 leading-relaxed">
            By creating an account you agree to our <span className="text-sky-500 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-sky-500 cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
