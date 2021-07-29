import path from "path";
import fs from 'fs';
import crypt from 'crypto';
import cron from 'node-cron';
import { Posts } from "./post.js";
const __dirname = path.resolve();
const privateDir = path.join(__dirname, "server", "private");
const roomDir = path.join(privateDir, "chatPrograms");
export var Rooms;
(function (Rooms) {
    let rooms = [];
    let bots = [];
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
    async function registerBots() {
    }
    async function registerAutomaticMessages(io) {
        const rooms = await loadChatrooms();
        for (let room of rooms) {
            const roomCode = room["code"];
            for (let comment of room["comments"]) {
                console.log("code", roomCode);
                // Create a new JavaScript Date object based on the timestamp
                const date = new Date(comment["time"]);
                // Hours part from the timestamp
                const hours = date.getHours();
                // Minutes part from the timestamp
                const minutes = date.getMinutes();
                // Seconds part from the timestamp
                const seconds = date.getSeconds();
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const dayOfMonth = date.getDate();
                const newComment = {
                    "id": 404,
                    "time": date,
                    "user": {
                        "id": room["userToID"](comment["userName"]),
                        "name": comment["userName"]
                    },
                    "content": comment["content"]
                };
                function sendComment() {
                    console.log("sending to ", roomCode, io.sockets.adapter.rooms);
                    io.to(roomCode).emit('comment', newComment);
                    console.log("sending comment", newComment);
                }
                console.log(`${seconds} ${minutes} ${hours} ${dayOfMonth} ${month} *`);
                cron.schedule(`${seconds} ${minutes} ${hours} ${dayOfMonth} ${month} *`, sendComment);
            }
        }
    }
    Rooms.registerAutomaticMessages = registerAutomaticMessages;
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
    const fileNameToHash = (fileName) => encodeURIComponent(crypt.createHash('sha256').update(fileName).digest('base64'));
    const parseRoomData = (roomData, fileName) => {
        const startTimeTimeStamp = Date.now(); //Date.parse(roomData["startTime"])
        // add two hours to timestamp
        //const startTimeSwitzerlandTime = startTimeTimeStamp + 2 * 60 * 60 * 1000
        roomData["startTime"] = startTimeTimeStamp;
        roomData["comments"] = roomData["comments"].map(comment => {
            comment["time"] = startTimeTimeStamp + comment["time"] * 1000;
            return comment;
        });
        // TODO: Implement id mapping
        roomData["userToID"] = (userName) => 404;
        roomData["code"] = fileNameToHash(fileName);
        return roomData;
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
        const rawRoomData = await getRawRoomData(roomFileName);
        const id = fileNameToHash(roomFileName);
        const name = rawRoomData["roomName"];
        const startTime = new Date(Date.parse(rawRoomData["startTime"]));
        const post = await Posts.getPostData(rawRoomData["post"]);
        return {
            id,
            name,
            startTime,
            post
        };
    };
})(Rooms || (Rooms = {}));
//# sourceMappingURL=room.js.map