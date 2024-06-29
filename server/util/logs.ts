import path from "path";
import fs from 'fs';
import type { Log, RoomData } from "../../types/room.type";
import type { BotComment, LoggedComment, Comment, Reply, ActionsUpdate } from "../../types/comment.type";
import type { UserExtended, User } from "../../types/user.type";
import moment from "moment";
import { io } from "../server";

const __dirname = path.resolve();
const privateDir = path.join(__dirname, "server", "private");
const logDir = path.join(privateDir, "chatLogs");

export module Logs {

    let logs = {};
    let replies = {};
    let rawReplies: Reply[] = [];
    let actions = {};
    let rawActions: ActionsUpdate[] = [];

    const botCommentToLoggedComment = (botComment: BotComment): LoggedComment => {
        const loggedComment: LoggedComment = {
            id: botComment.id,
            bot: true,
            time: botComment.time,
            userName: botComment.botName,
            content: botComment.content,
            replies: botComment?.replies?.map((autoComment: BotComment) => botCommentToLoggedComment(autoComment)),
        }
        return loggedComment;
    }

    const commentToLoggedComment = (comment: Comment): LoggedComment => {
        const loggedComment: LoggedComment = {
            id: comment.id,
            bot: false,
            time: comment.time,
            userName: comment.user.name,
            content: comment.content,
        }
        return loggedComment;
    }

    export function returnLog() {
        return logs;
    }

    export function returnRawReplies() {
        return rawReplies;
    }

    export function returnAction() {
        return rawActions;
    }

    export const initLog = (roomID: string, roomData: RoomData, specFileName: string) => {
        const autoComments: LoggedComment[] = roomData.automaticComments.map(botCommentToLoggedComment);
        const newLog: Log = {
            id: roomData.id,
            specFileName: specFileName,
            name: roomData.name,
            startTime: roomData.startTime,
            duration: 15, // 15 minutes
            postTitle: roomData.post.title,
            users: [],
            comments: autoComments,
        }
        logs[roomID] = newLog;
    }

    export const appendTopLevelComment = (roomID: string, comment: Comment) => {
        logs[roomID].comments.push(commentToLoggedComment(comment));
    }

    export const appendUser = (roomID: string, user: UserExtended) => {
        logs[roomID].users.push(user.user);
    }

    export const appendReply = (reply: Reply) => {
        rawReplies.push(reply);
        if (replies[reply.parentID])
            replies[reply.parentID].push(commentToLoggedComment(reply.comment));
        else
            replies[reply.parentID] = [commentToLoggedComment(reply.comment)];
    }

    export const replaceActions = (actionsUpdate: ActionsUpdate) => {
        rawActions.push(actionsUpdate);
        actions[actionsUpdate.parentCommentID] = {
            // likes: actionsUpdate.likes,
            // dislikes: actionsUpdate.dislikes
        }
    }

    const assembleLog = (roomID: string, startTime: number, endTime: number): Log => {
        let fullLog: Log = logs[roomID];
        let filteredLog: Log = {
            ...fullLog,
            comments: [],
        }

        fullLog.comments.sort((a: LoggedComment, b: LoggedComment) => a.time < b.time ? -1 : 1);
        fullLog.comments.map((comment: LoggedComment) => {
            const commentTime = moment(comment.time).diff(moment(fullLog.startTime), 'minutes');
            if (commentTime >= startTime && commentTime < endTime) {
                const reps: LoggedComment[] = replies[comment.id];
                comment["replies"] = reps?.sort((a: LoggedComment, b: LoggedComment) => a.time < b.time ? -1 : 1);
                const act = actions[comment.id];
                // comment["likes"] = act?.likes
                // comment["dislikes"] = act?.dislikes
                filteredLog.comments.push(comment);
            }
            return comment;
        })
        return filteredLog;
    }

    export const writeLog = async (roomID: string, version: number, startTime: number, endTime: number) => {
        const logData = assembleLog(roomID, startTime, endTime);
        const src_spec = logData.specFileName.split(".")[0];
        const logJSON = JSON.stringify(logData, null, 2);

        const currentdate = new Date();
        const formatTime = moment(currentdate).format("D.MM.YYYY-HH:mm");

        await fs.promises.writeFile(`${logDir}/${src_spec}_${formatTime}_${version}.log.json`, logJSON);

        // Simulate GPT-4 response
        const gptResponse = await simulateGptResponse(logData, version);
        if (gptResponse) {
            // Append GPT-4 response to the log
            const gptComment: Comment = {
                id: Date.now(),  // Ensure unique ID
                time: new Date(),
                user: defaultBotUser(gptResponse.botName),
                content: gptResponse.content,
            };
            appendTopLevelComment(roomID, gptComment);

            // Broadcast the bot message to all users
            io.to(roomID).emit('newComment', gptComment);
        }
    }

    const scheduleLogWrites = (roomID: string) => {
        setTimeout(() => writeLog(roomID, 1, 0, 4), 4 * 60 * 1000) // From beginning to 4th minute
        setTimeout(() => writeLog(roomID, 2, 4, 8), 8 * 60 * 1000) // From 4th minute to 8th minute
        setTimeout(() => writeLog(roomID, 3, 8, 12), 12 * 60 * 1000) // From 8th minute to 12th minute
        setTimeout(() => writeLog(roomID, 4, 0, 15), 15 * 60 * 1000) // From beginning to 15th minute
    }

    export const initLogWithSchedule = (roomID: string, roomData: RoomData, specFileName: string) => {
        initLog(roomID, roomData, specFileName);
        scheduleLogWrites(roomID);
    }

    const simulateGptResponse = async (logData: Log, version: number) => {
        const roomName = logData.name;
        let botName = '';

        // Determine bot name based on the room name and version
        const roomNumber = parseInt(roomName.replace('prompt_test_chat_', ''));
        if ((roomNumber - 1) % 3 === 0) {
            botName = 'bot';
        } else if ((roomNumber - 2) % 3 === 0) {
            botName = 'moderator bot';
        } else {
            return null; // For rooms where no GPT response is needed
        }

        // Simulate a GPT response
        const missingArgument = `This is a simulated response from ${botName} for version ${version}.`;
        return {
            botName,
            content: missingArgument,
        };
    }

    const defaultBotUser = (botName: string): User => ({
        id: botName,
        name: botName,
        prolificPid: 'botProlificPid',
        sessionId: 'botSessionId',
        studyId: 'botStudyId',
    });
}
