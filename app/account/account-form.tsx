'use client'

import { useState } from 'react'

import type { ProfileRecord } from '@/types/social'
import AvatarUploadField from '@/app/componenets/avatar-upload-field'

import { updateProfile } from './actions'

type AccountFormProps = {
  email: string
  profile: ProfileRecord
  message: string | null
  error: string | null
}

export default function AccountForm({
  email,
  profile,
  message,
  error,
}: AccountFormProps) {
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')

  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-600">
          Your account
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Edit your profile</h1>
        <p className="mt-2 text-sm text-slate-600">
          Keep your public profile up to date and control how you show up in the feed.
        </p>
      </div>

      {message ? (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <form action={updateProfile} className="grid grid-cols-1 gap-4">
        <input type="hidden" name="avatar_url" value={avatarUrl} />

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              defaultValue={profile.username}
              minLength={3}
              maxLength={15}
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </div>
        </div>

        <AvatarUploadField
          label="Profile picture"
          helperText="Upload a new photo for your account."
          initialPreviewUrl={avatarUrl || null}
          uploadEndpoint="/api/profile/avatar"
          onUploaded={setAvatarUrl}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="first_name" className="text-sm font-medium text-slate-700">
              First name
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              defaultValue={profile.first_name ?? ''}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="last_name" className="text-sm font-medium text-slate-700">
              Last name
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              defaultValue={profile.last_name ?? ''}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="bio" className="text-sm font-medium text-slate-700">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={profile.bio ?? ''}
            rows={4}
            maxLength={160}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="submit"
            className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Save changes
          </button>

          <button
            type="submit"
            formAction="/api/auth/signout"
            formMethod="post"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Sign out
          </button>
        </div>
      </form>
    </div>
  )
}
