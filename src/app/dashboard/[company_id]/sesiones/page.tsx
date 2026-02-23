'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

type Session = {
  id: string
  company_id: string
  session_date: string
  notes: string | null
  summary: string | null
  created_at: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-CL', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function SesionesPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState('')

  // New session form
  const [showForm, setShowForm] = useState(false)
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [newNotes, setNewNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Expanded / editing session
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [editSummary, setEditSummary] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const router = useRouter()
  const params = useParams()
  const company_id = params.company_id as string
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data: company } = await supabase
        .from('companies').select('name').eq('id', company_id).single()
      setCompanyName(company?.name ?? '')

      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('company_id', company_id)
        .order('session_date', { ascending: false })

      setSessions(data ?? [])
      setLoading(false)
    }
    load()
  }, [company_id])

  async function createSession() {
    if (!newDate) return
    setSaving(true)
    setSaveError('')

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        company_id,
        session_date: newDate,
        notes: newNotes.trim() || null,
        summary: null,
      })
      .select()
      .single()

    if (error) {
      setSaveError(`Error: ${error.message}`)
      setSaving(false)
      return
    }
    if (data) {
      setSessions(prev => [data, ...prev])
      setNewDate(new Date().toISOString().split('T')[0])
      setNewNotes('')
      setShowForm(false)
      setExpandedId(data.id)
    }
    setSaving(false)
  }

  function startEditing(session: Session) {
    setEditingId(session.id)
    setEditNotes(session.notes ?? '')
    setEditSummary(session.summary ?? '')
  }

  async function saveEdits(id: string) {
    setEditSaving(true)

    const { error } = await supabase
      .from('sessions')
      .update({
        notes: editNotes.trim() || null,
        summary: editSummary.trim() || null,
      })
      .eq('id', id)

    if (!error) {
      setSessions(prev => prev.map(s =>
        s.id === id
          ? { ...s, notes: editNotes.trim() || null, summary: editSummary.trim() || null }
          : s
      ))
      setEditingId(null)
    }
    setEditSaving(false)
  }

  async function deleteSession(id: string) {
    await supabase.from('sessions').delete().eq('id', id)
    setSessions(prev => prev.filter(s => s.id !== id))
    if (expandedId === id) setExpandedId(null)
    if (editingId === id) setEditingId(null)
  }

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
          onClick={() => router.push(`/dashboard/${company_id}`)}
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          ← Volver
        </button>
      </header>

      <main className="px-8 py-8 max-w-3xl mx-auto">
        <div className="mb-8">
          {companyName && <p className="text-slate-400 text-sm mb-1">{companyName}</p>}
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-bold">Sesiones</h2>
            {!showForm && (
              <button
                onClick={() => {
                  setNewDate(new Date().toISOString().split('T')[0])
                  setShowForm(true)
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                + Nueva sesión
              </button>
            )}
          </div>
        </div>

        {/* New session form */}
        {showForm && (
          <div className="bg-slate-900 rounded-xl border border-blue-500/30 p-5 mb-5">
            <p className="text-sm font-semibold text-slate-300 mb-4">Nueva sesión</p>
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">Fecha de la sesión</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">Notas (opcional)</label>
                <textarea
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="Temas tratados, acuerdos, observaciones..."
                  rows={4}
                  autoFocus
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 resize-none"
                />
              </div>

              {saveError && <p className="text-red-400 text-xs">{saveError}</p>}

              <div className="flex gap-2">
                <button
                  onClick={createSession}
                  disabled={saving || !newDate}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {saving ? 'Guardando...' : 'Crear sesión'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setNewNotes(''); setSaveError('') }}
                  className="px-5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {sessions.length === 0 && !showForm && (
          <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800">
            <p className="text-slate-400 mb-1">Sin sesiones registradas</p>
            <p className="text-slate-500 text-sm">Registra la primera sesión con este cliente</p>
          </div>
        )}

        {/* Sessions list */}
        <div className="space-y-3">
          {sessions.map((session, idx) => {
            const isExpanded = expandedId === session.id
            const isEditing = editingId === session.id
            const isFirst = idx === 0

            return (
              <div
                key={session.id}
                className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden"
              >
                {/* Session header */}
                <div className="px-5 py-4 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">{formatDateShort(session.session_date)}</p>
                      {isFirst && (
                        <span className="text-xs px-2 py-0.5 bg-blue-500/15 text-blue-400 rounded-full">
                          Última
                        </span>
                      )}
                    </div>
                    {!isExpanded && session.notes && (
                      <p className="text-slate-500 text-xs mt-0.5 truncate max-w-sm">
                        {session.notes}
                      </p>
                    )}
                    {!isExpanded && session.summary && (
                      <p className="text-slate-600 text-xs mt-0.5 truncate max-w-sm">
                        Resumen: {session.summary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {session.notes || session.summary ? (
                      <button
                        onClick={() => {
                          setExpandedId(isExpanded ? null : session.id)
                          if (isEditing) setEditingId(null)
                        }}
                        className="text-slate-500 hover:text-white transition-colors w-6 text-center"
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setExpandedId(session.id)
                          startEditing(session)
                        }}
                        className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
                      >
                        + Agregar notas
                      </button>
                    )}
                    <button
                      onClick={() => deleteSession(session.id)}
                      className="text-slate-700 hover:text-red-400 transition-colors text-xs w-5 text-center"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-slate-800 px-5 py-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-slate-400 text-xs mb-1.5 block">Notas</label>
                          <textarea
                            value={editNotes}
                            onChange={e => setEditNotes(e.target.value)}
                            placeholder="Temas tratados, acuerdos, observaciones..."
                            rows={4}
                            autoFocus
                            className="w-full bg-slate-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 text-xs mb-1.5 block">Resumen / próximos pasos</label>
                          <textarea
                            value={editSummary}
                            onChange={e => setEditSummary(e.target.value)}
                            placeholder="Compromisos adquiridos, tareas para la próxima sesión..."
                            rows={3}
                            className="w-full bg-slate-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 resize-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdits(session.id)}
                            disabled={editSaving}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                          >
                            {editSaving ? 'Guardando...' : 'Guardar'}
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
                      <div className="space-y-4">
                        {session.notes && (
                          <div>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-2">Notas</p>
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{session.notes}</p>
                          </div>
                        )}
                        {session.summary && (
                          <div>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-2">Resumen / próximos pasos</p>
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{session.summary}</p>
                          </div>
                        )}
                        <button
                          onClick={() => startEditing(session)}
                          className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                        >
                          Editar →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
