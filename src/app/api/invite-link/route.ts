import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Temporary endpoint: generates invite link without sending email (bypasses rate limit)
export async function POST(req: NextRequest) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not set' }, { status: 500 })
  }

  const { email, company_id } = await req.json()
  if (!email || !company_id) {
    return NextResponse.json({ error: 'email and company_id required' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  )

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://crooly-platform.vercel.app'

  // generateLink creates the user and returns the link WITHOUT sending an email
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'invite',
    email,
    options: { redirectTo: `${siteUrl}/auth/callback?next=/auth/setup` },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Register user in users table
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .upsert({ id: data.user.id, email, role: 'cliente', company_id })

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 })
  }

  return NextResponse.json({ link: data.properties.action_link })
}
