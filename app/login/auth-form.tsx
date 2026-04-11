'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import AvatarUploadField from '@/app/componenets/avatar-upload-field'

type AuthFormProps = {
  initialMode: 'login' | 'signup'
  message: string | null
  next: string
}

type AuthResponse = {
  error?: string
  redirectTo?: string
}

function SubmitButton({
  label,
  pending,
}: {
  label: string
  pending: boolean
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      {pending ? 'Please wait...' : label}
    </button>
  )
}

export default function AuthForm({
  initialMode,
  message,
  next,
}: AuthFormProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const keysToRemove: string[] = []

    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i)
      if (key?.includes('sb-')) {
        keysToRemove.push(key)
      }
    }

    for (const key of keysToRemove) {
      window.localStorage.removeItem(key)
    }
  }, [])

  async function submitAuth(formData: FormData, endpoint: string) {
    setError(null)

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    })

    const result = (await response.json().catch(() => ({}))) as AuthResponse

    if (!response.ok) {
      setError(result.error ?? 'Something went wrong. Please try again.')
      return
    }

    startTransition(() => {
      router.push(result.redirectTo ?? '/posts')
      router.refresh()
    })
  }

  const isLogin = mode === 'login'

  return (
    <section className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-600">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          {isLogin ? 'Welcome back' : 'Create your profile'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {isLogin
            ? 'Sign in to keep posting, editing your profile, and following the feed.'
            : 'Register once, sync your profile immediately, and jump into your account.'}
        </p>
      </div>

      <div className="mb-6 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => {
            setMode('login')
            setError(null)
          }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            isLogin
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup')
            setError(null)
          }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            !isLogin
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Register
        </button>
      </div>

      {message ? (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      {isLogin ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (isPending) {
              return
            }

            const formData = new FormData(event.currentTarget)
            void submitAuth(formData, '/api/auth/login')
          }}
        >
          <input type="hidden" name="next" value={next} />

          <div className="flex flex-col gap-2">
            <label htmlFor="login-email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="login-password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              placeholder="Enter your password"
            />
          </div>

          {error ? (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <SubmitButton label="Log in" pending={isPending} />
        </form>
      ) : (
        <form
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (isPending) {
              return
            }

            const formData = new FormData(event.currentTarget)
            void submitAuth(formData, '/api/auth/signup')
          }}
        >
          <div className="sm:col-span-2">
            <AvatarUploadField
              label="Avatar"
              helperText="Add your profile picture during signup."
              inputName="avatar"
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <label htmlFor="register-email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <label htmlFor="register-password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              placeholder="Choose a secure password"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              minLength={3}
              maxLength={15}
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              placeholder="yourhandle"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="first_name" className="text-sm font-medium text-slate-700">
              First name
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              placeholder="Jane"
            />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <label htmlFor="last_name" className="text-sm font-medium text-slate-700">
              Last name
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              placeholder="Doe"
            />

          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <label htmlFor="bio" className="text-sm font-medium text-slate-700">
              Bio
            </label>
            <input
              id="bio"
              name="bio"
              type="textarea"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              placeholder="Tell us about yourself"
            />

          </div>
            

          {error ? (
            <p className="sm:col-span-2 mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <div className="sm:col-span-2">
            <SubmitButton label="Create account" pending={isPending} />
          </div>
        </form>
      )}
    </section>
  )
}
