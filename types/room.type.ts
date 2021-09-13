import type { BotComment, Comment, Like, LoggedComment, UnparsedBotComment } from "./comment.type"
import type { User, UserExtended } from "./user.type"

export type Post = {
    id: string
    time: Date
    title: string
    lead: string
    content: string
    imageName: string
    likes: Like[]
    dislikes: Like[]
}

export type Log = {
    id: string
    specFileName: string
    name: string
    startTime: Date
    duration: number
    postTitle: string
    comments: LoggedComment[]
    userModerationEvents: Moderation[]
    users: User[]
    outgoingLink: string
}

export enum ModerationType { Ban, Flag, Remove }

export type RoomData = {
    id: string
    name: string
    startTime: Date
    duration: number
    post: Post
    automaticComments: BotComment[]
    userModerationEvents: Moderation[]
    outgoingLink: string
}


export type Moderation = {
    type: ModerationType
    time: Date
    target: string | number // either user id or comment id
    text: string
    textColor?: string
    textSize?: string
    bgColor?: string
    signature?: string
}

export type Notification = {
    text: string
    textColor: string
    bgColor: string
    signature: string
    textSize: string
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
    bots: UnparsedBot[]
    comments: UnparsedBotComment[]
    outgoingLink: string
}

// Type of Bot specification JSON
export type UnparsedBot = {
    name: string
    moderation?: UnparsedModeration
}

// Type of moderation specification for users and comments
export type UnparsedModeration = {
    type: string
    time: number
    text: string
    textColor?: string
    textSize?: string
    bgColor?: string
    signature?: string
}