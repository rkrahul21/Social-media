
import PostCard from './componenets/post-card'
import { getFeedPosts } from '@/lib/feed'
import type { FeedPost } from '@/types/social'

export default async function Home() {
  
  const posts: FeedPost[] = await getFeedPosts({ authorId: undefined })

  return (
    <section className="w-full space-y-6">
      <header className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-600">Home feed</p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Browse every post</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              All posts are shown here on the home page. Use the posts page only when you want to create a new post.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} in the feed
          </div>
        </div>
      </header>

   {posts.length ? (

<div className="w-full py-4">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        /* Each card takes its own natural height */
        <div key={post.id} className="h-full">
          <PostCard post={post} className="h-full" />
        </div>
      ))}
    </div>
  </div>
) : (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
    <p>No posts yet. Be the first one to post.</p>
  </div>
)}

    </section>
  )
}
