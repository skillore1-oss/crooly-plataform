'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthSetup() {
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Listen for the SIGNED_IN event that fires when Supabase
    // processes the invite token in the URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        setReady(true)
      }
    })

    // Also check if session already exists (direct page visit)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSetPassword() {
    if (!password) { setError('Ingresa una contraseña'); return }
    if (password.length < 6) { setError('Mínimo 6 caracteres'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }

    setSaving(true)
    setError('')

    // Get email before updating password
    const { data: { user } } = await supabase.auth.getUser()
    const email = user?.email

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    // Sign in with new password to ensure a fresh session
    if (email) {
      await supabase.auth.signInWithPassword({ email, password })
    }

    router.push('/cliente')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-md shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Crooly</h1>
          <p className="text-slate-400 mt-2 text-sm">Crea tu contraseña para acceder</p>
        </div>

        {!ready ? (
          <p className="text-slate-500 text-sm text-center py-4">Verificando invitación...</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm mb-1 block">Nueva contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-slate-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm mb-1 block">Confirmar contraseña</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSetPassword()}
                placeholder="Repite la contraseña"
                className="w-full bg-slate-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleSetPassword}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Crear contraseña y entrar'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
