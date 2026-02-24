'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

// ─── Supabase migration ──────────────────────────────────────────────────────
// Run this SQL in your Supabase dashboard before using this page:
//
// CREATE TABLE diagnostics (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
//   credibilidad numeric(3,1) NOT NULL,
//   capacidad_comercial numeric(3,1) NOT NULL,
//   posicionamiento numeric(3,1) NOT NULL,
//   operacion numeric(3,1) NOT NULL,
//   answers jsonb,
//   created_at timestamptz DEFAULT now()
// );
// ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "authenticated users manage diagnostics"
//   ON diagnostics FOR ALL TO authenticated
//   USING (true) WITH CHECK (true);
// ─────────────────────────────────────────────────────────────────────────────

type DimensionKey = 'credibilidad' | 'capacidad_comercial' | 'posicionamiento' | 'operacion'
type Scores = Record<DimensionKey, number>

const DIMENSIONS = [
  {
    id: 'credibilidad' as DimensionKey,
    label: 'Credibilidad documentada',
    colorBar: 'bg-blue-500',
    colorLabel: 'text-blue-400',
    colorBorder: 'border-blue-500/20',
    colorBg: 'bg-blue-500/10',
    questions: [
      { id: 'c1', text: '¿Tienen casos de éxito documentados y disponibles para compartir con prospectos?' },
      { id: 'c2', text: '¿Cuentan con testimonios o referencias verificables de clientes anteriores?' },
      { id: 'c3', text: '¿Tienen un portafolio o historial de proyectos visible y actualizado?' },
    ],
  },
  {
    id: 'capacidad_comercial' as DimensionKey,
    label: 'Capacidad comercial',
    colorBar: 'bg-purple-500',
    colorLabel: 'text-purple-400',
    colorBorder: 'border-purple-500/20',
    colorBg: 'bg-purple-500/10',
    questions: [
      { id: 'cc1', text: '¿Tienen un proceso de ventas definido y documentado?' },
      { id: 'cc2', text: '¿Pueden generar propuestas comerciales en menos de 48 horas?' },
      { id: 'cc3', text: '¿Tienen métricas de seguimiento de oportunidades comerciales activas?' },
    ],
  },
  {
    id: 'posicionamiento' as DimensionKey,
    label: 'Posicionamiento',
    colorBar: 'bg-emerald-500',
    colorLabel: 'text-emerald-400',
    colorBorder: 'border-emerald-500/20',
    colorBg: 'bg-emerald-500/10',
    questions: [
      { id: 'p1', text: '¿Tienen clara su propuesta de valor diferenciada respecto a la competencia?' },
      { id: 'p2', text: '¿Su mercado objetivo está claramente definido y segmentado?' },
      { id: 'p3', text: '¿Tienen presencia digital activa y consistente con su propuesta de valor?' },
    ],
  },
  {
    id: 'operacion' as DimensionKey,
    label: 'Operación y estructura',
    colorBar: 'bg-amber-500',
    colorLabel: 'text-amber-400',
    colorBorder: 'border-amber-500/20',
    colorBg: 'bg-amber-500/10',
    questions: [
      { id: 'o1', text: '¿Tienen procesos operativos documentados que permitan replicabilidad?' },
      { id: 'o2', text: '¿La estructura del equipo y sus roles están claramente definidos?' },
      { id: 'o3', text: '¿La empresa puede operar y escalar sin depender de una persona clave?' },
    ],
  },
]

const TOTAL_QUESTIONS = DIMENSIONS.reduce((sum, d) => sum + d.questions.length, 0)

function scoreLabel(score: number): string {
  if (score <= 2.0) return 'Bajo'
  if (score <= 3.0) return 'En desarrollo'
  if (score <= 4.0) return 'Intermedio'
  return 'Avanzado'
}

function calcAvg(ids: string[], answers: Record<string, number>): number {
  const total = ids.reduce((sum, id) => sum + (answers[id] ?? 0), 0)
  return Math.round((total / ids.length) * 10) / 10
}

export default function DiagnosticoPage() {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [scores, setScores] = useState<Scores | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [narrative, setNarrative] = useState<string | null>(null)
  const [generatingNarrative, setGeneratingNarrative] = useState(false)

  const router = useRouter()
  const params = useParams()
  const company_id = params.company_id as string
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', company_id)
        .single()
      setCompanyName(company?.name ?? '')

      const { data: diagnostic } = await supabase
        .from('diagnostics')
        .select('credibilidad, capacidad_comercial, posicionamiento, operacion, narrative')
        .eq('company_id', company_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (diagnostic) {
        setScores({
          credibilidad: diagnostic.credibilidad,
          capacidad_comercial: diagnostic.capacidad_comercial,
          posicionamiento: diagnostic.posicionamiento,
          operacion: diagnostic.operacion,
        })
        setNarrative(diagnostic.narrative ?? null)
      }

      setLoading(false)
    }
    load()
  }, [company_id])

  const totalAnswered = Object.keys(answers).length
  const allAnswered = totalAnswered === TOTAL_QUESTIONS

  async function handleSubmit() {
    if (!allAnswered) {
      setError('Por favor responde todas las preguntas antes de continuar.')
      return
    }
    setSaving(true)
    setError('')

    const computed: Scores = {
      credibilidad: calcAvg(['c1', 'c2', 'c3'], answers),
      capacidad_comercial: calcAvg(['cc1', 'cc2', 'cc3'], answers),
      posicionamiento: calcAvg(['p1', 'p2', 'p3'], answers),
      operacion: calcAvg(['o1', 'o2', 'o3'], answers),
    }

    const { data: inserted, error: dbError } = await supabase
      .from('diagnostics')
      .insert({ company_id, ...computed, answers })
      .select('id')
      .single()

    if (dbError) {
      setError(`Error al guardar: ${dbError.message}`)
      setSaving(false)
      return
    }

    setScores(computed)
    setSaving(false)

    // Generate narrative in background
    if (inserted?.id) {
      setGeneratingNarrative(true)
      try {
        const res = await fetch('/api/generate-narrative', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ diagnostic_id: inserted.id, ...computed }),
        })
        const json = await res.json()
        if (json.narrative) setNarrative(json.narrative)
      } finally {
        setGeneratingNarrative(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Cargando...</p>
      </div>
    )
  }

  const overallScore = scores
    ? Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / 4) * 10) / 10
    : null

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
          {companyName && (
            <p className="text-slate-400 text-sm mb-1">{companyName}</p>
          )}
          <h2 className="text-2xl font-bold">Diagnóstico inicial</h2>
          <p className="text-slate-500 text-sm mt-2">
            Evalúa la empresa en 4 dimensiones clave para identificar oportunidades de mejora.
          </p>
        </div>

        {scores ? (
          /* ── Results view ─────────────────────────────────────────────── */
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-2xl p-8 text-center border border-slate-800">
              <p className="text-slate-400 text-sm mb-3">Puntuación global</p>
              <p className="text-7xl font-bold text-white tabular-nums">{overallScore}</p>
              <p className="text-slate-500 text-sm mt-1">de 5.0</p>
              <span className="inline-block mt-4 px-4 py-1.5 bg-blue-500/15 text-blue-400 text-sm font-semibold rounded-full">
                {scoreLabel(overallScore!)}
              </span>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
              <h3 className="text-base font-semibold text-slate-200 mb-6">Scorecard por dimensión</h3>
              <div className="space-y-6">
                {DIMENSIONS.map(dim => {
                  const score = scores[dim.id]
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
                          className={`h-full ${dim.colorBar} rounded-full transition-all duration-700 ease-out`}
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Narrative */}
            {generatingNarrative ? (
              <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
                <h3 className="text-base font-semibold text-slate-200 mb-4">Análisis</h3>
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-slate-800 rounded w-full" />
                  <div className="h-3 bg-slate-800 rounded w-5/6" />
                  <div className="h-3 bg-slate-800 rounded w-4/6" />
                  <div className="h-3 bg-slate-800 rounded w-full mt-4" />
                  <div className="h-3 bg-slate-800 rounded w-3/4" />
                </div>
                <p className="text-slate-500 text-xs mt-4">Generando análisis con IA...</p>
              </div>
            ) : narrative ? (
              <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
                <h3 className="text-base font-semibold text-slate-200 mb-4">Análisis</h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{narrative}</p>
              </div>
            ) : null}

            <button
              onClick={() => { setScores(null); setAnswers({}); setNarrative(null) }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl transition-colors text-sm"
            >
              Hacer nuevo diagnóstico
            </button>
          </div>
        ) : (
          /* ── Questionnaire view ───────────────────────────────────────── */
          <div className="space-y-5">
            {DIMENSIONS.map((dim, dimIdx) => (
              <div
                key={dim.id}
                className={`bg-slate-900 rounded-2xl p-6 border ${dim.colorBorder}`}
              >
                <div className={`inline-flex items-center px-3 py-1 rounded-full ${dim.colorBg} mb-5`}>
                  <span className={`text-xs font-semibold ${dim.colorLabel}`}>
                    {dimIdx + 1}. {dim.label}
                  </span>
                </div>

                <div className="space-y-7">
                  {dim.questions.map((q, qIdx) => {
                    const globalIdx = dimIdx * 3 + qIdx + 1
                    const selected = answers[q.id]

                    return (
                      <div key={q.id}>
                        <p className="text-slate-200 text-sm mb-3 leading-relaxed">
                          <span className="text-slate-500 mr-1">{globalIdx}.</span>
                          {q.text}
                        </p>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(val => (
                            <button
                              key={val}
                              onClick={() => setAnswers(prev => ({ ...prev, [q.id]: val }))}
                              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                selected === val
                                  ? `${dim.colorBar} text-white shadow-lg`
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between mt-1.5 px-0.5">
                          <span className="text-slate-600 text-xs">Nada</span>
                          <span className="text-slate-600 text-xs">Completamente</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${(totalAnswered / TOTAL_QUESTIONS) * 100}%` }}
                />
              </div>
              <span className="text-slate-400 text-sm tabular-nums shrink-0">
                {totalAnswered}/{TOTAL_QUESTIONS}
              </span>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={saving || !allAnswered}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {saving ? 'Guardando...' : 'Ver resultados'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
