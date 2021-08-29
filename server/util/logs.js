import path from "path";
import fs from 'fs';
const __dirname = path.resolve();
const privateDir = path.join(__dirname, "server", "private");
const logDir = path.join(privateDir, "chatLogs");
export var Logs;
(function (Logs) {
    let logs = {};
    // replies maps comment ids to an array of its replies
    let replies = {};
    let actions = {};
    const botLikeToLike = (botDislike, parentCommentID) => {
        return {
            userID: botDislike.botName,
            time: new Date(botDislike.time)
        };
    };
    const botCommentToLoggedComment = (botComment) => {
        const loggedComment = {
            id: botComment.id,
            bot: true,
            time: botComment.time,
            userName: botComment.botName,
            content: botComment.content,
            replies: botComment?.replies?.map((autoComment) => botCommentToLoggedComment(autoComment)),
            moderation: botComment?.moderation,
            likes: botComment?.likes?.map(botLikeToLike),
            dislikes: botComment?.dislikes?.map(botLikeToLike)
        };
        return loggedComment;
    };
    function commentToLoggedCommnet(comment) {
        const loggedComment = {
            id: comment.id,
            bot: false,
            time: comment.time,
            userName: comment.user.name,
            content: comment.content,
            likes: [],
            dislikes: []
        };
        return loggedComment;
    }
    Logs.initLog = (roomID, roomData, specFileName) => {
        const autoComments = roomData.automaticComments.map(botCommentToLoggedComment);
        const newLog = {
            id: roomData.id,
            specFileName: specFileName,
            name: roomData.name,
            startTime: roomData.startTime,
            duration: roomData.duration,
            postTitle: roomData.post.title,
            users: [],
            comments: autoComments,
            userModerationEvents: roomData.userModerationEvents
        };
        logs[roomID] = newLog;
    };
    Logs.appendTopLevelComment = (roomID, comment) => {
        logs[roomID].comments.push(commentToLoggedCommnet(comment));
    };
    Logs.appendUser = (roomID, user) => {
        logs[roomID].users.push(user.user);
    };
    Logs.appendReply = (reply) => {
        if (replies[reply.parentID])
            [...replies[reply.parentID], commentToLoggedCommnet(reply.comment)];
        else
            replies[reply.parentID] = [commentToLoggedCommnet(reply.comment)];
    };
    Logs.replaceActions = (actionsUpdate) => {
        actions[actionsUpdate.parentCommentID] = {
            likes: actionsUpdate.likes,
            dislikes: actionsUpdate.dislikes
        };
    };
    const assembleLog = (roomID) => {
        let fullLog = logs[roomID];
        fullLog.comments.sort((a, b) => a.time < b.time ? -1 : 1);
        fullLog.comments.map((comment) => {
            const reps = replies[comment.id];
            comment["replies"] = reps?.sort((a, b) => a.time < b.time ? -1 : 1);
            const act = actions[comment.id];
            comment["likes"] = act?.likes;
            comment["dislikes"] = act?.dislikes;
            return comment;
        });
        return fullLog;
    };
    Logs.writeLog = (roomID) => {
        const logData = assembleLog(roomID);
        const src_spec = logData.specFileName.split(".")[0];
        const logJSON = JSON.stringify(logData, null, 2);
        // ${(new Date()).toTimeString()}
        fs.writeFile(`${logDir}/${src_spec}.log.json`, logJSON, (err) => {
            if (err)
                throw err;
        });
    };
})(Logs || (Logs = {}));
//# sourceMappingURL=logs.js.map