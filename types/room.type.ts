import type { BotComment, Comment, Like, UnparsedBotComment, UparsedBot } from "./comment.type"

export type Post = {
    id: string
    time: Date
    title: string
    lead: string
    content: string
    imageName: string,
    likes: Like[],
    dislikes: Like[]
}

export type RoomData = {
    id: string
    name: string,
    startTime: Date,
    duration: number,
    post: Post,
    automaticComments: BotComment[],
}

/**
 * Types for unparsed Data
 */

// Type of post specification JSON file
export type UnparsedPost = {
    id: string
    time: string
    title: string
    lead: string
    content: string
    imageName: string,
    likes: number,
    dislikes: number
}

// Type of input room specification JSON file.
export type UnparsedRoomData = {
    roomName: string
    startTime: string
    duration: number
    postName: string
    bots: UparsedBot[]
    comments: UnparsedBotComment[]
}