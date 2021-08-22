import { ModerationType } from "../../types/room.type.js";
import { Logs } from "./logs.js";
export var Chats;
(function (Chats) {
    let commentID = 1;
    let botCommentID = -1;
    const parseLike = (unparsedLike, startTime) => {
        const time = new Date(startTime + unparsedLike.time * 1000);
        const botLike = {
            botName: unparsedLike.botName,
            time
        };
        return botLike;
    };
    const parseModerationType = (type) => {
        switch (type) {
            case "remove":
                return ModerationType.Remove;
            case "flag":
                return ModerationType.Flag;
            case "ban":
                return ModerationType.Ban;
        }
    };
    Chats.parseComment = (unparsedComment, startTime) => {
        const id = botCommentID--;
        const time = new Date(startTime + unparsedComment.time * 1000);
        const replies = unparsedComment.replies?.map((reply) => Chats.parseComment(reply, startTime));
        const likes = unparsedComment.likes?.map((like) => parseLike(like, startTime));
        const dislikes = unparsedComment.dislikes?.map((dislike) => parseLike(dislike, startTime));
        const moderation = unparsedComment.moderation ? {
            type: parseModerationType(unparsedComment.moderation.type),
            time: new Date(startTime + unparsedComment.moderation.time * 1000),
            target: id,
            text: unparsedComment.moderation.text
        } : undefined;
        const comment = {
            id,
            time,
            botName: unparsedComment.botName,
            content: unparsedComment.content,
            replies,
            moderation,
            likes,
            dislikes
        };
        return comment;
    };
    Chats.broadcastComment = (proposedComment, sendingUser, io) => {
        const newComment = {
            id: commentID++,
            content: proposedComment.content,
            user: proposedComment.user,
            time: new Date()
        };
        //comments = [... comments, newComment]
        Logs.appendTopLevelComment(sendingUser.accessCode, newComment);
        io.to(sendingUser.accessCode).emit('comment', newComment);
        console.log(newComment);
    };
    function broadcastActionsUpdate(actionsUpdate, sendingUser, io) {
        Logs.replaceActions(actionsUpdate);
        io.to(sendingUser.accessCode).emit('actionsUpdate', actionsUpdate);
        console.log(actionsUpdate);
    }
    Chats.broadcastActionsUpdate = broadcastActionsUpdate;
    Chats.broadcastReply = (proposedReply, sendingUser, io) => {
        const newReply = {
            comment: {
                id: commentID++,
                content: proposedReply.comment.content,
                user: proposedReply.comment.user,
                time: new Date()
            },
            parentID: proposedReply.parentID
        };
        Logs.appendReply(newReply);
        io.to(sendingUser.accessCode).emit('reply', newReply);
        console.log(newReply);
    };
})(Chats || (Chats = {}));
//# sourceMappingURL=chat.js.map