'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

type Status = 'pending' | 'in_progress' | 'completed' | 'at_risk'

type Task = {
  id: string
  roadmap_item_id: string
  title: string
  status: string
  completed_at: string | null
}

type RoadmapItem = {
  id: string
  title: string
  description: string | null
  status: Status
  due_date: string | null
  tasks: Task[]
}

const STATUS_CONFIG: Record<Status, { label: string; classes: string }> = {
  pending:     { label: 'Pendiente',   classes: 'text-slate-400 bg-slate-800' },
  in_progress: { label: 'En progreso', classes: 'text-blue-400 bg-blue-500/15' },
  completed:   { label: 'Completado',  classes: 'text-emerald-400 bg-emerald-500/15' },
  at_risk:     { label: 'En riesgo',   classes: 'text-red-400 bg-red-500/15' },
}

const STATUS_CYCLE: Status[] = ['pending', 'in_progress', 'completed', 'at_risk']

function nextStatus(current: Status): Status {
  return STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-CL', {
    day: 'numeric', month: 'short',
  })
}

export default function RoadmapPage() {
  const [items, setItems] = useState<RoadmapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTaskText, setNewTaskText] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

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

      const { data: roadmapData } = await supabase
        .from('roadmap_items')
        .select('*')
        .eq('company_id', company_id)
        .order('created_at', { ascending: true })

      const itemIds = (roadmapData ?? []).map(i => i.id)
      const { data: tasksData } = itemIds.length
        ? await supabase
            .from('tasks')
            .select('*')
            .in('roadmap_item_id', itemIds)
            .order('created_at', { ascending: true })
        : { data: [] }

      setItems(
        (roadmapData ?? []).map(item => ({
          ...item,
          tasks: (tasksData ?? []).filter(t => t.roadmap_item_id === item.id),
        }))
      )
      setLoading(false)
    }
    load()
  }, [company_id])

  const total = items.length
  const completedCount = items.filter(i => i.status === 'completed').length
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0

  async function addItem() {
    if (!newTitle.trim()) return
    setSaving(true)
    setSaveError('')

    const { data, error } = await supabase
      .from('roadmap_items')
      .insert({
        company_id,
        title: newTitle.trim(),
        description: newDesc.trim() || null,
        due_date: newDate || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      setSaveError(`Error: ${error.message}`)
      setSaving(false)
      return
    }
    if (data) {
      setItems(prev => [...prev, { ...data, tasks: [] }])
      setNewTitle('')
      setNewDesc('')
      setNewDate('')
      setShowAddForm(false)
      setExpandedId(data.id)
    }
    setSaving(false)
  }

  async function cycleStatus(item: RoadmapItem) {
    const next = nextStatus(item.status)
    await supabase.from('roadmap_items').update({ status: next }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: next } : i))
  }

  async function deleteItem(id: string) {
    await supabase.from('roadmap_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  async function addTask(itemId: string) {
    const text = (newTaskText[itemId] ?? '').trim()
    if (!text) return

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        roadmap_item_id: itemId,
        company_id,
        title: text,
        status: 'pending',
      })
      .select()
      .single()

    if (error) return
    if (data) {
      setItems(prev => prev.map(i =>
        i.id === itemId ? { ...i, tasks: [...i.tasks, data] } : i
      ))
      setNewTaskText(prev => ({ ...prev, [itemId]: '' }))
    }
  }

  async function toggleTask(itemId: string, task: Task) {
    const isDone = task.status === 'completed'
    const newStatus = isDone ? 'pending' : 'completed'
    const completedAt = isDone ? null : new Date().toISOString()

    await supabase
      .from('tasks')
      .update({ status: newStatus, completed_at: completedAt })
      .eq('id', task.id)

    setItems(prev => prev.map(i =>
      i.id === itemId
        ? { ...i, tasks: i.tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t) }
        : i
    ))
  }

  async function deleteTask(itemId: string, taskId: string) {
    await supabase.from('tasks').delete().eq('id', taskId)
    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, tasks: i.tasks.filter(t => t.id !== taskId) } : i
    ))
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
            <h2 className="text-2xl font-bold">Roadmap 90 días</h2>
            <span className="text-slate-500 text-sm">{completedCount}/{total} completados</span>
          </div>
          <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {items.length === 0 && !showAddForm && (
            <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800">
              <p className="text-slate-400 mb-1">Sin hitos todavía</p>
              <p className="text-slate-500 text-sm">Agrega el primer hito del roadmap</p>
            </div>
          )}

          {items.map((item, idx) => {
            const cfg = STATUS_CONFIG[item.status as Status] ?? STATUS_CONFIG.pending
            const isExpanded = expandedId === item.id
            const doneTasks = item.tasks.filter(t => t.status === 'completed').length
            const totalTasks = item.tasks.length

            return (
              <div key={item.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-5 py-4 flex items-center gap-3">
                  <span className="text-slate-600 text-sm font-mono w-5 shrink-0 text-center">
                    {idx + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium leading-snug">{item.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {item.due_date && (
                        <span className="text-slate-500 text-xs">{formatDate(item.due_date)}</span>
                      )}
                      {totalTasks > 0 && (
                        <span className="text-slate-600 text-xs">{doneTasks}/{totalTasks} tareas</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => cycleStatus(item)}
                      title="Clic para cambiar estado"
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${cfg.classes}`}
                    >
                      {cfg.label}
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="text-slate-500 hover:text-white transition-colors w-6 text-center"
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-slate-700 hover:text-red-400 transition-colors w-5 text-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-800 px-5 py-4">
                    {item.description && (
                      <p className="text-slate-400 text-sm mb-4 leading-relaxed">{item.description}</p>
                    )}

                    <div className="space-y-2 mb-4">
                      {item.tasks.length === 0 && (
                        <p className="text-slate-600 text-sm">Sin tareas aún.</p>
                      )}
                      {item.tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 group">
                          <button
                            onClick={() => toggleTask(item.id, task)}
                            className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-all ${
                              task.status === 'completed'
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'border-slate-600 hover:border-slate-400'
                            }`}
                          >
                            {task.status === 'completed' && (
                              <span className="text-white text-xs leading-none">✓</span>
                            )}
                          </button>
                          <span className={`text-sm flex-1 ${
                            task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}>
                            {task.title}
                          </span>
                          <button
                            onClick={() => deleteTask(item.id, task.id)}
                            className="text-slate-700 hover:text-red-400 transition-colors text-xs opacity-0 group-hover:opacity-100 w-4"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTaskText[item.id] ?? ''}
                        onChange={e => setNewTaskText(prev => ({ ...prev, [item.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addTask(item.id)}
                        placeholder="Nueva tarea..."
                        className="flex-1 bg-slate-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                      />
                      <button
                        onClick={() => addTask(item.id)}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-3 py-2 rounded-lg transition-colors"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {showAddForm && (
            <div className="bg-slate-900 rounded-xl border border-blue-500/30 p-5">
              <p className="text-sm font-semibold text-slate-300 mb-4">Nuevo hito</p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addItem()}
                  placeholder="Título del hito *"
                  autoFocus
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                />
                <input
                  type="text"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Descripción (opcional)"
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                />
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                />
                {saveError && <p className="text-red-400 text-xs">{saveError}</p>}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={addItem}
                    disabled={saving || !newTitle.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    {saving ? 'Guardando...' : 'Crear hito'}
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setNewTitle(''); setNewDesc(''); setNewDate(''); setSaveError('') }}
                    className="px-5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 border border-dashed border-slate-700 hover:border-slate-500 rounded-xl text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              + Agregar hito
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
