export var Chats;
(function (Chats) {
    let comments = [];
    // replies maps comment ids to an array of its replies
    let replies = {};
    let likes = {};
    let dislikes = {};
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
    function parseComment(unparsedComment, startTime) {
        const id = botCommentID--;
        const time = new Date(startTime + unparsedComment.time * 1000);
        const replies = unparsedComment.replies?.map((reply) => parseComment(reply, startTime));
        const likes = unparsedComment.likes?.map((like) => parseLike(like, startTime));
        const dislikes = unparsedComment.dislikes?.map((dislike) => parseLike(dislike, startTime));
        const comment = {
            id,
            time,
            botName: unparsedComment.botName,
            content: unparsedComment.content,
            replies,
            likes,
            dislikes
        };
        return comment;
    }
    Chats.parseComment = parseComment;
    Chats.broadcastComment = (proposedComment, sendingUser, io) => {
        const newComment = {
            id: commentID++,
            content: proposedComment.content,
            user: proposedComment.user,
            time: new Date()
        };
        comments = [...comments, newComment];
        io.to(sendingUser.accessCode).emit('comment', newComment);
        console.log(newComment);
    };
    function broadcastActionsUpdate(actionsUpdate, sendingUser, io) {
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
        if (replies[proposedReply.parentID])
            [...replies[proposedReply.parentID], newReply];
        else
            replies[proposedReply.parentID] = [newReply];
        io.to(sendingUser.accessCode).emit('reply', newReply);
        console.log(newReply);
    };
})(Chats || (Chats = {}));
//# sourceMappingURL=chat.js.map