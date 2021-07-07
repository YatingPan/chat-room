export type Comment = {
    id: number
    time: string
    userName: string
    content: string
}
export type NewComment = {
    userName: string
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