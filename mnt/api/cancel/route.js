import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'

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
    return Response.json({ error: 'Ordren er allerede godkendt' }, { status: 410 })
  }

  await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', id)

  redirect(`/?edit=${id}`)
}
