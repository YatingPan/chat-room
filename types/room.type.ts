import type { BotComment, Comment, UnparsedBotComment, UparsedBot } from "./comment.type"

export type Post = {
    id: string
    time: Date
    title: string
    lead: string
    content: string
    imageURL: string,
    initialLikes: number,
    initialDislikes: number
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
    initialLikes: number,
    initialDislikes: number
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