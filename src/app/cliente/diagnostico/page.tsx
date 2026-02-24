'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ClientShell } from '../_components/ClientShell'

type DimensionKey = 'credibilidad' | 'capacidad_comercial' | 'posicionamiento' | 'operacion'

const DIMENSIONS = [
  { id: 'credibilidad' as DimensionKey,        label: 'Credibilidad documentada', colorBar: 'bg-blue-500',    colorLabel: 'text-blue-400' },
  { id: 'capacidad_comercial' as DimensionKey, label: 'Capacidad comercial',       colorBar: 'bg-purple-500',  colorLabel: 'text-purple-400' },
  { id: 'posicionamiento' as DimensionKey,     label: 'Posicionamiento',           colorBar: 'bg-emerald-500', colorLabel: 'text-emerald-400' },
  { id: 'operacion' as DimensionKey,           label: 'Operación y estructura',    colorBar: 'bg-amber-500',   colorLabel: 'text-amber-400' },
]

function scoreLabel(score: number): string {
  if (score <= 2.0) return 'Bajo'
  if (score <= 3.0) return 'En desarrollo'
  if (score <= 4.0) return 'Intermedio'
  return 'Avanzado'
}

type Diagnostic = {
  credibilidad: number
  capacidad_comercial: number
  posicionamiento: number
  operacion: number
  narrative: string | null
  created_at: string
}

export default function ClienteDiagnosticoPage() {
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null)
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState('')

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

      const [{ data: companyData }, { data: diagData }] = await Promise.all([
        supabase.from('companies').select('name').eq('id', company_id).single(),
        supabase.from('diagnostics')
          .select('credibilidad, capacidad_comercial, posicionamiento, operacion, narrative, created_at')
          .eq('company_id', company_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])

      setCompanyName(companyData?.name ?? '')
      setDiagnostic(diagData ?? null)
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

  const overallScore = diagnostic
    ? Math.round(((diagnostic.credibilidad + diagnostic.capacidad_comercial + diagnostic.posicionamiento + diagnostic.operacion) / 4) * 10) / 10
    : null

  return (
    <ClientShell companyName={companyName} active="diagnostico">
      <div className="px-8 py-8 max-w-3xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Diagnóstico</h2>
          <p className="text-slate-400 text-sm mt-1">Evaluación de tu empresa en 4 dimensiones clave</p>
        </div>

        {!diagnostic ? (
          <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800">
            <p className="text-slate-400 mb-1">Diagnóstico pendiente</p>
            <p className="text-slate-500 text-sm">Tu consultor completará el diagnóstico pronto</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall score */}
            <div className="bg-slate-900 rounded-2xl p-8 text-center border border-slate-800">
              <p className="text-slate-400 text-sm mb-3">Puntuación global</p>
              <p className="text-7xl font-bold text-white tabular-nums">{overallScore}</p>
              <p className="text-slate-500 text-sm mt-1">de 5.0</p>
              <span className="inline-block mt-4 px-4 py-1.5 bg-blue-500/15 text-blue-400 text-sm font-semibold rounded-full">
                {scoreLabel(overallScore!)}
              </span>
            </div>

            {/* Scorecard */}
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
              <h3 className="text-base font-semibold text-slate-200 mb-6">Scorecard por dimensión</h3>
              <div className="space-y-6">
                {DIMENSIONS.map(dim => {
                  const score = diagnostic[dim.id]
                  const pct = ((score - 1) / 4) * 100
                  return (
                    <div key={dim.id}>
                      <div className="flex justify-between items-baseline mb-2">
                        <span className={`text-sm font-medium ${dim.colorLabel}`}>{dim.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-xs">{scoreLabel(score)}</span>
                          <span className="text-white font-bold text-xl tabular-nums">{score}</span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${dim.colorBar} rounded-full transition-all duration-700`}
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Narrative */}
            {diagnostic.narrative && (
              <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
                <h3 className="text-base font-semibold text-slate-200 mb-4">Análisis</h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{diagnostic.narrative}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ClientShell>
  )
}
