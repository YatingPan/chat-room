import path from "path";
import fs from 'fs';
import crypt from 'crypto';
import { Posts } from "./post.js";
import type { Post, RoomData, UnparsedBot, UnparsedRoomData } from "../../types/room.type";
import type { BotComment, Comment, UnparsedBotComment } from "../../types/comment.type.js";
import { Chats } from "./chat.js";
import { Logs } from "./logs.js";
import { GPT } from "./gpt.js";

const __dirname = path.resolve();
const privateDir = path.join(__dirname, "server", "private");
const roomDir = path.join(privateDir, "chatPrograms");

export module Rooms {

    let rooms = {};
    let roomSpecFiles: string[] = [];

    const registerEndRoom = (roomID, time: Date) => {
        const timetarget = time.getTime();
        console.log("timetarget", timetarget);
        const timenow = new Date().getTime();
        console.log("timenow", timenow);
        const offsetmilliseconds = timetarget - timenow;
        console.log("offsetmilliseconds", offsetmilliseconds);

        const end_func = async () => {
            await Logs.writeLog(roomID, 4, 0, 10);  // Final log from beginning to 15th minute
            console.log("start writing log for room", roomID);
            delete rooms[roomID];
        }

        if (offsetmilliseconds > 0) {
            setTimeout(end_func, offsetmilliseconds);
        } else {
            end_func();
        }
    }

    /**
     * Used for Access checks
     * Access is granted if the access Code is equal to the sha265 hash of a filename in the chatPrograms directory
     * 
     * 
     * @returns Returns an array of tuples (arrays) that maps from hash to fileNames and back
     * 
     */
    export async function getAvailableRooms(): Promise<any[]> {
        // only read the room spec file list the first time this function gets called.
        // if spec files added -> need to restart the chatroom
        if (!(roomSpecFiles.length > 0)) {
            roomSpecFiles = await fs.promises.readdir(path.resolve(roomDir, "roomSpecs"));
        }
        const hash_filename_map: string[][] = roomSpecFiles.map((fileName: string) => {
            const hash: string = fileNameToHash(fileName);
            const res: any[] = [hash, fileName];
            return res;
        }, []);
        console.log(hash_filename_map);
        return hash_filename_map;
    }

    /**
     * The roomID argument is the sha256 hash of the file name of the room spec file
     * 
     * @param roomID: string
     * @returns Returns a promise of the fileName if there is a chat room specfile who's hash is equal to the roomID
     */
    export async function getAssignedChatRoom(roomID: string): Promise<string> {
        console.log(`getAssignedChatRoom called with roomID: ${roomID}`); // Debugging line
        const availableRooms = await getAvailableRooms();
        const availableRoomMap = availableRooms.find(([hash, fileName]) => hash === roomID);
        if (availableRoomMap) {
            const [_, fileName] = availableRoomMap;
            return fileName;
        }
        throw new Error(`Room with ID ${roomID} not found`);
    }

    /**
     * 
     * @param roomFileName 
     * @returns a promise of the hash of the roomSpecFile name given the roomFileName
     */
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

    /**
     * 
     * @param roomData is an object of unparsed, raw room data
     * @param fileName is the file name this data has originated from
     * @param startTimeStamp is the time stamp at which this room should be started
     * @returns returns a promise of the parsed room data
     */
    const parseRoomData = async (roomData: UnparsedRoomData, fileName: string, startTimeStamp: number): Promise<RoomData> => {
        // The duration of the room experiment in minutes
        const duration = roomData.duration;
        const automaticComments: BotComment[] = 
            roomData.comments.map( (comment: UnparsedBotComment): BotComment => {
                return Chats.parseComment(comment, startTimeStamp);
            });
        const id: string = fileNameToHash(fileName);
        const name: string = roomData.roomName;
        const post: Post = await Posts.getPostData(roomData.postName);
        const botType: string = roomData.botType;
        const parsedRoomData: RoomData = {
            id,
            name,
            startTime: new Date(startTimeStamp), // set the start time of the room to the current time
            duration,
            post,
            botType,
            automaticComments,
        };
        console.log(parsedRoomData);
        return parsedRoomData;
    }

    const getRawRoomData = async (roomFileName: string): Promise<UnparsedRoomData> => {
        const rawdata = await fs.promises.readFile(path.resolve(roomDir, "roomSpecs", roomFileName));
        const roomData = JSON.parse(rawdata.toString());
        return roomData;
    }

    /**
     * 
     * @parameter roomFileName of a room
     * @parameter start time is the time stamp at which the room should start
     * @returns A parsed room Object
     */
    const getRoomData = async (roomFileName: string, startTime: number) : Promise<RoomData> => {
        const unparsedRoomData: UnparsedRoomData = await getRawRoomData(roomFileName);
        return parseRoomData(unparsedRoomData, roomFileName, startTime);
    }

    /**
     * If there exists a room spec file with the corresponding hash (roomID) it will parse the file and return the RoomData object
     * where the time is set to this first call to the function.
     * 
     * @param roomID the sha256 hash of the file name of the room spec file
     */
    export const getStaticRoomData = async (roomID: string): Promise<RoomData> => {
        if (!rooms.hasOwnProperty(roomID)) {
            let fileName;
            try {
                fileName = await getAssignedChatRoom(roomID);
            } catch (error) {
                console.error(error.message);
                throw new Error("Room not found");
            }

            console.log(`Loading Room(roomID: ${roomID}, fileName: ${fileName}) for the first time!`);

            // set the start time of the room to the current time
            const startTimeTimeStamp = Date.now();

            const roomData: RoomData = await getRoomData(fileName, startTimeTimeStamp);
            rooms[roomData.id] = roomData;

            Logs.initLogWithSchedule(roomData.id, roomData, fileName);

            // Conditionally call GPT.scheduleGPTCalls based on botType
            if (roomData.botType === "Alex (Moderator)" || roomData.botType === "Alex") {
                GPT.scheduleGPTCalls(roomData.id);
            }

            // calculate end Time from start time and duration given in minutes
            const endTime = new Date(startTimeTimeStamp + roomData.duration * 60 * 1000);

            console.log("endTime", endTime);
            registerEndRoom(roomData.id, endTime);
        }

        return rooms[roomID];
    }
}
