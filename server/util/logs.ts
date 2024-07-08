import path from "path";
import fs from 'fs';
import type { Log, RoomData } from "../../types/room.type";
import type { BotComment, LoggedComment, Comment, Reply, ActionsUpdate } from "../../types/comment.type";
import moment from "moment";
import type { User, UserExtended } from '../../types/user.type';

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
            duration: roomData.duration,
            postTitle: roomData.post.title,
            users: [],
            comments: autoComments,
            botType: roomData.botType,
            outboundLink: roomData.outboundLink,
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
        actions[actionsUpdate.parentCommentID] = {};
    }

    export const assembleLog = (roomID: string, startTime: number, endTime: number): Log => {
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
                filteredLog.comments.push(comment);
            }
            return comment;
        })
        return filteredLog;
    }

    export const writeLog = async (roomID: string, version: number, startTime: number, endTime: number): Promise<void> => {
        const logData = assembleLog(roomID, startTime, endTime);
        const src_spec = logData.specFileName.split(".")[0];
        const logJSON = JSON.stringify(logData, null, 2);

        const currentdate = new Date();
        const formatTime = moment(currentdate).format("D.MM.YYYY-HH:mm");

        await fs.promises.writeFile(`${logDir}/${src_spec}_${formatTime}_${version}.log.json`, logJSON);
    }

    const scheduleLogWrites = (roomID: string) => {
        setTimeout(async () => {
            await writeLog(roomID, 1, 0, 2);
        }, 2 * 60 * 1000);      

        setTimeout(async () => {
            await writeLog(roomID, 2, 2, 5);
        }, 3 * 60 * 1000);
        
        setTimeout(async () => {
            await writeLog(roomID, 3, 5, 8);
        }, 3 * 60 * 1000);

        setTimeout(async () => {
            await writeLog(roomID, 4, 0, 10);
            console.log("Final log written for room", roomID);
            delete logs[roomID];
        }
        , 10 * 60 * 1000);
    }

    export const initLogWithSchedule = (roomID: string, roomData: RoomData, specFileName: string) => {
        initLog(roomID, roomData, specFileName);
        console.log(`Initialized log for room ${roomID}, room data ${roomData} and spec file name ${specFileName}`);
        scheduleLogWrites(roomID);
    }
}
