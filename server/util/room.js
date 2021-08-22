import path from "path";
import fs from 'fs';
import crypt from 'crypto';
import { Posts } from "./post.js";
import { ModerationType } from "../../types/room.type.js";
import { Chats } from "./chat.js";
import { Logs } from "./logs.js";
const __dirname = path.resolve();
const privateDir = path.join(__dirname, "server", "private");
const roomDir = path.join(privateDir, "chatPrograms");
export var Rooms;
(function (Rooms) {
    let rooms = {};
    const registerRoomDataCollection = (roomID, time) => {
        const timetarget = time.getTime();
        const timenow = new Date().getTime();
        const offsetmilliseconds = timetarget - timenow;
        if (offsetmilliseconds > 0)
            setTimeout(() => Logs.writeLog(roomID), offsetmilliseconds);
        else
            Logs.writeLog(roomID);
    };
    const loadChatrooms = async () => {
        const availableRooms = await getAvailableRooms();
        for (let availableRoom of availableRooms) {
            const [_, fileName] = availableRoom;
            const roomData = await getRoomData(fileName);
            rooms[roomData.id] = roomData;
            Logs.initLog(roomData.id, roomData, fileName);
            // calculate end Time from start time and duration given in minutes
            const endTime = new Date(roomData.startTime.getTime() + roomData.duration * 60 * 1000);
            console.log("endTime", endTime);
            registerRoomDataCollection(roomData.id, endTime);
        }
        //console.log(rooms)
    };
    // Access is granted if the access Code is equal to the sha265 hash of a file in the chatPrograms directory
    // TODO: not every time fs read
    async function getAvailableRooms() {
        const files = await fs.promises.readdir(path.resolve(roomDir, "roomSpecs"));
        return files.reduce((a, fileName) => {
            const hash = fileNameToHash(fileName);
            return [...a, [hash, fileName]];
        }, []);
    }
    Rooms.getAvailableRooms = getAvailableRooms;
    async function getAssignedChatRoom(roomID) {
        const availableRooms = await getAvailableRooms();
        const availableRoomMap = availableRooms.find(([hash, fileName]) => hash === roomID);
        if (availableRoomMap) {
            const [_, fileName] = availableRoomMap;
            return fileName;
        }
        return undefined;
    }
    Rooms.getAssignedChatRoom = getAssignedChatRoom;
    async function fileNameLookup(roomFileName) {
        const availableRooms = await getAvailableRooms();
        const availableRoomMap = availableRooms.find(([hash, fileName]) => fileName === roomFileName);
        if (availableRoomMap) {
            const [hash, _] = availableRoomMap;
            return hash;
        }
        return undefined;
    }
    const fileNameToHash = (fileName) => encodeURIComponent(crypt.createHash('sha256')
        .update(fileName)
        .digest('base64'));
    const parseUserModeration = (unparsedModeration, botId, startTime) => {
        const time = new Date(startTime + unparsedModeration.time * 1000);
        //console.log("parseUserModeration", time, unparsedModeration)
        const moderation = {
            type: ModerationType.Ban,
            time,
            target: botId,
            text: unparsedModeration.text,
        };
        return moderation;
    };
    const parseRoomData = async (roomData, fileName) => {
        // Just for debugging always start room on server start
        const startTimeTimeStamp = Date.now(); // Date.parse(roomData["startTime"])
        const startTime = new Date(startTimeTimeStamp);
        // The duration of the room experiment in minutes
        const duration = roomData.duration;
        const automaticComments = roomData.comments.map((comment) => {
            return Chats.parseComment(comment, startTimeTimeStamp);
        });
        const id = fileNameToHash(fileName);
        const name = roomData.roomName;
        const post = await Posts.getPostData(roomData.postName);
        const userModerationEvents = roomData.bots
            .filter((bot) => bot.moderation ? true : false)
            .map((bot) => {
            return parseUserModeration(bot.moderation, bot.name, startTimeTimeStamp);
        });
        //console.log("userModerationEvents", userModerationEvents)
        const parsedRoomData = {
            id,
            name,
            startTime,
            duration,
            post,
            automaticComments,
            userModerationEvents
        };
        return parsedRoomData;
    };
    const getRawRoomData = async (roomFileName) => {
        const rawdata = await fs.promises.readFile(path.resolve(roomDir, "roomSpecs", roomFileName));
        const roomData = JSON.parse(rawdata.toString());
        return roomData;
    };
    /**
     * @returns The a room Object
     * @argument The file name of a room
     */
    const getRoomData = async (roomFileName) => {
        const unparsedRoomData = await getRawRoomData(roomFileName);
        return parseRoomData(unparsedRoomData, roomFileName);
    };
    Rooms.getStaticRoomData = async (roomID) => {
        if (!rooms.hasOwnProperty(roomID)) {
            console.log("Loading Rooms for the first time");
            await loadChatrooms();
        }
        return rooms[roomID];
    };
})(Rooms || (Rooms = {}));
//# sourceMappingURL=room.js.map