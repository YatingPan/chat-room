import path from "path";
import fs from 'fs';
import type { Log, RoomData } from "../../types/room.type";
import type { BotComment, LoggedComment, Comment, Reply, ActionsUpdate } from "../../types/comment.type";
import type { UserExtended } from "../../types/user.type";
import moment from "moment";

const __dirname = path.resolve();
const privateDir = path.join(__dirname, "server", "private")
const logDir = path.join(privateDir, "chatLogs")
export module Logs {

    let logs = {}
    // replies maps comment ids to an array of its replies
    let replies = {}
    let rawReplies: Reply[] = []
    let actions = {}
    let rawActions: ActionsUpdate[] = []

    const botCommentToLoggedComment = (botComment: BotComment) => {
        const loggedComment: LoggedComment = {
            id: botComment.id,
            bot: true,
            time: botComment.time,
            userName: botComment.botName,
            content: botComment.content,
            replies: botComment?.replies?.map((autoComment: BotComment) => botCommentToLoggedComment(autoComment)),
        }
        return loggedComment
    }

    function commentToLoggedCommnet(comment: Comment): LoggedComment {
        const loggedComment: LoggedComment = {
            id: comment.id,
            bot: false,
            time: comment.time,
            userName: comment.user.name,
            content: comment.content,
        }
        return loggedComment
    }

    export function returnLog() {
        return logs
    }

    export function returnRawReplies() {
        return rawReplies
    }

    export function returnAction() {
        return rawActions
    }

    export const initLog = (roomID: string, roomData: RoomData, specFileName: string) => {
        const autoComments: LoggedComment[] = roomData.automaticComments.map(botCommentToLoggedComment)
        const newLog: Log = {
            id: roomData.id,
            specFileName: specFileName,
            name: roomData.name,
            startTime: roomData.startTime,
            duration: 15, // changed to 15 minutes
            postTitle: roomData.post.title,
            users: [],
            comments: autoComments,
        }
        logs[roomID] = newLog
    }

    export const appendTopLevelComment = (roomID: string, comment: Comment) => {
        logs[roomID].comments.push(commentToLoggedCommnet(comment))
    }

    export const appendUser = (roomID: string, user: UserExtended) => {
        logs[roomID].users.push(user.user)
    }

    export const appendReply = (reply: Reply) => {
        rawReplies.push(reply)
        if (replies[reply.parentID])
            replies[reply.parentID].push(commentToLoggedCommnet(reply.comment))
        else
            replies[reply.parentID] = [commentToLoggedCommnet(reply.comment)]
    }

    export const replaceActions = (actionsUpdate: ActionsUpdate) => {
        rawActions.push(actionsUpdate)
        actions[actionsUpdate.parentCommentID] = {
            // likes: actionsUpdate.likes,
            // dislikes: actionsUpdate.dislikes
        }
    }

    const assembleLog = (roomID: string): Log => {
        let fullLog: Log = logs[roomID]

        fullLog.comments.sort((a: LoggedComment, b: LoggedComment) => a.time < b.time ? -1 : 1)
        fullLog.comments.map((comment: LoggedComment) => {
            const reps: LoggedComment[] = replies[comment.id]
            comment["replies"] = reps?.sort((a: LoggedComment, b: LoggedComment) => a.time < b.time ? -1 : 1)
            const act = actions[comment.id]
            // comment["likes"] = act?.likes
            // comment["dislikes"] = act?.dislikes

            return comment
        })
        return fullLog
    }

    export const writeLog = async (roomID: string, version: number) => {
        const logData = assembleLog(roomID)
        const src_spec = logData.specFileName.split(".")[0]
        const logJSON = JSON.stringify(logData, null, 2)

        const currentdate = new Date();
        const formatTime = moment(currentdate).format("D.MM.YYYY-HH:mm")

        await fs.promises.writeFile(`${logDir}/${src_spec}_${formatTime}_${version}.log.json`, logJSON);
    }

    const scheduleLogWrites = (roomID: string) => {
        setTimeout(() => writeLog(roomID, 1), 4 * 60 * 1000) // 4th minute
        setTimeout(() => writeLog(roomID, 2), 8 * 60 * 1000) // 8th minute
        setTimeout(() => writeLog(roomID, 3), 12 * 60 * 1000) // 12th minute
        setTimeout(() => writeLog(roomID, 4), 15 * 60 * 1000) // 15th minute (end)
    }

    export const initLogWithSchedule = (roomID: string, roomData: RoomData, specFileName: string) => {
        initLog(roomID, roomData, specFileName)
        scheduleLogWrites(roomID)
    }
}
