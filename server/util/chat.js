export var Chats;
(function (Chats) {
    let comments = [];
    let commentID = 0;
    const parseLike = (unparsedLike) => unparsedLike;
    function parseComment(unparsedComment, startTime) {
        const time = new Date(startTime + unparsedComment.time * 1000);
        const replies = unparsedComment.replies?.map((reply) => parseComment(reply, startTime));
        const likes = unparsedComment.likes?.map((like) => parseLike(like));
        const dislikes = unparsedComment.dislikes?.map((dislike) => parseLike(dislike));
        const comment = {
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
            time: new Date(),
            likes: [],
            dislikes: []
        };
        comments = [...comments, newComment];
        io.to(sendingUser.accessCode).emit('comment', newComment);
        console.log(newComment);
    };
})(Chats || (Chats = {}));
//# sourceMappingURL=chat.js.map