import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const formData = await request.formData()
  const email = getString(formData, 'email')
  const password = getString(formData, 'password')
  const next = getString(formData, 'next') || '/posts'

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required.' },
      { status: 400 }
    )
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  revalidatePath('/', 'layout')

  return NextResponse.json({
    redirectTo: next.startsWith('/') ? next : '/posts',
  })
}
