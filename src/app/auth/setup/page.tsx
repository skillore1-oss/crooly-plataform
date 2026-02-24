'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function AuthSetup() {
  const [ready, setReady] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    // Save email from session when auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        setReady(true)
        setUserEmail(session.user.email ?? null)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true)
        setUserEmail(session.user.email ?? null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSetPassword() {
    if (!password) { setError('Ingresa una contraseña'); return }
    if (password.length < 6) { setError('Mínimo 6 caracteres'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }

    setSaving(true)
    setError('')

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(`Error al guardar contraseña: ${updateError.message}`)
      setSaving(false)
      return
    }

    if (!userEmail) {
      setError('No se detectó el email de la sesión. Intenta abrir el link de invitación de nuevo.')
      setSaving(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email: userEmail, password })

    if (signInError) {
      setError(`Contraseña guardada. Inicia sesión en /auth con: ${userEmail}`)
      setSaving(false)
      return
    }

    window.location.href = '/cliente'
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
            {userEmail && (
              <p className="text-slate-500 text-xs text-center">Configurando acceso para <span className="text-slate-300">{userEmail}</span></p>
            )}
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
