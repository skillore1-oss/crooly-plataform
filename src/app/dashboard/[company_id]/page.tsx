'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

type Company = {
  id: string
  name: string
  contact_name: string
  contact_email: string
  rut: string | null
}

type ClientUser = {
  id: string
  email: string
}

export default function CompanyHub() {
  const [company, setCompany] = useState<Company | null>(null)
  const [clientUsers, setClientUsers] = useState<ClientUser[]>([])
  const [loading, setLoading] = useState(true)

  // Invite form
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')

  const router = useRouter()
  const params = useParams()
  const company_id = params.company_id as string
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const [{ data: companyData }, { data: usersData }] = await Promise.all([
        supabase.from('companies').select('*').eq('id', company_id).single(),
        supabase.from('users').select('id, email').eq('company_id', company_id).eq('role', 'cliente'),
      ])

      setCompany(companyData)
      setClientUsers(usersData ?? [])
      setLoading(false)
    }
    load()
  }, [company_id])

  async function handleInvite() {
    if (!inviteEmail.trim()) return
    setInviting(true)
    setInviteError('')
    setInviteSuccess('')

    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail.trim(), company_id }),
    })

    const json = await res.json()

    if (!res.ok) {
      setInviteError(json.error ?? 'Error al enviar la invitación.')
      setInviting(false)
      return
    }

    setClientUsers(prev => [...prev, { id: json.email, email: json.email }])
    setInviteSuccess(`Invitación enviada a ${json.email}`)
    setInviteEmail('')
    setShowInviteForm(false)
    setInviting(false)
  }

  const MODULES = [
    {
      id: 'diagnostico',
      label: 'Diagnóstico',
      description: 'Scorecard de 4 dimensiones',
      path: `/dashboard/${company_id}/diagnostico`,
      available: true,
    },
    {
      id: 'roadmap',
      label: 'Roadmap',
      description: 'Hitos y tareas a 90 días',
      path: `/dashboard/${company_id}/roadmap`,
      available: true,
    },
    {
      id: 'kpis',
      label: 'KPIs',
      description: 'Métricas de tracción semanal',
      path: `/dashboard/${company_id}/kpis`,
      available: true,
    },
    {
      id: 'sesiones',
      label: 'Sesiones',
      description: 'Notas y seguimiento',
      path: `/dashboard/${company_id}/sesiones`,
      available: true,
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">Crooly</h1>
          <p className="text-slate-400 text-xs">Panel Consultor</p>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          ← Volver
        </button>
      </header>

      <main className="px-8 py-8 max-w-3xl mx-auto">
        <div className="mb-10">
          <h2 className="text-2xl font-bold">{company?.name}</h2>
          <p className="text-slate-400 text-sm mt-1">
            {company?.contact_name}
            {company?.contact_name && company?.contact_email && ' · '}
            {company?.contact_email}
            {company?.rut && ` · ${company.rut}`}
          </p>
        </div>

        {/* Module grid */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {MODULES.map(mod => (
            <button
              key={mod.id}
              onClick={() => mod.available && router.push(mod.path)}
              disabled={!mod.available}
              className={`bg-slate-900 rounded-xl p-6 text-left border transition-all ${
                mod.available
                  ? 'border-slate-800 hover:border-slate-600 hover:bg-slate-800 cursor-pointer'
                  : 'border-slate-800 opacity-40 cursor-not-allowed'
              }`}
            >
              <p className="text-white font-semibold text-lg">{mod.label}</p>
              <p className="text-slate-400 text-sm mt-1">{mod.description}</p>
              {!mod.available && (
                <span className="inline-block mt-3 text-xs text-slate-600 border border-slate-700 px-2 py-0.5 rounded-full">
                  Próximamente
                </span>
              )}
              {mod.available && (
                <span className="inline-block mt-3 text-xs text-slate-500">
                  Abrir →
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Client access section */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Acceso del cliente</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                El cliente accede a su workspace en <span className="text-slate-400">/cliente</span>
              </p>
            </div>
            {!showInviteForm && (
              <button
                onClick={() => { setShowInviteForm(true); setInviteSuccess('') }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                + Invitar cliente
              </button>
            )}
          </div>

          {/* Existing client users */}
          {clientUsers.length > 0 && (
            <div className="space-y-2 mb-4">
              {clientUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3 bg-slate-900 rounded-lg px-4 py-3 border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-300 text-sm">{u.email}</span>
                  <span className="ml-auto text-xs text-slate-600 border border-slate-700 px-2 py-0.5 rounded-full">cliente</span>
                </div>
              ))}
            </div>
          )}

          {clientUsers.length === 0 && !showInviteForm && (
            <p className="text-slate-600 text-sm">Sin usuarios cliente invitados todavía.</p>
          )}

          {/* Success message */}
          {inviteSuccess && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 mb-4">
              <span className="text-emerald-400 text-sm">✓ {inviteSuccess}</span>
            </div>
          )}

          {/* Invite form */}
          {showInviteForm && (
            <div className="bg-slate-900 rounded-xl border border-blue-500/30 p-5">
              <p className="text-sm font-semibold text-slate-300 mb-3">Invitar cliente</p>
              <p className="text-slate-500 text-xs mb-4 leading-relaxed">
                Se enviará un email de invitación. El cliente crea su contraseña y accede a <span className="text-slate-400">/cliente</span> con vista exclusiva de su empresa.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleInvite()}
                  placeholder="email@empresa.cl"
                  autoFocus
                  className="flex-1 bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                />
                <button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  {inviting ? 'Enviando...' : 'Enviar'}
                </button>
                <button
                  onClick={() => { setShowInviteForm(false); setInviteError(''); setInviteEmail('') }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm px-4 py-2.5 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
              {inviteError && (
                <p className="text-red-400 text-xs mt-3">{inviteError}</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
