'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const NAV = [
  { id: 'inicio',      label: 'Inicio',      href: '/cliente' },
  { id: 'diagnostico', label: 'Diagnóstico', href: '/cliente/diagnostico' },
  { id: 'roadmap',     label: 'Roadmap',     href: '/cliente/roadmap' },
  { id: 'kpis',        label: 'KPIs',        href: '/cliente/kpis' },
  { id: 'sesiones',    label: 'Sesiones',    href: '/cliente/sesiones' },
]

type Props = {
  companyName: string
  active: string
  children: React.ReactNode
}

export function ClientShell({ companyName, active, children }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <aside className="w-52 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full z-10">
        <div className="px-5 py-5 border-b border-slate-800">
          <p className="text-white font-bold text-lg">Crooly</p>
          <p className="text-slate-400 text-xs mt-0.5 truncate">{companyName}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                active === item.id
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-3 pb-5 border-t border-slate-800 pt-4">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-white transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="ml-52 flex-1 min-h-screen">
        {children}
      </div>
    </div>
  )
}
