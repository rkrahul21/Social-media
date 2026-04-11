
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // Always attempt sign-out to clear auth cookies/session state.
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  revalidatePath('/account')
  revalidatePath('/posts')

  const response = NextResponse.redirect(new URL('/login', req.url), {
    status: 302,
  })

  const authCookies = req.cookies
    .getAll()
    .filter((cookie) => cookie.name.includes('sb-'))

  for (const cookie of authCookies) {
    response.cookies.set(cookie.name, '', {
      path: '/',
      maxAge: 0,
    })
  }

  response.headers.set('Cache-Control', 'no-store')

  return response
}
