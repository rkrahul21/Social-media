import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { AVATAR_BUCKET, getAvatarExtension, validateAvatarFile } from '@/lib/avatar'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const formData = await request.formData()
  const email = getString(formData, 'email')
  const password = getString(formData, 'password')
  const username = getString(formData, 'username')
  const firstName = getString(formData, 'first_name')
  const lastName = getString(formData, 'last_name')
  const bio = getString(formData, 'bio')
  const avatarFile = formData.get('avatar')
  const avatar =
    avatarFile instanceof File && avatarFile.size > 0 ? avatarFile : null

  if (!email || !password || !username) {
    return NextResponse.json(
      { error: 'Email, password, and username are required.' },
      { status: 400 }
    )
  }

  if (username.length < 3 || username.length > 15) {
    return NextResponse.json(
      { error: 'Username must be between 3 and 15 characters.' },
      { status: 400 }
    )
  }

  const avatarValidationError = validateAvatarFile(avatar)

  if (avatarValidationError) {
    return NextResponse.json({ error: avatarValidationError }, { status: 400 })
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        first_name: firstName || null,
        last_name: lastName || null,
      },
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const userId = data.user?.id

  if (!userId) {
    return NextResponse.json(
      { error: 'Signup succeeded, but no user id was returned.' },
      { status: 500 }
    )
  }

  const adminSupabase = createAdminClient()

  const { error: profileInsertError } = await adminSupabase.from('profiles').insert({
    id: userId,
    username,
    first_name: firstName || null,
    last_name: lastName || null,
    bio: bio || null,
  })

  if (profileInsertError) {
    const isExistingProfile =
      profileInsertError.code === '23505' || profileInsertError.code === '409'

    if (!isExistingProfile) {
      return NextResponse.json(
        { error: profileInsertError.message },
        { status: 400 }
      )
    }

    const { error: profileSyncError } = await adminSupabase
      .from('profiles')
      .update({
        username,
        first_name: firstName || null,
        last_name: lastName || null,
        bio: bio || null,
      })
      .eq('id', userId)

    if (profileSyncError) {
      return NextResponse.json(
        { error: profileSyncError.message },
        { status: 400 }
      )
    }
  }

  if (avatar) {
    const avatarPath = `${userId}/avatar.${getAvatarExtension(avatar)}`
    const { error: avatarUploadError } = await adminSupabase.storage
      .from(AVATAR_BUCKET)
      .upload(avatarPath, avatar, {
        cacheControl: '3600',
        upsert: true,
        contentType: avatar.type,
      })

    if (avatarUploadError) {
      return NextResponse.json({ error: avatarUploadError.message }, { status: 400 })
    }

    const {
      data: { publicUrl: avatarUrl },
    } = adminSupabase.storage.from(AVATAR_BUCKET).getPublicUrl(avatarPath)

    const { error: avatarProfileError } = await adminSupabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId)

    if (avatarProfileError) {
      return NextResponse.json({ error: avatarProfileError.message }, { status: 400 })
    }
  }

  revalidatePath('/', 'layout')

  return NextResponse.json({
    redirectTo: data.session
      ? '/posts'
      : '/login?mode=signup&message=Check+your+email+to+confirm+your+account%2C+then+sign+in.',
  })
}
