'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NuevaEmpresa() {
  const [name, setName] = useState('')
  const [rut, setRut] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit() {
    if (!name || !contactEmail) {
      setError('El nombre y email son obligatorios')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.from('companies').insert({
      name,
      rut,
      contact_name: contactName,
      contact_email: contactEmail
    })
    if (error) {
      setError('Error al crear la empresa')
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">Crooly</h1>
          <p className="text-slate-400 text-xs">Panel Consultor</p>
        </div>
        <button onClick={() => router.push('/dashboard')} className="text-slate-400 hover:text-white text-sm transition-colors">
          ← Volver
        </button>
      </header>

      <main className="px-8 py-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">Nueva empresa</h2>

        <div className="bg-slate-900 rounded-2xl p-8 space-y-6">
          <div>
            <label className="text-slate-300 text-sm mb-2 block">Nombre de la empresa *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Empresa de Servicios Mineros"
            />
          </div>

          <div>
            <label className="text-slate-300 text-sm mb-2 block">RUT</label>
            <input
              type="text"
              value={rut}
              onChange={e => setRut(e.target.value)}
              className="w-full bg-slate-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 76.123.456-7"
            />
          </div>

          <div>
            <label className="text-slate-300 text-sm mb-2 block">Nombre de contacto</label>
            <input
              type="text"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              className="w-full bg-slate-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Juan González"
            />
          </div>

          <div>
            <label className="text-slate-300 text-sm mb-2 block">Email de contacto *</label>
            <input
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              className="w-full bg-slate-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: contacto@empresa.cl"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear empresa'}
          </button>
        </div>
      </main>
    </div>
  )
}
