'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Step = {
  title: string
  content: string
}

type Playbook = {
  id: string
  title: string
  description: string | null
  category: string | null
  content: { steps: Step[] } | null
  created_at: string
}

const CATEGORIES = [
  'Diagnóstico',
  'Planificación',
  'Implementación',
  'Otro',
]

const CATEGORY_COLORS: Record<string, string> = {
  'Diagnóstico':    'text-blue-400 bg-blue-500/10',
  'Planificación':  'text-purple-400 bg-purple-500/10',
  'Implementación': 'text-emerald-400 bg-emerald-500/10',
  'Otro':           'text-slate-400 bg-slate-700',
}

function categoryColor(cat: string | null): string {
  return CATEGORY_COLORS[cat ?? ''] ?? 'text-slate-400 bg-slate-700'
}

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  // New playbook form
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCategory, setNewCategory] = useState(CATEGORIES[0])
  const [newSteps, setNewSteps] = useState<Step[]>([{ title: '', content: '' }])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Edit state
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editSteps, setEditSteps] = useState<Step[]>([])
  const [editSaving, setEditSaving] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data } = await supabase
        .from('playbooks')
        .select('*')
        .order('created_at', { ascending: true })

      setPlaybooks(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filterCat
    ? playbooks.filter(p => p.category === filterCat)
    : playbooks

  const categories = [...new Set(playbooks.map(p => p.category).filter(Boolean))] as string[]

  // ── New playbook ──────────────────────────────────────────────────────────

  function addStep() {
    setNewSteps(prev => [...prev, { title: '', content: '' }])
  }

  function updateNewStep(idx: number, field: keyof Step, value: string) {
    setNewSteps(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  function removeNewStep(idx: number) {
    setNewSteps(prev => prev.filter((_, i) => i !== idx))
  }

  async function createPlaybook() {
    if (!newTitle.trim()) return
    setSaving(true)
    setSaveError('')

    const steps = newSteps.filter(s => s.title.trim() || s.content.trim())

    const { data, error } = await supabase
      .from('playbooks')
      .insert({
        title: newTitle.trim(),
        description: newDesc.trim() || null,
        category: newCategory,
        content: steps.length ? { steps } : null,
      })
      .select()
      .single()

    if (error) {
      setSaveError(`Error: ${error.message}`)
      setSaving(false)
      return
    }
    if (data) {
      setPlaybooks(prev => [...prev, data])
      setNewTitle('')
      setNewDesc('')
      setNewCategory(CATEGORIES[0])
      setNewSteps([{ title: '', content: '' }])
      setShowForm(false)
      setExpandedId(data.id)
    }
    setSaving(false)
  }

  // ── Edit playbook ─────────────────────────────────────────────────────────

  function startEditing(p: Playbook) {
    setEditingId(p.id)
    setEditTitle(p.title)
    setEditDesc(p.description ?? '')
    setEditCategory(p.category ?? CATEGORIES[0])
    setEditSteps(p.content?.steps ?? [{ title: '', content: '' }])
  }

  function addEditStep() {
    setEditSteps(prev => [...prev, { title: '', content: '' }])
  }

  function updateEditStep(idx: number, field: keyof Step, value: string) {
    setEditSteps(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  function removeEditStep(idx: number) {
    setEditSteps(prev => prev.filter((_, i) => i !== idx))
  }

  async function saveEdits(id: string) {
    setEditSaving(true)
    const steps = editSteps.filter(s => s.title.trim() || s.content.trim())

    const { error } = await supabase
      .from('playbooks')
      .update({
        title: editTitle.trim(),
        description: editDesc.trim() || null,
        category: editCategory,
        content: steps.length ? { steps } : null,
      })
      .eq('id', id)

    if (!error) {
      setPlaybooks(prev => prev.map(p =>
        p.id === id
          ? { ...p, title: editTitle.trim(), description: editDesc.trim() || null, category: editCategory, content: steps.length ? { steps } : null }
          : p
      ))
      setEditingId(null)
    }
    setEditSaving(false)
  }

  async function deletePlaybook(id: string) {
    await supabase.from('playbooks').delete().eq('id', id)
    setPlaybooks(prev => prev.filter(p => p.id !== id))
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
          onClick={() => router.push('/dashboard')}
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          ← Volver
        </button>
      </header>

      <main className="px-8 py-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold">Playbooks</h2>
              <p className="text-slate-500 text-sm mt-1">Guías de acción del Crooly Traction Method</p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                + Nuevo playbook
              </button>
            )}
          </div>

          {/* Category filters */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              <button
                onClick={() => setFilterCat(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  !filterCat ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Todos ({playbooks.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(filterCat === cat ? null : cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filterCat === cat ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* New playbook form */}
        {showForm && (
          <div className="bg-slate-900 rounded-xl border border-blue-500/30 p-5 mb-5">
            <p className="text-sm font-semibold text-slate-300 mb-4">Nuevo playbook</p>
            <div className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Título del playbook *"
                autoFocus
                className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
              />
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Descripción breve (opcional)"
                rows={2}
                className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 resize-none"
              />
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {/* Steps */}
              <div>
                <p className="text-slate-400 text-xs mb-2">Pasos</p>
                <div className="space-y-3">
                  {newSteps.map((step, idx) => (
                    <div key={idx} className="bg-slate-800 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs font-mono w-5">{idx + 1}.</span>
                        <input
                          type="text"
                          value={step.title}
                          onChange={e => updateNewStep(idx, 'title', e.target.value)}
                          placeholder="Título del paso"
                          className="flex-1 bg-slate-700 text-white rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                        />
                        {newSteps.length > 1 && (
                          <button
                            onClick={() => removeNewStep(idx)}
                            className="text-slate-600 hover:text-red-400 transition-colors text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <textarea
                        value={step.content}
                        onChange={e => updateNewStep(idx, 'content', e.target.value)}
                        placeholder="Descripción del paso..."
                        rows={2}
                        className="w-full bg-slate-700 text-white rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 resize-none"
                      />
                    </div>
                  ))}
                  <button
                    onClick={addStep}
                    className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                  >
                    + Agregar paso
                  </button>
                </div>
              </div>

              {saveError && <p className="text-red-400 text-xs">{saveError}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={createPlaybook}
                  disabled={saving || !newTitle.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {saving ? 'Guardando...' : 'Crear playbook'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setNewTitle(''); setNewDesc(''); setNewSteps([{ title: '', content: '' }]); setSaveError('') }}
                  className="px-5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && !showForm && (
          <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800">
            <p className="text-slate-400 mb-1">Sin playbooks todavía</p>
            <p className="text-slate-500 text-sm">Crea el primer playbook del método</p>
          </div>
        )}

        {/* Playbooks list */}
        <div className="space-y-3">
          {filtered.map(playbook => {
            const isExpanded = expandedId === playbook.id
            const isEditing = editingId === playbook.id
            const steps = playbook.content?.steps ?? []

            return (
              <div key={playbook.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-medium">{playbook.title}</p>
                      {playbook.category && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor(playbook.category)}`}>
                          {playbook.category}
                        </span>
                      )}
                      {steps.length > 0 && (
                        <span className="text-slate-600 text-xs">{steps.length} pasos</span>
                      )}
                    </div>
                    {playbook.description && !isExpanded && (
                      <p className="text-slate-500 text-xs mt-1 truncate">{playbook.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setExpandedId(isExpanded ? null : playbook.id)
                        if (isEditing) setEditingId(null)
                      }}
                      className="text-slate-500 hover:text-white transition-colors w-6 text-center"
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                    <button
                      onClick={() => deletePlaybook(playbook.id)}
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
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          autoFocus
                          className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <textarea
                          value={editDesc}
                          onChange={e => setEditDesc(e.target.value)}
                          placeholder="Descripción breve"
                          rows={2}
                          className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 resize-none"
                        />
                        <select
                          value={editCategory}
                          onChange={e => setEditCategory(e.target.value)}
                          className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div>
                          <p className="text-slate-400 text-xs mb-2">Pasos</p>
                          <div className="space-y-3">
                            {editSteps.map((step, idx) => (
                              <div key={idx} className="bg-slate-800 rounded-lg p-3 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500 text-xs font-mono w-5">{idx + 1}.</span>
                                  <input
                                    type="text"
                                    value={step.title}
                                    onChange={e => updateEditStep(idx, 'title', e.target.value)}
                                    placeholder="Título del paso"
                                    className="flex-1 bg-slate-700 text-white rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                                  />
                                  {editSteps.length > 1 && (
                                    <button onClick={() => removeEditStep(idx)} className="text-slate-600 hover:text-red-400 text-xs">✕</button>
                                  )}
                                </div>
                                <textarea
                                  value={step.content}
                                  onChange={e => updateEditStep(idx, 'content', e.target.value)}
                                  placeholder="Descripción del paso..."
                                  rows={2}
                                  className="w-full bg-slate-700 text-white rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 resize-none"
                                />
                              </div>
                            ))}
                            <button onClick={addEditStep} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                              + Agregar paso
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdits(playbook.id)}
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
                        {playbook.description && (
                          <p className="text-slate-400 text-sm leading-relaxed">{playbook.description}</p>
                        )}
                        {steps.length > 0 && (
                          <div className="space-y-3">
                            {steps.map((step, idx) => (
                              <div key={idx} className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                                  <span className="text-slate-400 text-xs font-bold">{idx + 1}</span>
                                </div>
                                <div>
                                  {step.title && (
                                    <p className="text-white text-sm font-medium">{step.title}</p>
                                  )}
                                  {step.content && (
                                    <p className="text-slate-400 text-sm mt-0.5 leading-relaxed whitespace-pre-wrap">{step.content}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {steps.length === 0 && !playbook.description && (
                          <p className="text-slate-600 text-sm">Sin contenido todavía.</p>
                        )}
                        <button
                          onClick={() => startEditing(playbook)}
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
