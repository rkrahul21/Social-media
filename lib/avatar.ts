export const AVATAR_BUCKET = 'avatars'
export const AVATAR_MAX_SIZE = 2 * 1024 * 1024
export const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png'] as const

export function validateAvatarFile(file: File | null | undefined) {
  if (!file) {
    return null
  }

  if (!AVATAR_ALLOWED_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_TYPES)[number])) {
    return 'Avatar must be a JPEG or PNG image.'
  }

  if (file.size > AVATAR_MAX_SIZE) {
    return 'Avatar must be 2MB or smaller.'
  }

  return null
}

export function getAvatarExtension(file: File) {
  return file.type === 'image/png' ? 'png' : 'jpg'
}
