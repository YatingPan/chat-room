import type { ActionsUpdate, BotComment, BotLike, ProposedReply, Reply, UnparsedBotComment, UnparsedBotLike } from "../../types/comment.type"
import type { ProposedComment, Comment } from "../../types/comment.type"
import type { Moderation } from "../../types/room.type"
import { ModerationType } from "../../types/room.type.js"
import type { UserExtended } from "../../types/user.type"

export module Chats {

    let comments: Comment[] = []
    // replies maps comment ids to an array of its replies
    let replies = {}
    let likes = {}
    let dislikes = {}
    let commentID = 1
    let botCommentID = -1

    const parseLike = (unparsedLike: UnparsedBotLike, startTime: number): BotLike => {
        const time = new Date(startTime + unparsedLike.time * 1000)
        const botLike: BotLike = {
            botName: unparsedLike.botName,
            time
        }
        return botLike
    }
    const parseModerationType = (type: string): ModerationType => {
        switch(type) {
            case "remove":
                return ModerationType.Remove
            case "flag":
                return ModerationType.Flag
            case "ban":
                return ModerationType.Ban
        }
    }

    export const parseComment = (unparsedComment: UnparsedBotComment, startTime: number): BotComment => {
        const id = botCommentID--
        const time = new Date(startTime + unparsedComment.time * 1000)
        const replies = unparsedComment.replies?.map((reply: UnparsedBotComment) => parseComment(reply, startTime))
        const likes = unparsedComment.likes?.map((like: UnparsedBotLike) => parseLike(like, startTime))
        const dislikes = unparsedComment.dislikes?.map((dislike: UnparsedBotLike) => parseLike(dislike, startTime))
        
        const moderation: Moderation = unparsedComment.moderation ? {
            type: parseModerationType(unparsedComment.moderation.type),
            time: new Date(startTime + unparsedComment.moderation.time * 1000),
            target: id,
            text: unparsedComment.moderation.text
        } : undefined
        
        const comment: BotComment = {
            id,
            time,
            botName: unparsedComment.botName,
            content: unparsedComment.content,
            replies,
            moderation,
            likes,
            dislikes
        }
        return comment
    }

    export const broadcastComment = (proposedComment: ProposedComment, sendingUser: UserExtended, io): void => {
        const newComment: Comment = {
            id: commentID++,
            content: proposedComment.content,
            user: proposedComment.user,
            time: new Date()
        }
        comments = [... comments, newComment]

        io.to(sendingUser.accessCode).emit('comment', newComment)
        console.log(newComment)
    }

    export function broadcastActionsUpdate(actionsUpdate: ActionsUpdate, sendingUser: UserExtended, io) {
        io.to(sendingUser.accessCode).emit('actionsUpdate', actionsUpdate)
        console.log(actionsUpdate)
    }

    export const broadcastReply = (proposedReply: ProposedReply, sendingUser: UserExtended, io): void => {
        const newReply: Reply = {
            comment: {
                id: commentID++,
                content: proposedReply.comment.content,
                user: proposedReply.comment.user,
                time: new Date()
            },
            parentID: proposedReply.parentID
        }
        if (replies[proposedReply.parentID])
            [... replies[proposedReply.parentID], newReply]
        else
            replies[proposedReply.parentID] = [newReply]

        io.to(sendingUser.accessCode).emit('reply', newReply)
        console.log(newReply)
    }
}


