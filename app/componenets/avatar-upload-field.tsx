'use client'

import { useEffect, useId, useState } from 'react'

import { AVATAR_MAX_SIZE, validateAvatarFile } from '@/lib/avatar'

type AvatarUploadFieldProps = {
  label: string
  helperText: string
  initialPreviewUrl?: string | null
  inputName?: string
  uploadEndpoint?: string
  disabled?: boolean
  onUploaded?: (avatarUrl: string) => void
}

type UploadResponse = {
  avatarUrl?: string
  error?: string
}

export default function AvatarUploadField({
  label,
  helperText,
  initialPreviewUrl = null,
  inputName,
  uploadEndpoint,
  disabled = false,
  onUploaded,
}: AvatarUploadFieldProps) {
  const inputId = useId()
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    setPreviewUrl(initialPreviewUrl)
  }, [initialPreviewUrl])

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    const validationError = validateAvatarFile(file)

    setError(validationError)

    if (!file || validationError) {
      event.target.value = ''
      return
    }

    const previousPreviewUrl = previewUrl
    const localPreviewUrl = URL.createObjectURL(file)
    setPreviewUrl((currentUrl) => {
      if (currentUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl)
      }

      return localPreviewUrl
    })

    if (!uploadEndpoint) {
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.set('avatar', file)

      const response = await fetch(uploadEndpoint, {
        method: 'PUT',
        body: formData,
      })

      const result = (await response.json().catch(() => ({}))) as UploadResponse

      if (!response.ok || !result.avatarUrl) {
        throw new Error(result.error ?? 'Avatar upload failed.')
      }

      setPreviewUrl((currentUrl) => {
        if (currentUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(currentUrl)
        }

        return result.avatarUrl ?? null
      })

      onUploaded?.(result.avatarUrl)
      event.target.value = ''
    } catch (uploadError) {
      setPreviewUrl(previousPreviewUrl)
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'Avatar upload failed.'
      )
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Avatar preview" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Avatar
            </span>
          )}
        </div>

        <div className="flex-1">
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
          <p className="mt-1 text-xs text-slate-500">
            {helperText} JPEG or PNG only, up to {Math.floor(AVATAR_MAX_SIZE / (1024 * 1024))}MB.
          </p>

          <input
            id={inputId}
            name={inputName}
            type="file"
            accept="image/jpeg,image/png"
            onChange={(event) => {
              void handleChange(event)
            }}
            disabled={disabled || uploading}
            className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-sky-700 disabled:cursor-not-allowed"
          />

          {uploadEndpoint ? (
            <p className="mt-2 text-xs text-slate-500">
              {uploading ? 'Uploading avatar...' : 'Uploading here updates your profile picture immediately.'}
            </p>
          ) : null}

          {error ? (
            <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
