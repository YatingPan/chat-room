export type Like = {
    userID: string
    time: Date
}

export type LikesDislikes = {
    likes: Like[]
    dislikes: Like[]
}