import type { User } from "./user.type"

export type Comment = {
    id: number
    time: Date
    user: User
    content: string
    likes: number
    dislikes: number
}
export type NewComment = {
    user: User
    content: string
}
export type Reply = {
    parentID: number
    message: Comment
}

export type banCommand = {
    id: number
    time: string
    userId: number
}