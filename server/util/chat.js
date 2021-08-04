export var Chats;
(function (Chats) {
    let comments = [];
    // replies maps comment ids to an array of its replies
    let replies = {};
    let likes = {};
    let dislikes = {};
    let commentID = 0;
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
    /**
     *
     * @param io a handle to the top level io object
     * @param
     */
    // export async function registerAutoComments(io, ) {
    //     const rooms = await loadChatrooms()
    //     for(let room of rooms) {
    //         const roomCode = room["code"];
    //         for(let comment of room["comments"]) {
    //             console.log("code", roomCode)
    //             // Create a new JavaScript Date object based on the timestamp
    //             const date = new Date(comment["time"]);
    //             // Hours part from the timestamp
    //             const hours = date.getHours();
    //             // Minutes part from the timestamp
    //             const minutes = date.getMinutes();
    //             // Seconds part from the timestamp
    //             const seconds = date.getSeconds();
    //             const year = date.getFullYear();
    //             const month = date.getMonth()+1;
    //             const dayOfMonth = date.getDate();
    //             const newComment = {
    //                 "id": 404,
    //                 "time": date,
    //                 "user": {
    //                     "id": room["userToID"](comment["userName"]) ,
    //                     "name": comment["userName"]
    //                 },
    //                 "content": comment["content"]
    //             }
    //             function sendComment(){
    //                 console.log("sending to ", roomCode, io.sockets.adapter.rooms)
    //                 io.to(roomCode).emit('comment', newComment)
    //                 console.log("sending comment", newComment)              
    //             }
    //             console.log(`${seconds} ${minutes} ${hours} ${dayOfMonth} ${month} *`)
    //             cron.schedule(`${seconds} ${minutes} ${hours} ${dayOfMonth} ${month} *`, sendComment);
    //         }
    //     }
    // }
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
    // const containsUserAction = (newAction: Like, actionsObj): Boolean => {
    //     console.log(actionsObj)
    //     if (actionsObj.hasOwnProperty(newAction.parentCommentID)){
    //         const actionsOnComment: Like[] = actionsObj[newAction.parentCommentID]
    //         const userActionIndex = actionsOnComment.findIndex((like: Like) => like.userID === newAction.userID)
    //         console.log("userAction", actionsOnComment[userActionIndex])
    //         if(-1 < userActionIndex) {
    //             console.log("Already liked")
    //             return true
    //         }
    //     } 
    //     return false
    // }
    // const addAction = (newLike: Like, actionsObj) => {
    //     if (actionsObj.hasOwnProperty(newLike.parentCommentID)){
    //         [... actionsObj[newLike.parentCommentID], newLike]
    //     } else{
    //         actionsObj[newLike.parentCommentID] = [newLike]
    //     }
    // }
    // const removeDislike = (parentCommentID: number, userID: string) => { 
    //     if (dislikes.hasOwnProperty(parentCommentID)){
    //         const actionsOnComment: Like[] = dislikes[parentCommentID]
    //         const userActionIndex = actionsOnComment.findIndex((like: Like) => like.userID === userID)
    //         if (userActionIndex > -1) {
    //             actionsOnComment.splice(userActionIndex, 1);
    //             dislikes = actionsOnComment
    //         }
    //     }
    // }
    // const removeLike = (parentCommentID: number, userID: string) => { 
    //     if (likes.hasOwnProperty(parentCommentID)){
    //         const actionsOnComment: Like[] = likes[parentCommentID]
    //         const userActionIndex = actionsOnComment.findIndex((like: Like) => like.userID === userID)
    //         if (userActionIndex > -1) {
    //             actionsOnComment.splice(userActionIndex, 1);
    //             likes = actionsOnComment
    //         }
    //     }
    // }
    function broadcastActionsUpdate(actionsUpdate, sendingUser, io) {
        io.to(sendingUser.accessCode).emit('actionsUpdate', actionsUpdate);
        console.log(actionsUpdate);
    }
    Chats.broadcastActionsUpdate = broadcastActionsUpdate;
    // export const broadcastLike = (proposedLike: Like, sendingUser: UserExtended, io): void => {
    //     const newLike: Like = proposedLike
    //     const likeValid: Boolean = !containsUserAction(newLike, likes)
    //     if(likeValid) {
    //         addAction(newLike, likes)
    //         removeDislike(newLike.parentCommentID, sendingUser.user.id)
    //         const actionsUpdate: ActionsUpdate = {
    //             parentCommentID: newLike.parentCommentID,
    //             likes: likes[newLike.parentCommentID],
    //             dislikes: dislikes[newLike.parentCommentID]
    //         }
    //         io.to(sendingUser.accessCode).emit('actionsUpdate', actionsUpdate)
    //         console.log("actionsUpdate", actionsUpdate)
    //         console.log("likes", likes)
    //         console.log("dislikes", dislikes)
    //     }
    // }
    // export const broadcastDislike = (proposedDislike: Like, sendingUser: UserExtended, io): void => {
    //     const newDislike: Like = proposedDislike
    //     const dislikeValid: Boolean = !containsUserAction(newDislike, dislikes)
    //     if(dislikeValid) {
    //         addAction(newDislike, dislikes)
    //         console.log("dislikes", dislikes)
    //         removeLike(newDislike.parentCommentID, sendingUser.user.id)
    //         const actionsUpdate: ActionsUpdate = {
    //             parentCommentID: newDislike.parentCommentID,
    //             likes: likes[newDislike.parentCommentID],
    //             dislikes: dislikes[newDislike.parentCommentID]
    //         }
    //         io.to(sendingUser.accessCode).emit('actionsUpdate', actionsUpdate)
    //     }
    //     console.log("newDislike", newDislike)
    //     console.log("likes", likes)
    //     console.log("dislikes", dislikes)
    // }
    // export const broadcastRevokeLike = (proposedRevokation: RevokeLike, sendingUser: UserExtended, io) => {
    //     const parentID = proposedRevokation.parentCommentID
    //     removeLike(parentID, sendingUser.user.id)
    //     const actionsUpdate: ActionsUpdate = {
    //         parentCommentID: parentID,
    //         likes: likes[parentID],
    //         dislikes: dislikes[parentID]
    //     }
    //     io.to(sendingUser.accessCode).emit('actionsUpdate', actionsUpdate)
    // }
    // export const broadcastRevokeDislike = (proposedRevokation: RevokeLike, sendingUser: UserExtended, io) => {
    //     const parentID = proposedRevokation.parentCommentID
    //     removeDislike(parentID, sendingUser.user.id)
    //     const actionsUpdate: ActionsUpdate = {
    //         parentCommentID: parentID,
    //         likes: likes[parentID],
    //         dislikes: dislikes[parentID]
    //     }
    //     io.to(sendingUser.accessCode).emit('actionsUpdate', actionsUpdate)
    // }
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