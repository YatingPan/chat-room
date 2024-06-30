import type { User } from "./user.type"

// Type of likes for comments
//export type BotLike = {
//    botName: string
//    time: Date
//}
//export type Like = {
//    userID: string
//    time: Date
//}

export type ActionsUpdate = {
    senderID: string
    parentCommentID: number
    //likes: Like[]
    //dislikes: Like[]
}

export type Comment = {
    id: number
    time: Date
    user: User
    content: string
    //moderation?: Moderation
    // flagged?: boolean
    removed?: boolean
}

export type BotComment = {
    id: number
    time: Date
    botName: string
    content: string
    replies?: BotComment[]
    //moderation: Moderation
    //likes: BotLike[]
    //dislikes: BotLike[]
}

export type LoggedComment = {
    id: number
    bot: Boolean
    time: Date
    userName: string
    content: string
    replies?: LoggedComment[]
    //moderation?: Moderation
    //likes?: Like[]
    //dislikes?: Like[]
}

export type Reply = {
    comment: Comment
    parentID: number
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

//export type UnparsedBotLike = {
//    botName: string
//    time: number
//}
// Type of comment specification JSON
export type UnparsedBotComment = {
    botName: string
    time: number
    content: string
    //moderation: UnparsedModeration
    replies?: UnparsedBotComment[]
    //likes?: UnparsedBotLike[]
    //dislikes?: UnparsedBotLike[]
}
