import type { ActionsUpdate, BotComment, ProposedReply, Reply, UnparsedBotComment } from "../../types/comment.type";
import type { ProposedComment, Comment } from "../../types/comment.type";
import type { UserExtended } from "../../types/user.type";
import { Logs } from "./logs.js";

export module Chats {
    let commentID = 1;
    let botCommentID = -1;

    export const parseComment = (unparsedComment: UnparsedBotComment, startTime: number): BotComment => {
        const id = botCommentID--;
        const time = new Date(startTime + unparsedComment.time * 1000);
        const replies: BotComment[] = unparsedComment.replies?.map((reply: UnparsedBotComment) => parseComment(reply, startTime)) || [];

        const comment: BotComment = {
            id,
            time,
            botName: unparsedComment.botName,
            content: unparsedComment.content,
            replies,
        };
        return comment;
    };

    export const broadcastComment = (proposedComment: ProposedComment, sendingUser: UserExtended, io): void => {
        const newComment: Comment = {
            id: commentID++,
            content: proposedComment.content,
            user: proposedComment.user,
            time: new Date(),
        };
        Logs.appendTopLevelComment(sendingUser?.accessCode, newComment);
        io.to(sendingUser?.accessCode).emit('comment', newComment);
        console.log(newComment);
    };

    export function broadcastActionsUpdate(actionsUpdate: ActionsUpdate, sendingUser: UserExtended, io): void {
        Logs.replaceActions(actionsUpdate);
        io.to(sendingUser.accessCode).emit('actionsUpdate', actionsUpdate);
        console.log(actionsUpdate);
    }

    export const broadcastReply = (proposedReply: ProposedReply, sendingUser: UserExtended, io): void => {
        const newReply: Reply = {
            comment: {
                id: commentID++,
                content: proposedReply.comment.content,
                user: proposedReply.comment.user,
                time: new Date(),
            },
            parentID: proposedReply.parentID,
        };
        Logs.appendReply(newReply);

        io.to(sendingUser.accessCode).emit('reply', newReply);
        console.log(newReply);
    };
}
