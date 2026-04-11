import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getFeedPosts } from '@/lib/feed'
import type { ProfileRecord } from '@/types/social'
import PostCard from '@/app/componenets/post-card'

import AccountForm from './account-form'

const EMPTY_PROFILE: ProfileRecord = {
  id: '',
  username: '',
  first_name: null,
  last_name: null,
  bio: null,
  avatar_url: null,
  posts_count: null,
  updated_at: null,
}

type AccountPageProps = {
  searchParams?: Promise<{
    message?: string
    error?: string
  }>
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [profileResult, posts] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username, first_name, last_name, bio, avatar_url, posts_count, updated_at')
      .eq('id', user.id)
      .maybeSingle<ProfileRecord>(),
    getFeedPosts({ authorId: user.id }),
  ])
  const profile = profileResult.data

  return (
    <section className="space-y-6 py-2">
      <AccountForm
        email={user.email ?? ''}
        profile={{ ...EMPTY_PROFILE, ...(profile ?? {}), id: user.id }}
        error={resolvedSearchParams.error ?? null}
        message={resolvedSearchParams.message ?? null}
      />

      <section className="mx-auto w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-600">
              Dashboard
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Your posts</h2>
            <p className="mt-2 text-sm text-slate-600">
              Review everything you have shared from your account.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total</p>
            <p className="text-2xl font-semibold text-slate-900">{posts.length}</p>
          </div>
        </div>

        {posts.length ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} className="min-h-[28rem]" />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            You have not created any posts yet.
          </div>
        )}
      </section>
    </section>
  )
}
