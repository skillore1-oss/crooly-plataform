import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const resendKey = process.env.RESEND_API_KEY

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY no configurada.' }, { status: 500 })
  }
  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY no configurada.' }, { status: 500 })
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

  // Generate invite link without sending Supabase's default email
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'invite',
    email,
    options: { redirectTo: `${siteUrl}/auth/callback?next=/auth/setup` },
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

  // Send branded email via Resend
  const actionLink = data.properties.action_link
  const resend = new Resend(resendKey)

  const { error: emailError } = await resend.emails.send({
    from: 'Crooly <invitaciones@crooly.cl>',
    to: email,
    subject: 'Tu acceso a Crooly está listo',
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
          <tr>
            <td style="padding:32px;text-align:center;border-bottom:1px solid #334155;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Crooly</h1>
              <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;">Traction Method Platform</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#cbd5e1;font-size:15px;line-height:1.6;">
                Hola,
              </p>
              <p style="margin:0 0 24px;color:#cbd5e1;font-size:15px;line-height:1.6;">
                Tu consultor te ha invitado a acceder a tu espacio de trabajo en Crooly. Crea tu contraseña para comenzar.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${actionLink}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;">
                      Crear contraseña y entrar
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;color:#475569;font-size:12px;line-height:1.6;">
                Si no esperabas esta invitación, puedes ignorar este correo.<br>
                El link expira en 24 horas.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })

  if (emailError) {
    return NextResponse.json({ error: `Error enviando email: ${emailError.message}` }, { status: 500 })
  }

  return NextResponse.json({ success: true, email })
}
