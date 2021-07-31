import type { User } from "./user.type"

// Type of likes for comments and posts
export type BotLike = {
    botName: string
    time: Date
}
export type Like = {
    userID: string
    time: Date
}

export type Comment = {
    id: number
    time: Date
    user: User
    content: string
    likes: Like[]
    dislikes: Like[]
}
export type BotComment = {
    time: Date
    botName: string
    content: string
    replies?: BotComment[]
    likes: BotLike[]
    dislikes: BotLike[]
}

export enum ModerationType { Ban, Flag, Remove }

// export type banCommand = {
//     id: number
//     time: string
//     userId: number
// }


/**
 * Types for unparsed Data
 */


// Type for comments sent to the server for broadcasting
export type ProposedComment = {
    user: User
    content: string
}

// Type of Bot specification JSON
export type UparsedBot = {
    name: string
    moderation: UnparsedModeration
}

// Type of moderation specification for users and comments
export type UnparsedModeration = {
    type: string,
    time: number
}

// Type of comment specification JSON
export type UnparsedBotComment = {
    botName: string
    time: number
    content: string
    moderation: UnparsedModeration
    replies?: UnparsedBotComment[]
    likes?: BotLike[]
    dislikes?: BotLike[]
}