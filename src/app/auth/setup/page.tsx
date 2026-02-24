'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

// Capture invite tokens from hash at module load, before Supabase can clear them
const _hash = typeof window !== 'undefined' ? window.location.hash : ''
const _params = new URLSearchParams(_hash.slice(1))
const INVITE_ACCESS_TOKEN = _params.get('access_token')
const INVITE_REFRESH_TOKEN = _params.get('refresh_token')
const INVITE_TYPE = _params.get('type')

export default function AuthSetup() {
  const [ready, setReady] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    async function initInviteSession() {
      if (INVITE_ACCESS_TOKEN && INVITE_REFRESH_TOKEN && INVITE_TYPE === 'invite') {
        // Sign out any existing session (e.g. consultant logged in)
        await supabase.auth.signOut()

        // Explicitly set the invite session from the hash tokens
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: INVITE_ACCESS_TOKEN,
          refresh_token: INVITE_REFRESH_TOKEN,
        })

        if (!sessionError && data.session) {
          setUserEmail(data.session.user.email ?? null)
          setReady(true)
          return
        }

        setError('El link de invitación expiró o ya fue usado. Solicita uno nuevo.')
        return
      }

      // No invite tokens in URL — check if there's already a valid session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUserEmail(session.user.email ?? null)
        setReady(true)
      } else {
        setError('No se encontró una sesión válida. Usa el link de invitación.')
      }
    }

    initInviteSession()
  }, [])

  async function handleSetPassword() {
    if (!password) { setError('Ingresa una contraseña'); return }
    if (password.length < 6) { setError('Mínimo 6 caracteres'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    if (!userEmail) { setError('No se detectó el email. Usa el link de invitación de nuevo.'); return }

    setSaving(true)
    setError('')

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(`Error al guardar contraseña: ${updateError.message}`)
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

        {!ready && !error && (
          <p className="text-slate-500 text-sm text-center py-4">Verificando invitación...</p>
        )}

        {error && !ready && (
          <p className="text-red-400 text-sm text-center py-4">{error}</p>
        )}

        {ready && (
          <div className="space-y-4">
            {userEmail && (
              <p className="text-slate-500 text-xs text-center">
                Configurando acceso para <span className="text-slate-300">{userEmail}</span>
              </p>
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
