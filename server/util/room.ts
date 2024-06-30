import path from "path";
import fs from 'fs';
import crypt from 'crypto';
import { Posts } from "./post.js";
import type { Post, RoomData, UnparsedRoomData } from "../../types/room.type";
import type { BotComment, Comment, UnparsedBotComment } from "../../types/comment.type.js";
import { Chats } from "./chat.js";
import { Logs } from "./logs.js";
import { GPT } from "./gpt.js";

const __dirname = path.resolve();
const privateDir = path.join(__dirname, "server", "private")
const roomDir = path.join(privateDir, "chatPrograms")

export module Rooms {
    let rooms = {};
    let roomSpecFiles: string[] = [];

    const registerEndRoom = (roomID, time: Date) => {
        const timetarget = time.getTime();
        const timenow = new Date().getTime();
        const offsetmilliseconds = timetarget - timenow;

        const end_func = async () => {
            await Logs.writeLog(roomID, 4, 0, 15);
            await GPT.analyzeLogs(roomID);
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
        return hash_filename_map;
    }

    export async function getAssignedChatRoom(roomID: string): Promise<string> {
        const availableRooms = await getAvailableRooms();
        const availableRoomMap = availableRooms.find(([hash, fileName]) => hash === roomID);
        if (availableRoomMap) {
            const [_, fileName] = availableRoomMap;
            return fileName;
        }
        throw new Error(`Room with ID ${roomID} not found`);
    }

    async function fileNameLookup(roomFileName: string): Promise<string> {
        const availableRooms = await getAvailableRooms();
        const availableRoomMap = availableRooms.find(([hash, fileName]) => fileName === roomFileName);
        if (availableRoomMap) {
            const [hash, _] = availableRoomMap;
            return hash;
        }
        throw new Error(`Room with filename ${roomFileName} not found`);
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

        const parsedRoomData: RoomData = {
            id,
            name,
            startTime: new Date(startTimeStamp),
            duration,
            post,
            automaticComments,
            botType: roomData.botType
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
        if (!rooms.hasOwnProperty(roomID)) {
            let fileName;
            try {
                fileName = await getAssignedChatRoom(roomID);
            } catch (error) {
                console.error(error.message);
                throw new Error("Room not found");
            }

            const startTimeTimeStamp = Date.now();
            const roomData: RoomData = await getRoomData(fileName, startTimeTimeStamp);
            rooms[roomData.id] = roomData;

            Logs.initLogWithSchedule(roomData.id, roomData, fileName);

            const endTime = new Date(startTimeTimeStamp + roomData.duration * 60 * 1000);
            registerEndRoom(roomData.id, endTime);
        }

        return rooms[roomID];
    }

    export const updateRoomData = async (roomID: string, updatedRoomData: RoomData): Promise<void> => {
        const roomFileName = await getAssignedChatRoom(roomID);
        const roomFilePath = path.resolve(roomDir, "roomSpecs", roomFileName);
        const roomDataJSON = JSON.stringify(updatedRoomData, null, 2);
        await fs.promises.writeFile(roomFilePath, roomDataJSON);
        rooms[roomID] = updatedRoomData;
    }
}
