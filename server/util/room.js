import path from "path";
import fs from 'fs';
import crypt from 'crypto';
import { Posts } from "./post.js";
import { Chats } from "./chat.js";
const __dirname = path.resolve();
const privateDir = path.join(__dirname, "server", "private");
const roomDir = path.join(privateDir, "chatPrograms");
export var Rooms;
(function (Rooms) {
    const loadChatrooms = async () => {
        const availableRooms = await getAvailableRooms();
        const roomDataArr = [];
        for (let availableRoom of availableRooms) {
            const [_, fileName] = availableRoom;
            const roomData = await getParsedRoomData(fileName);
            roomDataArr.push(roomData);
        }
        return roomDataArr;
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
    const parseRoomData = async (roomData, fileName) => {
        // Just for debugging always start room on server start
        const startTimeTimeStamp = Date.now(); // Date.parse(roomData["startTime"])
        const startTime = new Date(startTimeTimeStamp);
        // add two hours to timestamp
        //const startTimeSwitzerlandTime = startTimeTimeStamp + 2 * 60 * 60 * 1000
        // The duration of the room experiment in minutes
        const duration = roomData.duration;
        const automaticComments = roomData.comments.map((comment) => {
            return Chats.parseComment(comment, startTimeTimeStamp);
        });
        const id = fileNameToHash(fileName);
        const name = roomData.roomName;
        const post = await Posts.getPostData(roomData.postName);
        const parsedRoomData = {
            id,
            name,
            startTime,
            duration,
            post,
            automaticComments
        };
        return parsedRoomData;
    };
    const getRawRoomData = async (roomFileName) => {
        const rawdata = await fs.promises.readFile(path.resolve(roomDir, "roomSpecs", roomFileName));
        const roomData = JSON.parse(rawdata.toString());
        return roomData;
    };
    const getParsedRoomData = async (roomFileName) => {
        const roomData = await getRawRoomData(roomFileName);
        const parsedRoomData = parseRoomData(roomData, roomFileName);
        return parsedRoomData;
    };
    /**
     * @returns The a room Object
     * @argument The file name of a room
     */
    Rooms.getRoomData = async (roomFileName) => {
        const unparsedRoomData = await getRawRoomData(roomFileName);
        return parseRoomData(unparsedRoomData, roomFileName);
    };
})(Rooms || (Rooms = {}));
//# sourceMappingURL=room.js.map