import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const openaiKey = process.env.OPENAI_API_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!openaiKey) return NextResponse.json({ error: 'OPENAI_API_KEY no configurada' }, { status: 500 })
  if (!serviceRoleKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY no configurada' }, { status: 500 })

  const { diagnostic_id, credibilidad, capacidad_comercial, posicionamiento, operacion } = await req.json()

  if (!diagnostic_id || credibilidad == null || capacidad_comercial == null || posicionamiento == null || operacion == null) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const avg = Math.round(((credibilidad + capacidad_comercial + posicionamiento + operacion) / 4) * 10) / 10

  const openai = new OpenAI({ apiKey: openaiKey })

  const prompt = `Eres consultor del Crooly Traction Method, especializado en empresas de servicios mineros en Chile.

Basado en el diagnóstico, escribe un análisis en exactamente 3 párrafos (sin bullet points, sin títulos):
1. Situación actual: fortalezas y principales brechas de la empresa
2. Los 2 focos más críticos a trabajar en los próximos 90 días y por qué
3. Una recomendación de prioridad concreta para iniciar el proceso de mejora

Resultados (escala 1.0 a 5.0):
- Credibilidad documentada: ${credibilidad}
- Capacidad Comercial: ${capacidad_comercial}
- Posicionamiento: ${posicionamiento}
- Operación y estructura: ${operacion}
- Promedio general: ${avg}

Tono: profesional, directo, orientado a acción. Máximo 200 palabras en total.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 400,
  })

  const narrative = completion.choices[0]?.message?.content?.trim() ?? ''

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  )

  await supabaseAdmin
    .from('diagnostics')
    .update({ narrative })
    .eq('id', diagnostic_id)

  return NextResponse.json({ narrative })
}
