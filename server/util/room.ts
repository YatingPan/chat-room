import path from "path";
import fs from 'fs';
import crypt from 'crypto';
import { Posts } from "./post.js";
import type { Post, RoomData, UnparsedRoomData } from "../../types/room.type.js";
import type { BotComment, Comment, UnparsedBotComment } from "../../types/comment.type.js";
import { Chats } from "./chat.js";
import { Logs } from "./logs.js";

const __dirname = path.resolve();
const privateDir = path.join(__dirname, "server", "private")
const roomDir = path.join(privateDir, "chatPrograms")

export module Rooms {
    let rooms = {};
    let roomSpecFiles: string[] = [];

    const registerEndRoom = (roomID, time: Date) => {
        const timetarget = time.getTime();
        console.log("timetarget", timetarget)
        const timenow =  new Date().getTime();
        console.log("timenow", timenow)
        const offsetmilliseconds = timetarget - timenow;
        console.log("offsetmilliseconds", offsetmilliseconds)

        const end_func = async () => {
            await Logs.writeLog(roomID, 4, 0, 15);
            //await GPT.analyzeLogs(roomID);
            console.log("Final log written and analyzed for room", roomID);
            delete rooms[roomID];
        }

        if (offsetmilliseconds > 0) {
            setTimeout(end_func, offsetmilliseconds);
        } else {
            end_func();
        }
    }

    export async function getAvailableRooms(): Promise<any[]> {
        if (!(roomSpecFiles.length > 0)) {
            roomSpecFiles = await fs.promises.readdir(path.resolve(roomDir, "roomSpecs"));
        }
        const hash_filename_map: string[][] = roomSpecFiles.map((fileName: string) => {
            const hash: string = fileNameToHash(fileName);
            const res: any[] = [hash, fileName];
            return res;
        }, []);
        console.log("hash_filename_map", hash_filename_map);
        return hash_filename_map;
    }

    export async function getAssignedChatRoom(roomID: string): Promise<string | undefined> {
        const availableRooms = await getAvailableRooms()
        const availableRoomMap = availableRooms.find(([hash, fileName]) => hash === roomID)
        if(availableRoomMap){
            const [_, fileName] = availableRoomMap
            return fileName
        }
        return undefined
    }

    async function fileNameLookup(roomFileName: string): Promise<string | undefined> {
        const availableRooms = await getAvailableRooms();
        const availableRoomMap = availableRooms.find(([hash, fileName]) => fileName === roomFileName);
        if (availableRoomMap) {
            const [hash, _] = availableRoomMap;
            return hash;
        }
        return undefined; 
    }

    const fileNameToHash = (fileName: string) => 
        encodeURIComponent(crypt.createHash('sha256')
            .update(fileName)
            .digest('base64'));

    const parseRoomData = async (roomData: UnparsedRoomData, fileName: string, startTimeStamp: number): Promise<RoomData> => {
        const duration = roomData.duration;
        const automaticComments: BotComment[] = 
            roomData.comments.map((comment: UnparsedBotComment): BotComment => {
                return Chats.parseComment(comment, startTimeStamp);
            });
        const id: string = fileNameToHash(fileName);
        const name: string = roomData.roomName;
        const post: Post = await Posts.getPostData(roomData.postName);
        const botType: string = roomData.botType;

        const parsedRoomData: RoomData = {
            id,
            name,
            startTime: new Date(startTimeStamp),
            duration,
            post,
            automaticComments,
            botType
        };
        return parsedRoomData;
    }

    const getRawRoomData = async (roomFileName: string): Promise<UnparsedRoomData> => {
        const rawdata = await fs.promises.readFile(path.resolve(roomDir, "roomSpecs", roomFileName));
        const roomData = JSON.parse(rawdata.toString());
        return roomData;
    }

    const getRoomData = async (roomFileName: string, startTime: number): Promise<RoomData> => {
        const unparsedRoomData: UnparsedRoomData = await getRawRoomData(roomFileName);
        return parseRoomData(unparsedRoomData, roomFileName, startTime);
    }

    export const getStaticRoomData = async (roomID: string): Promise<RoomData> => {
        if(!rooms.hasOwnProperty(roomID)) {

            const fileName = await getAssignedChatRoom(roomID)
            console.log(`Loading Room(roomID: ${roomID}, fileName: ${fileName}) for the first time!`)

            // set the start time of the room to the current time
            const startTimeTimeStamp = Date.now()// Date.parse(roomData["startTime"])

            const roomData: RoomData = await getRoomData(fileName, startTimeTimeStamp)
            rooms[roomData.id] = roomData

            Logs.initLog(roomData.id, roomData, fileName)

            // calculate end Time from start time and duration given in minutes
            const endTime = new Date(startTimeTimeStamp + roomData.duration * 60 * 1000)
            
            console.log("endTime", endTime)
            registerEndRoom(roomData.id, endTime)            
            //console.log(rooms)
        }
        
        return rooms[roomID]
    }

    export const updateRoomData = async (roomID: string, updatedRoomData: RoomData): Promise<void> => {
        const roomFileName = await getAssignedChatRoom(roomID);
        //path: server/private/chatPrograms/roomSpecs/prompt_test_1.json
        const roomFilePath = roomFileName ? path.resolve(roomDir, "roomSpecs", roomFileName) : '';
        const roomDataJSON = JSON.stringify(updatedRoomData, null, 2);
        await fs.promises.writeFile(roomFilePath, roomDataJSON);
        rooms[roomID] = updatedRoomData;
    }
}
