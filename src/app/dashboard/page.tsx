'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Company = {
  id: string
  name: string
  contact_name: string
  contact_email: string
  created_at: string
}

export default function Dashboard() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      const { data } = await supabase.from('companies').select('*').order('created_at', { ascending: false })
      setCompanies(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">Crooly</h1>
          <p className="text-slate-400 text-xs">Panel Consultor</p>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/dashboard/playbooks')} className="text-slate-400 hover:text-white text-sm transition-colors">
            Playbooks
          </button>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white text-sm transition-colors">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="px-8 py-8 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Empresas activas</h2>
          <button
            onClick={() => router.push('/dashboard/nueva-empresa')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Nueva empresa
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400">Cargando...</p>
        ) : companies.length === 0 ? (
          <div className="bg-slate-900 rounded-2xl p-12 text-center">
            <p className="text-slate-400 text-lg mb-2">No hay empresas todavía</p>
            <p className="text-slate-500 text-sm">Agrega tu primer cliente para comenzar</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {companies.map(company => (
              <div
                key={company.id}
                onClick={() => router.push(`/dashboard/${company.id}`)}
                className="bg-slate-900 rounded-xl p-6 flex justify-between items-center cursor-pointer hover:bg-slate-800 transition-colors border border-slate-800 hover:border-slate-700"
              >
                <div>
                  <h3 className="font-semibold text-white text-lg">{company.name}</h3>
                  <p className="text-slate-400 text-sm mt-1">{company.contact_name} · {company.contact_email}</p>
                </div>
                <span className="text-slate-500 text-xl">→</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
