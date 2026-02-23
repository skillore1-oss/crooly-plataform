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

export default function CompanyHub() {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const params = useParams()
  const company_id = params.company_id as string
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('id', company_id)
        .single()

      setCompany(data)
      setLoading(false)
    }
    load()
  }, [company_id])

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

        <div className="grid grid-cols-2 gap-4">
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
      </main>
    </div>
  )
}
