// "use client"

// import Link from 'next/link'
// import { useEffect, useState } from 'react'
// import type { ReactNode } from 'react'
// import type { User } from '@supabase/supabase-js'
// import { createClient } from '@/lib/supabase/client'

// type NavItemProps = {
//   href: string
//   label: string
//   icon: ReactNode
// }

// function NavItem({ href, label, icon }: NavItemProps) {
//   return (
//     <Link
//       href={href}
//       className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
//     >
//       <span className="text-slate-600">{icon}</span>
//       <span>{label}</span>
//     </Link>
//   )
// }

// function HomeIcon() {
//   return (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
//       <path d="M3 10.5L12 3l9 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
//       <path d="M5.25 9.75V21h13.5V9.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
//     </svg>
//   )
// }

// function FollowersIcon() {
//   return (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
//       <path d="M16 8a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.8" />
//       <path d="M8 9a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.8" />
//       <path d="M2.5 20.5a5.5 5.5 0 0111 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
//       <path d="M13 20.5a4.5 4.5 0 019 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
//     </svg>
//   )
// }

// function PostsIcon() {
//   return (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
//       <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
//       <path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
//     </svg>
//   )
// }

// async function fetchAvatarUrl(path: string | undefined) {
//   if (!path) {
//     return null
//   }

//   if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
//     return path
//   }

//   const supabase = createClient()
//   const { data, error } = await supabase.storage.from('avatars').download(path)

//   if (error || !data) {
//     return null
//   }

//   return URL.createObjectURL(data)
// }

// export default function Navbar() {
//   const [supabase] = useState(() => createClient())
//   const [user, setUser] = useState<User | null>(null)
//   const [avatarSrc, setAvatarSrc] = useState<string | null>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     let active = true
//     let objectUrl: string | null = null

//     async function loadAvatar(path: string | undefined) {
//       const resolvedAvatarUrl = await fetchAvatarUrl(path)

//       if (!active) {
//         if (resolvedAvatarUrl?.startsWith('blob:')) {
//           URL.revokeObjectURL(resolvedAvatarUrl)
//         }
//         return
//       }

//       if (objectUrl) {
//         URL.revokeObjectURL(objectUrl)
//         objectUrl = null
//       }

//       if (resolvedAvatarUrl?.startsWith('blob:')) {
//         objectUrl = resolvedAvatarUrl
//       }

//       setAvatarSrc(resolvedAvatarUrl)
//     }

//     async function syncUser() {
//       setLoading(true)

//       const { data } = await supabase.auth.getUser()

//       if (!active) {
//         return
//       }

//       setUser(data.user ?? null)

//       const { data: profileData } = data.user
//         ? await supabase
//             .from('profiles')
//             .select('avatar_url')
//             .eq('id', data.user.id)
//             .maybeSingle()
//         : { data: null }

//       const avatarPath = typeof profileData?.avatar_url === 'string' ? profileData.avatar_url : undefined

//       await loadAvatar(avatarPath)

//       if (active) {
//         setLoading(false)
//       }
//     }

//     void syncUser()

//     const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
//       void (async () => {
//         setLoading(true)
//         setUser(session?.user ?? null)

//         const { data: profileData } = session?.user
//           ? await supabase
//               .from('profiles')
//               .select('avatar_url')
//               .eq('id', session.user.id)
//               .maybeSingle()
//           : { data: null }

//         const avatarPath = typeof profileData?.avatar_url === 'string' ? profileData.avatar_url : undefined

//         await loadAvatar(avatarPath)

//         if (active) {
//           setLoading(false)
//         }
//       })()
//     })

//     return () => {
//       active = false
//       authListener.subscription.unsubscribe()

//       if (objectUrl) {
//         URL.revokeObjectURL(objectUrl)
//       }
//     }
//   }, [supabase])

//   return (
//     <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
//       <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
//         <div className="flex items-center gap-2">
//           <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 font-bold text-white">V</span>
//           <span className="text-base font-semibold text-slate-900">VegaStack Social</span>
//         </div>

//         <div className="flex items-center gap-1 sm:gap-2">
//           <NavItem href="/" label="Home" icon={<HomeIcon />} />
//           <NavItem href="/people" label="Followers" icon={<FollowersIcon />} />
//           <NavItem href="/posts" label="Create Post" icon={<PostsIcon />} />
//         </div>

//         {loading ? (
//           <div className="h-10 w-10 rounded-full border-2 border-slate-200 bg-slate-100" aria-hidden="true" />
//         ) : user ? (
//           <Link
//             href="/account"
//             className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-sky-100 ring-2 ring-transparent transition hover:border-sky-300 hover:ring-sky-200"
//             aria-label="Go to account"
//             title="Account"
//           >
//             {avatarSrc ? (
//               // eslint-disable-next-line @next/next/no-img-element
//               <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" />
//             ) : (
//               <span className="text-sm font-semibold text-slate-700">
//                 {(user.email?.[0] ?? 'U').toUpperCase()}
//               </span>
//             )}
//           </Link>
//         ) : (
//           <Link
//             href="/login?mode=signup"
//             className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
//           >
//             Login / Register
//           </Link>
//         )}
//       </nav>
//     </header>
//   )
// }




"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type NavItemProps = {
  href: string
  label: string
  icon: ReactNode
  onClick?: () => void
}

function NavItem({ href, label, icon, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
    >
      <span className="text-slate-600">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}

/* Icons (UNCHANGED) */
function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5L12 3l9 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.25 9.75V21h13.5V9.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FollowersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M16 8a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 9a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2.5 20.5a5.5 5.5 0 0111 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 20.5a4.5 4.5 0 019 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PostsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/* Avatar logic (UNCHANGED) */
async function fetchAvatarUrl(path: string | undefined) {
  if (!path) return null

  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path
  }

  const supabase = createClient()
  const { data, error } = await supabase.storage.from('avatars').download(path)

  if (error || !data) return null

  return URL.createObjectURL(data)
}

export default function Navbar() {
  const [supabase] = useState(() => createClient())
  const [user, setUser] = useState<User | null>(null)
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let active = true
    let objectUrl: string | null = null

    async function loadAvatar(path: string | undefined) {
      const resolvedAvatarUrl = await fetchAvatarUrl(path)

      if (!active) {
        if (resolvedAvatarUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(resolvedAvatarUrl)
        }
        return
      }

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
        objectUrl = null
      }

      if (resolvedAvatarUrl?.startsWith('blob:')) {
        objectUrl = resolvedAvatarUrl
      }

      setAvatarSrc(resolvedAvatarUrl)
    }

    async function syncUser() {
      setLoading(true)

      const { data } = await supabase.auth.getUser()

      if (!active) return

      setUser(data.user ?? null)

      const { data: profileData } = data.user
        ? await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', data.user.id)
            .maybeSingle()
        : { data: null }

      const avatarPath =
        typeof profileData?.avatar_url === 'string'
          ? profileData.avatar_url
          : undefined

      await loadAvatar(avatarPath)

      if (active) setLoading(false)
    }

    void syncUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        setLoading(true)
        setUser(session?.user ?? null)

        const { data: profileData } = session?.user
          ? await supabase
              .from('profiles')
              .select('avatar_url')
              .eq('id', session.user.id)
              .maybeSingle()
          : { data: null }

        const avatarPath =
          typeof profileData?.avatar_url === 'string'
            ? profileData.avatar_url
            : undefined

        await loadAvatar(avatarPath)

        if (active) setLoading(false)
      })()
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [supabase])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 font-bold text-white">V</span>
          <span className="text-base font-semibold text-slate-900">VegaStack Social</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1 sm:gap-2">
          <NavItem href="/" label="Home" icon={<HomeIcon />} />
          <NavItem href="/people" label="Followers" icon={<FollowersIcon />} />
          <NavItem href="/posts" label="Create Post" icon={<PostsIcon />} />
        </div>

        {/* Right side (UNCHANGED) */}
        {loading ? (
          <div className="hidden md:block h-10 w-10 rounded-full border-2 border-slate-200 bg-slate-100" />
        ) : user ? (
          <Link
            href="/account"
            className="hidden md:inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-sky-100 hover:border-sky-300"
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-slate-700">
                {(user.email?.[0] ?? 'U').toUpperCase()}
              </span>
            )}
          </Link>
        ) : (
          <Link
            href="/login?mode=signup"
            className="hidden md:inline-flex rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Login / Register
          </Link>
        )}

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden text-2xl"
          aria-label="Open menu"
        >
          ☰
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" onClick={closeMenu} />

        {/* Dropdown Panel */}
        <div
          className={`absolute top-0 left-0 right-0 bg-white/95 backdrop-blur p-4 rounded-b-2xl shadow-lg transform transition-transform duration-300 ${
            menuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          {/* Close */}
          <div className="flex justify-end">
            <button onClick={closeMenu} className="text-2xl">✕</button>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col gap-2 mt-4">
            <NavItem href="/" label="Home" icon={<HomeIcon />} onClick={closeMenu} />
            <NavItem href="/people" label="Followers" icon={<FollowersIcon />} onClick={closeMenu} />
            <NavItem href="/posts" label="Create Post" icon={<PostsIcon />} onClick={closeMenu} />

            {user ? (
              <Link
                href="/account"
                onClick={closeMenu}
                className="mt-2 rounded-lg bg-slate-200 px-4 py-2 text-center text-sm font-semibold"
              >
                Account
              </Link>
            ) : (
              <Link
                href="/login?mode=signup"
                onClick={closeMenu}
                className="mt-2 rounded-lg bg-sky-600 px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}