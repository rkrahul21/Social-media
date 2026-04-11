import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import AuthForm from './auth-form'

type LoginPageProps = {
  searchParams?: Promise<{
    mode?: string
    message?: string
    next?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/posts')
  }

  const initialMode = resolvedSearchParams.mode === 'signup' ? 'signup' : 'login'
  const message = resolvedSearchParams.message ?? null
  const next =
    resolvedSearchParams.next && resolvedSearchParams.next.startsWith('/')
      ? resolvedSearchParams.next
      : '/posts'

  return <AuthForm initialMode={initialMode} message={message} next={next} />
}
