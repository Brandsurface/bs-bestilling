import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'
import { buildBrandsurfaceEmail } from '@/lib/emails'
import { redirect } from 'next/navigation'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return Response.json({ error: 'Manglende ordre-id' }, { status: 400 })
  }

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !order) {
    return Response.json({ error: 'Ordre ikke fundet' }, { status: 404 })
  }

  if (order.status === 'confirmed') {
    redirect(`/order/bekraeftet?id=${id}`)
  }

  if (order.status === 'cancelled') {
    return Response.json({ error: 'Ordren er annulleret' }, { status: 410 })
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'confirmed' })
    .eq('id', id)

  if (updateError) {
    console.error('Supabase UPDATE fejl:', updateError)
    return Response.json({ error: 'Kunne ikke bekræfte ordre' }, { status: 500 })
  }

  const { subject, html } = buildBrandsurfaceEmail({ order })

  await resend.emails.send({
    from:    'Brandsurface Ordre <ordre@brandsurface.dk>',
    to:      process.env.BRANDSURFACE_EMAIL,
    replyTo: order.email,
    subject,
    html,
  })

  redirect(`/order/bekraeftet?id=${id}`)
}
