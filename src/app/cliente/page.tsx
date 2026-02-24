'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ClientShell } from './_components/ClientShell'

type Company = { id: string; name: string }

const MODULES = [
  { id: 'roadmap',     label: 'Roadmap',     desc: 'Hitos y tareas',          href: '/cliente/roadmap',  active: true  },
  { id: 'kpis',        label: 'KPIs',         desc: 'Métricas semanales',       href: '/cliente/kpis',     active: true  },
  { id: 'sesiones',    label: 'Sesiones',     desc: 'Notas y documentación',    href: '/cliente/sesiones', active: true  },
  { id: 'diagnostico', label: 'Diagnóstico',  desc: 'Scorecard de la empresa',  href: '/cliente/diagnostico', active: true  },
  { id: 'playbooks',   label: 'Playbooks',    desc: 'Guías de acción',          href: '#',                 active: false },
]

export default function ClienteDashboard() {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [tasksTotal, setTasksTotal] = useState(0)
  const [tasksDone, setTasksDone] = useState(0)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data: userRecord } = await supabase
        .from('users')
        .select('company_id, role')
        .eq('id', user.id)
        .single()

      if (!userRecord || userRecord.role !== 'cliente') {
        router.push('/auth'); return
      }

      const company_id = userRecord.company_id

      const [{ data: companyData }, { data: tasks }] = await Promise.all([
        supabase.from('companies').select('id, name').eq('id', company_id).single(),
        supabase.from('tasks').select('status').eq('company_id', company_id),
      ])

      setCompany(companyData)
      if (tasks) {
        setTasksTotal(tasks.length)
        setTasksDone(tasks.filter(t => t.status === 'completed').length)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Cargando...</p>
      </div>
    )
  }

  const progress = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0

  return (
    <ClientShell companyName={company?.name ?? ''} active="inicio">
      <div className="px-8 py-8 max-w-3xl">
        <div className="mb-10">
          <h2 className="text-2xl font-bold">{company?.name}</h2>
          <p className="text-slate-400 text-sm mt-1">Bienvenido a tu plataforma de tracción</p>
        </div>

        {tasksTotal > 0 && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 mb-8">
            <div className="flex justify-between items-center mb-3">
              <p className="text-slate-300 text-sm font-medium">Progreso de tareas</p>
              <span className="text-slate-400 text-sm">{tasksDone}/{tasksTotal} completadas</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-500 text-xs mt-2">{progress}% completado</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {MODULES.map(mod => (
            <button
              key={mod.id}
              onClick={() => mod.active && router.push(mod.href)}
              disabled={!mod.active}
              className={`bg-slate-900 rounded-xl p-5 text-left border transition-all ${
                mod.active
                  ? 'border-slate-800 hover:border-slate-600 hover:bg-slate-800 cursor-pointer'
                  : 'border-slate-800 opacity-40 cursor-not-allowed'
              }`}
            >
              <p className="text-white font-semibold">{mod.label}</p>
              <p className="text-slate-400 text-xs mt-1">{mod.desc}</p>
              {!mod.active && (
                <span className="inline-block mt-2 text-xs text-slate-600 border border-slate-700 px-2 py-0.5 rounded-full">
                  Próximamente
                </span>
              )}
              {mod.active && (
                <span className="inline-block mt-2 text-xs text-slate-500">Abrir →</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </ClientShell>
  )
}
