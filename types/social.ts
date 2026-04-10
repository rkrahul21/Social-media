export type ProfileRecord = {
    id: string
    username: string
    first_name: string | null
    last_name: string | null
    bio: string | null
    avatar_url: string | null
    posts_count: number | null
    updated_at: string | null
}

export type FeedPost = {
    id: string
    author_id: string
    content: string
    image_url: string | null
    created_at: string
    author: {
        username: string
        first_name: string | null
        last_name: string | null
        avatar_url: string | null
    } | null
    likes?: {
        count: number
    }[],
    comments?: CommentView[]
}

export type CommentView = {
    id: string
    authorName: string
    authorAvatarUrl: string | null
    content: string
    createdAt: string
}
