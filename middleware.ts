import { NextResponse, type NextRequest } from 'next/server'

import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  if ((pathname.startsWith('/account') || pathname.startsWith('/posts')) && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('mode', 'signup')
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === '/login' && user) {
    const createPostUrl = request.nextUrl.clone()
    createPostUrl.pathname = '/posts'
    createPostUrl.searchParams.delete('mode')
    createPostUrl.searchParams.delete('message')
    createPostUrl.searchParams.delete('next')
    return NextResponse.redirect(createPostUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
