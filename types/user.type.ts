import type { Post } from "./post.type"


export type User = {
    id: string
    name: string
}
export type UserExtended = {
    user: User
    accessCode: string
}
export type RoomData = {
    id: string
    name: string,
    startTime: Date,
    post: Post
}
export type AccessInfo = {
    accessCode: string
    user?: User
}

export type UserAssignment = {
    user?: UserExtended,
    room?: RoomData
}