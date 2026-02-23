import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY no está configurada en las variables de entorno.' },
      { status: 500 }
    )
  }

  const { email, company_id } = await req.json()
  if (!email || !company_id) {
    return NextResponse.json({ error: 'Email y company_id son requeridos.' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  )

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://crooly-platform.vercel.app'

  // Invite user — Supabase sends the invitation email automatically
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/cliente`,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Register user in users table with role = 'cliente'
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .upsert({ id: data.user.id, email, role: 'cliente', company_id })

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, email })
}
