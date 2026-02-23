'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ClientShell } from '../_components/ClientShell'

type Session = {
  id: string
  company_id: string
  session_date: string
  notes: string | null
  summary: string | null
  created_at: string
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-CL', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function ClienteSesionesPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data: userRecord } = await supabase
        .from('users').select('company_id, role').eq('id', user.id).single()

      if (!userRecord || userRecord.role !== 'cliente') {
        router.push('/auth'); return
      }

      const company_id = userRecord.company_id

      const [{ data: companyData }, { data: sessionsData }] = await Promise.all([
        supabase.from('companies').select('name').eq('id', company_id).single(),
        supabase.from('sessions').select('*').eq('company_id', company_id).order('session_date', { ascending: false }),
      ])

      setCompanyName(companyData?.name ?? '')
      setSessions(sessionsData ?? [])
      setLoading(false)
    }
    load()
  }, [])

  function startEditing(session: Session) {
    setEditingId(session.id)
    setEditNotes(session.notes ?? '')
    setExpandedId(session.id)
  }

  async function saveNotes(id: string) {
    setEditSaving(true)
    const { error } = await supabase
      .from('sessions')
      .update({ notes: editNotes.trim() || null })
      .eq('id', id)

    if (!error) {
      setSessions(prev => prev.map(s =>
        s.id === id ? { ...s, notes: editNotes.trim() || null } : s
      ))
      setEditingId(null)
    }
    setEditSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Cargando...</p>
      </div>
    )
  }

  return (
    <ClientShell companyName={companyName} active="sesiones">
      <div className="px-8 py-8 max-w-3xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Sesiones</h2>
          <p className="text-slate-400 text-sm mt-1">Documentación de tus sesiones de consultoría</p>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800">
            <p className="text-slate-400 mb-1">Sin sesiones registradas</p>
            <p className="text-slate-500 text-sm">Tu consultor registrará las sesiones aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, idx) => {
              const isExpanded = expandedId === session.id
              const isEditing = editingId === session.id
              const isFirst = idx === 0

              return (
                <div key={session.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="px-5 py-4 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{formatDateShort(session.session_date)}</p>
                        {isFirst && (
                          <span className="text-xs px-2 py-0.5 bg-blue-500/15 text-blue-400 rounded-full">Última</span>
                        )}
                      </div>
                      {!isExpanded && session.summary && (
                        <p className="text-slate-500 text-xs mt-0.5 truncate max-w-sm">{session.summary}</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setExpandedId(isExpanded ? null : session.id)
                        if (isEditing) setEditingId(null)
                      }}
                      className="text-slate-500 hover:text-white transition-colors w-6 text-center shrink-0"
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-800 px-5 py-4 space-y-5">
                      {/* Consultant summary — read-only */}
                      {session.summary && (
                        <div>
                          <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-2">Resumen del consultor</p>
                          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{session.summary}</p>
                        </div>
                      )}

                      {/* Client notes — editable */}
                      <div>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-2">Mis notas</p>
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              value={editNotes}
                              onChange={e => setEditNotes(e.target.value)}
                              placeholder="Agrega tus notas sobre esta sesión..."
                              rows={4}
                              autoFocus
                              className="w-full bg-slate-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveNotes(session.id)}
                                disabled={editSaving}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                              >
                                {editSaving ? 'Guardando...' : 'Guardar notas'}
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded-lg transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {session.notes ? (
                              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap mb-2">{session.notes}</p>
                            ) : (
                              <p className="text-slate-600 text-sm mb-2">Sin notas todavía.</p>
                            )}
                            <button
                              onClick={() => startEditing(session)}
                              className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                            >
                              {session.notes ? 'Editar notas →' : '+ Agregar notas'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ClientShell>
  )
}
