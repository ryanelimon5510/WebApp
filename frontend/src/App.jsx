import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import ProfilePage from './pages/ProfilePage'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { Toaster } from 'react-hot-toast'

function App() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchRole = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (data) {
        setRole(data.role)
      } else {
        // Profile might not exist yet (trigger delay) — retry once after 1.5s
        setTimeout(async () => {
          const { data: retryData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()
          if (retryData) setRole(retryData.role)
          setLoading(false)
        }, 1500)
        return
      }
    } catch (err) {
      console.error('Error fetching role:', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchRole(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchRole(session.user.id)
      } else {
        setRole(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchRole])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 text-sm font-medium">Loading...</span>
        </div>
      </div>
    )
  }

  // Determine where the home route should go
  const getHomeRedirect = () => {
    if (!session) return '/login'
    if (role === 'TEACHER') return '/teacher'
    if (role === 'STUDENT') return '/student'
    // role is null but session exists — show loading rather than redirect loop
    return '/login'
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-right" />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to={getHomeRedirect()} replace />} />
          <Route path="/login" element={!session ? <Login /> : <Navigate to={getHomeRedirect()} replace />} />
          <Route path="/register" element={!session ? <Register /> : <Navigate to={getHomeRedirect()} replace />} />
          <Route path="/student" element={session && role === 'STUDENT' ? <StudentDashboard /> : <Navigate to={!session ? '/login' : '/'} replace />} />
          <Route path="/teacher" element={session && role === 'TEACHER' ? <TeacherDashboard /> : <Navigate to={!session ? '/login' : '/'} replace />} />
          <Route path="/profile" element={session ? <ProfilePage role={role} /> : <Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
