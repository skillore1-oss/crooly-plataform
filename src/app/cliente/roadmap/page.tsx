'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ClientShell } from '../_components/ClientShell'

type TaskStatus = 'pending' | 'in_progress' | 'completed'

type Task = {
  id: string
  roadmap_item_id: string
  title: string
  description: string | null
  status: TaskStatus
}

type RoadmapItem = {
  id: string
  title: string
  description: string | null
  status: string
  due_date: string | null
  tasks: Task[]
}

const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; classes: string }> = {
  pending:     { label: 'Pendiente',   classes: 'text-slate-400 bg-slate-800' },
  in_progress: { label: 'En progreso', classes: 'text-blue-400 bg-blue-500/15' },
  completed:   { label: 'Completado',  classes: 'text-emerald-400 bg-emerald-500/15' },
}

const TASK_STATUS_CYCLE: TaskStatus[] = ['pending', 'in_progress', 'completed']

function nextTaskStatus(current: TaskStatus): TaskStatus {
  return TASK_STATUS_CYCLE[(TASK_STATUS_CYCLE.indexOf(current) + 1) % TASK_STATUS_CYCLE.length]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}

export default function ClienteRoadmapPage() {
  const [items, setItems] = useState<RoadmapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [taskNoteText, setTaskNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

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

      const [{ data: companyData }, { data: roadmapData }] = await Promise.all([
        supabase.from('companies').select('name').eq('id', company_id).single(),
        supabase.from('roadmap_items').select('*').eq('company_id', company_id).order('due_date', { ascending: true }),
      ])

      setCompanyName(companyData?.name ?? '')

      const itemIds = (roadmapData ?? []).map(i => i.id)
      const { data: tasksData } = itemIds.length
        ? await supabase.from('tasks').select('*').in('roadmap_item_id', itemIds).order('created_at', { ascending: true })
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
  }, [])

  async function cycleTaskStatus(itemId: string, task: Task) {
    const next = nextTaskStatus(task.status)
    const completedAt = next === 'completed' ? new Date().toISOString() : null
    await supabase.from('tasks').update({ status: next, completed_at: completedAt }).eq('id', task.id)
    setItems(prev => prev.map(i =>
      i.id === itemId
        ? { ...i, tasks: i.tasks.map(t => t.id === task.id ? { ...t, status: next } : t) }
        : i
    ))
  }

  function startEditingNote(task: Task) {
    setEditingTaskId(task.id)
    setTaskNoteText(task.description ?? '')
  }

  async function saveNote(itemId: string, taskId: string) {
    setSavingNote(true)
    const { error } = await supabase
      .from('tasks')
      .update({ description: taskNoteText.trim() || null })
      .eq('id', taskId)

    if (!error) {
      setItems(prev => prev.map(i =>
        i.id === itemId
          ? { ...i, tasks: i.tasks.map(t => t.id === taskId ? { ...t, description: taskNoteText.trim() || null } : t) }
          : i
      ))
      setEditingTaskId(null)
    }
    setSavingNote(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Cargando...</p>
      </div>
    )
  }

  const totalTasks = items.reduce((sum, i) => sum + i.tasks.length, 0)
  const doneTasks = items.reduce((sum, i) => sum + i.tasks.filter(t => t.status === 'completed').length, 0)
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <ClientShell companyName={companyName} active="roadmap">
      <div className="px-8 py-8 max-w-3xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Roadmap</h2>
          <div className="flex justify-between items-center mt-4">
            <span className="text-slate-500 text-sm">{doneTasks}/{totalTasks} tareas completadas</span>
            <span className="text-slate-500 text-sm">{progress}%</span>
          </div>
          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800">
            <p className="text-slate-400">Sin hitos en el roadmap todavía</p>
            <p className="text-slate-500 text-sm mt-1">Tu consultor definirá los hitos aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => {
              const isExpanded = expandedId === item.id
              const itemDone = item.tasks.filter(t => t.status === 'completed').length

              return (
                <div key={item.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="px-5 py-4 flex items-center gap-3">
                    <span className="text-slate-600 text-sm font-mono w-5 shrink-0 text-center">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">{item.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {item.due_date && (
                          <span className="text-slate-500 text-xs">{formatDate(item.due_date)}</span>
                        )}
                        {item.tasks.length > 0 && (
                          <span className="text-slate-600 text-xs">{itemDone}/{item.tasks.length} tareas</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="text-slate-500 hover:text-white transition-colors w-6 text-center shrink-0"
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-800 px-5 py-4">
                      {item.description && (
                        <p className="text-slate-400 text-sm mb-4 leading-relaxed">{item.description}</p>
                      )}

                      {item.tasks.length === 0 ? (
                        <p className="text-slate-600 text-sm">Sin tareas asignadas.</p>
                      ) : (
                        <div className="space-y-3">
                          {item.tasks.map(task => {
                            const cfg = TASK_STATUS_CONFIG[task.status] ?? TASK_STATUS_CONFIG.pending
                            const isEditingNote = editingTaskId === task.id

                            return (
                              <div key={task.id} className="bg-slate-800/50 rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                  <span className={`text-sm flex-1 ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                    {task.title}
                                  </span>
                                  <button
                                    onClick={() => cycleTaskStatus(item.id, task)}
                                    title="Clic para cambiar estado"
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${cfg.classes}`}
                                  >
                                    {cfg.label}
                                  </button>
                                </div>

                                {isEditingNote ? (
                                  <div className="mt-2 space-y-2">
                                    <textarea
                                      value={taskNoteText}
                                      onChange={e => setTaskNoteText(e.target.value)}
                                      placeholder="Agrega tus notas aquí..."
                                      rows={2}
                                      autoFocus
                                      className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500 resize-none"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => saveNote(item.id, task.id)}
                                        disabled={savingNote}
                                        className="text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-3 py-1.5 rounded transition-colors"
                                      >
                                        {savingNote ? 'Guardando...' : 'Guardar'}
                                      </button>
                                      <button
                                        onClick={() => setEditingTaskId(null)}
                                        className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded transition-colors"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-1.5">
                                    {task.description && (
                                      <p className="text-slate-500 text-xs mb-1 leading-relaxed">{task.description}</p>
                                    )}
                                    <button
                                      onClick={() => startEditingNote(task)}
                                      className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
                                    >
                                      {task.description ? 'Editar nota →' : '+ Agregar nota'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
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
