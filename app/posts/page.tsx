import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PostComposer from '../componenets/post-composer'

export default async function PostsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?mode=signup&next=/posts')
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Create a post</h1>
        <p className="mt-1 text-sm text-slate-600">
          This page is only for posting. After you publish, the post will appear on the home page and on your account page.
        </p>
      </header>

      <PostComposer authorId={user.id} />
    </section>
  )
}
