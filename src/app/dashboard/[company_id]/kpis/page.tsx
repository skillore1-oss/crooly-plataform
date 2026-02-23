'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import {
  LineChart, Line, ResponsiveContainer, Tooltip, XAxis,
} from 'recharts'

type KpiEntry = {
  id: string
  company_id: string
  week_date: string
  active_contacts: number | null
  monitored_tenders: number | null
  proposals_sent: number | null
  pipeline_value: number | null
  notes: string | null
}

const METRICS = [
  { key: 'active_contacts',   label: 'Reuniones activas',        color: '#3b82f6' },
  { key: 'monitored_tenders', label: 'Licitaciones en radar',    color: '#8b5cf6' },
  { key: 'proposals_sent',    label: 'Propuestas presentadas',   color: '#10b981' },
  { key: 'pipeline_value',    label: 'Pipeline estimado (CLP)',  color: '#f59e0b' },
] as const

type MetricKey = typeof METRICS[number]['key']

function formatPipeline(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v.toLocaleString('es-CL')}`
}

function formatValue(key: MetricKey, v: number): string {
  if (key === 'pipeline_value') return formatPipeline(v)
  return v.toString()
}

function formatWeek(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-CL', {
    day: 'numeric', month: 'short',
  })
}

export default function KpisPage() {
  const [entries, setEntries] = useState<KpiEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [weekDate, setWeekDate] = useState(new Date().toISOString().split('T')[0])
  const [activeContacts, setActiveContacts] = useState('')
  const [monitoredTenders, setMonitoredTenders] = useState('')
  const [proposalsSent, setProposalsSent] = useState('')
  const [pipelineValue, setPipelineValue] = useState('')
  const [notes, setNotes] = useState('')
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

      const { data } = await supabase
        .from('kpis')
        .select('*')
        .eq('company_id', company_id)
        .order('week_date', { ascending: true })

      setEntries(data ?? [])
      setLoading(false)
    }
    load()
  }, [company_id])

  const latest = entries[entries.length - 1] ?? null

  async function saveEntry() {
    setSaving(true)
    setSaveError('')

    const { data, error } = await supabase
      .from('kpis')
      .insert({
        company_id,
        week_date: weekDate,
        active_contacts: activeContacts ? parseInt(activeContacts) : null,
        monitored_tenders: monitoredTenders ? parseInt(monitoredTenders) : null,
        proposals_sent: proposalsSent ? parseInt(proposalsSent) : null,
        pipeline_value: pipelineValue ? parseInt(pipelineValue) : null,
        notes: notes.trim() || null,
      })
      .select()
      .single()

    if (error) {
      setSaveError(`Error: ${error.message}`)
      setSaving(false)
      return
    }
    if (data) {
      setEntries(prev =>
        [...prev, data].sort((a, b) =>
          new Date(a.week_date).getTime() - new Date(b.week_date).getTime()
        )
      )
      setActiveContacts('')
      setMonitoredTenders('')
      setProposalsSent('')
      setPipelineValue('')
      setNotes('')
      setShowForm(false)
    }
    setSaving(false)
  }

  async function deleteEntry(id: string) {
    await supabase.from('kpis').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
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

      <main className="px-8 py-8 max-w-4xl mx-auto">
        <div className="mb-8">
          {companyName && <p className="text-slate-400 text-sm mb-1">{companyName}</p>}
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-bold">KPIs y métricas</h2>
            {!showForm && (
              <button
                onClick={() => {
                  setWeekDate(new Date().toISOString().split('T')[0])
                  setShowForm(true)
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                + Registrar semana
              </button>
            )}
          </div>
        </div>

        {/* Latest values — metric cards */}
        {latest && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {METRICS.map(m => {
              const val = latest[m.key]
              const prev = entries[entries.length - 2]?.[m.key] ?? null
              const delta = val !== null && prev !== null ? val - prev : null

              return (
                <div key={m.key} className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                  <p className="text-slate-500 text-xs leading-tight mb-2">{m.label}</p>
                  <p className="text-3xl font-bold text-white tabular-nums">
                    {val !== null ? formatValue(m.key, val) : '—'}
                  </p>
                  {delta !== null && (
                    <p className={`text-xs mt-1 ${delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                      {delta > 0 ? `+${formatValue(m.key, delta)}` : delta < 0 ? `-${formatValue(m.key, Math.abs(delta))}` : '0'} vs semana anterior
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Sparklines */}
        {entries.length > 1 && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {METRICS.map(m => {
              const chartData = entries.map(e => ({
                week: formatWeek(e.week_date),
                value: e[m.key] ?? 0,
              }))

              return (
                <div key={m.key} className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                  <p className="text-slate-400 text-xs font-medium mb-3">{m.label}</p>
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="week" hide />
                        <Tooltip
                          content={({ active, payload, label }) =>
                            active && payload?.[0] ? (
                              <div className="bg-slate-800 text-white text-xs px-2 py-1.5 rounded shadow border border-slate-700">
                                <p className="text-slate-400 mb-0.5">{label}</p>
                                <p className="font-semibold">{formatValue(m.key, payload[0].value as number)}</p>
                              </div>
                            ) : null
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={m.color}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 3, fill: m.color }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* New entry form */}
        {showForm && (
          <div className="bg-slate-900 rounded-xl border border-blue-500/30 p-5 mb-6">
            <p className="text-sm font-semibold text-slate-300 mb-4">Registrar semana</p>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">Fecha de la semana</label>
                <input
                  type="date"
                  value={weekDate}
                  onChange={e => setWeekDate(e.target.value)}
                  className="bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block">Reuniones activas</label>
                  <input
                    type="number"
                    value={activeContacts}
                    onChange={e => setActiveContacts(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block">Licitaciones en radar</label>
                  <input
                    type="number"
                    value={monitoredTenders}
                    onChange={e => setMonitoredTenders(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block">Propuestas presentadas</label>
                  <input
                    type="number"
                    value={proposalsSent}
                    onChange={e => setProposalsSent(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block">Pipeline estimado (CLP)</label>
                  <input
                    type="number"
                    value={pipelineValue}
                    onChange={e => setPipelineValue(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">Notas de la semana (opcional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ej: Primera reunión con Codelco, propuesta técnica enviada..."
                  rows={2}
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 resize-none"
                />
              </div>

              {saveError && <p className="text-red-400 text-xs">{saveError}</p>}

              <div className="flex gap-2">
                <button
                  onClick={saveEntry}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {saving ? 'Guardando...' : 'Guardar semana'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setSaveError('') }}
                  className="px-5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {entries.length === 0 && !showForm ? (
          <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800">
            <p className="text-slate-400 mb-1">Sin registros todavía</p>
            <p className="text-slate-500 text-sm">Registra la primera semana de métricas</p>
          </div>
        ) : entries.length > 0 && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800">
              <p className="text-slate-400 text-sm font-medium">Historial</p>
            </div>
            <div className="divide-y divide-slate-800">
              {[...entries].reverse().map(entry => (
                <div key={entry.id} className="px-5 py-4 flex items-start gap-4 group">
                  <div className="shrink-0 w-20">
                    <p className="text-slate-400 text-sm font-medium">{formatWeek(entry.week_date)}</p>
                  </div>
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1">
                    {METRICS.map(m => (
                      <div key={m.key}>
                        <span className="text-slate-600 text-xs">{m.label.split(' ')[0]}: </span>
                        <span className="text-slate-300 text-sm font-medium">
                          {entry[m.key] !== null ? formatValue(m.key, entry[m.key]!) : '—'}
                        </span>
                      </div>
                    ))}
                    {entry.notes && (
                      <div className="col-span-2 md:col-span-4 mt-1">
                        <span className="text-slate-500 text-xs">{entry.notes}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-slate-700 hover:text-red-400 transition-colors text-xs opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
