'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function buildAccountRedirect(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params)
  const search = searchParams.toString()

  return search ? `/account?${search}` : '/account'
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const username = getString(formData, 'username')
  const firstName = getString(formData, 'first_name')
  const lastName = getString(formData, 'last_name')
  const bio = getString(formData, 'bio')
  const avatarUrl = getString(formData, 'avatar_url')

  if (!username) {
    redirect(buildAccountRedirect({ error: 'Username is required.' }))
  }

  if (username.length < 3 || username.length > 15) {
    redirect(
      buildAccountRedirect({
        error: 'Username must be between 3 and 15 characters.',
      })
    )
  }

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    username,
    first_name: firstName || null,
    last_name: lastName || null,
    bio: bio || null,
    avatar_url: avatarUrl || null,
  })

  if (error) {
    redirect(buildAccountRedirect({ error: error.message }))
  }

  revalidatePath('/', 'layout')
  revalidatePath('/account')
  redirect(buildAccountRedirect({ message: 'Profile updated successfully.' }))
}
