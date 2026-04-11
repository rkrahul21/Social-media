
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { AVATAR_BUCKET, getAvatarExtension, validateAvatarFile } from '@/lib/avatar'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const avatarFile = formData.get('avatar')
  const avatar =
    avatarFile instanceof File && avatarFile.size > 0 ? avatarFile : null

  if (!avatar) {
    return NextResponse.json({ error: 'Please choose an avatar image.' }, { status: 400 })
  }

  const validationError = validateAvatarFile(avatar)

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const adminSupabase = createAdminClient()
  const avatarPath = `${user.id}/avatar.${getAvatarExtension(avatar)}`
  const { error: uploadError } = await adminSupabase.storage
    .from(AVATAR_BUCKET)
    .upload(avatarPath, avatar, {
      cacheControl: '3600',
      upsert: true,
      contentType: avatar.type,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 })
  }

  const {
    data: { publicUrl: avatarUrl },
  } = adminSupabase.storage.from(AVATAR_BUCKET).getPublicUrl(avatarPath)

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  revalidatePath('/', 'layout')
  revalidatePath('/account')

  return NextResponse.json({ avatarUrl })
}
