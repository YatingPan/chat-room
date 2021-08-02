import type { User } from "./user.type"

// Type of likes for comments
export type BotLike = {
    botName: string
    time: Date
}
export type Like = {
    userID: string
    time: Date
    parentCommentID: number
}
export type RevokeLike = {
    userID: string
    parentCommentID: number
}

export type ActionsUpdate = {
    parentCommentID: number
    likes: Like[]
    dislikes: Like[]
}

export type Comment = {
    id: number
    time: Date
    user: User
    content: string
}

export type BotComment = {
    id: number
    time: Date
    botName: string
    content: string
    replies?: BotComment[]
    likes: BotLike[]
    dislikes: BotLike[]
}

export type Reply = {
    comment: Comment
    parentID: number
}

export enum ModerationType { Ban, Flag, Remove }

// export type banCommand = {
//     id: number
//     time: string
//     userId: number
// }


 export type UnparsedBotLike = {
    botName: string
    time: number
}
// Type for comments sent to the server for broadcasting
export type ProposedComment = {
    user: User
    content: string
}
export type ProposedReply = {
    comment: ProposedComment
    parentID: number
}

/**
 * Types for unparsed Data
 */

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
    likes?: UnparsedBotLike[]
    dislikes?: UnparsedBotLike[]
}