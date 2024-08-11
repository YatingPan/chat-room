import path from "path";
import fs from 'fs';
import crypt from 'crypto';
import { Posts } from "./post.js";
import type { Post, RoomData, UnparsedBot, UnparsedRoomData } from "../../types/room.type";
import type { BotComment, Comment, UnparsedBotComment } from "../../types/comment.type.js";
import { Chats } from "./chat.js";
import { Logs } from "./logs.js";
import { GPT } from "./gpt.js";
import moment from "moment";

const __dirname = path.resolve();
const privateDir = path.join(__dirname, "server", "private");
const responsesDir = path.join(privateDir, "gptResponses");
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
            try {
                await Logs.writeLog(roomID, 4, 0, 10);  // Final log from beginning to 15th minute
                console.log("start writing log for room", roomID);
                rooms[roomID].gptScheduled = false; // Reset the gptScheduled flag
                delete rooms[roomID];
            } catch (error) {
                console.error(`Failed to write final log for room ${roomID}: ${error.message}`);
            }
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
        console.log(hash_filename_map);
        return hash_filename_map;
    }

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
            roomData.comments.map( (comment: UnparsedBotComment): BotComment => {
                return Chats.parseComment(comment, startTimeStamp);
            });
        const id: string = fileNameToHash(fileName);
        const name: string = roomData.roomName;
        const post: Post = await Posts.getPostData(roomData.postName);
        const botType: string = roomData.botType;
        const outboundLink: string = roomData.outboundLink;
        const parsedRoomData: RoomData = {
            id,
            name,
            startTime: new Date(startTimeStamp), // set the start time of the room to the current time
            duration,
            post,
            botType,
            automaticComments,
            outboundLink,
            gptScheduled: false // Initialize the gptScheduled flag
        };
        console.log(parsedRoomData);
        return parsedRoomData;
    }

    const getRawRoomData = async (roomFileName: string): Promise<UnparsedRoomData> => {
        const rawdata = await fs.promises.readFile(path.resolve(roomDir, "roomSpecs", roomFileName));
        const roomData = JSON.parse(rawdata.toString());
        return roomData;
    }

    const getRoomData = async (roomFileName: string, startTime: number) : Promise<RoomData> => {
        const unparsedRoomData: UnparsedRoomData = await getRawRoomData(roomFileName);
        return parseRoomData(unparsedRoomData, roomFileName, startTime);
    }

    const sendGPTResponse = async (roomID: string, version: number, io: any) => {
        try {
            const responseFile = await getLatestResponseFile(roomID, version);
            const roomData = await getStaticRoomData(roomID, io);

            if (responseFile) {
                const responseFilePath = path.join(responsesDir, responseFile);
                const gptResponses = JSON.parse(await fs.promises.readFile(responseFilePath, 'utf-8'));
                const responseContent = gptResponses[`selected_missing_argument_for_log_${version}`];
                console.log(`GPT response for room ID ${roomID} at version ${version}: ${responseContent}`);

                const comment = {
                    user: {
                        id: roomData.botType,
                        name: roomData.botType,
                        prolificPid: null,
                        sessionId: null,
                        studyId: null
                    },
                    content: responseContent
                };

                Chats.broadcastComment(comment, { ...comment.user, user: comment.user, accessCode: roomID }, io);
                console.log(`Broadcasted GPT response for room ID ${roomID} at version ${version}`);
            } else {
                console.error(`GPT response file not found for room ID ${roomID} at version ${version}`);
            }
        } catch (error) {
            console.error(`Failed to send GPT response for room ${roomID} at version ${version}: ${error.message}`);
        }
    };

    const getLatestResponseFile = async (roomID: string, version: number) => {
        const availableRooms = await getAvailableRooms();
        const availableRoomMap = availableRooms.find(([hash, fileName]) => hash === roomID);
        if (!availableRoomMap) {
            throw new Error(`Room with ID ${roomID} not found`);
        }
        const [_, fileName] = availableRoomMap;
        
        const responseFiles = await fs.promises.readdir(responsesDir);

        const versionFiles = responseFiles
            .filter(file => file.startsWith(`${fileName}_`) && file.includes(`_v${version}.json`))
            .map(file => {
                const match = file.match(/_(\d+\.\d+\.\d+-\d+:\d+)_v\d+\.json$/);
                return {
                    file,
                    time: match ? moment(match[1], "D.MM.YYYY-HH:mm").toDate() : new Date(0)
                };
            })
            .sort((a, b) => b.time.getTime() - a.time.getTime());

        return versionFiles.length > 0 ? versionFiles[0].file : null;
    };

    export const getStaticRoomData = async (roomID: string, io: any): Promise<RoomData> => {
        if (!rooms.hasOwnProperty(roomID)) {
            let fileName;
            try {
                fileName = await getAssignedChatRoom(roomID);
            } catch (error) {
                console.error(error.message);
                throw new Error("Room not found");
            }

            console.log(`Loading Room(roomID: ${roomID}, fileName: ${fileName}) for the first time!`);

            const startTimeTimeStamp = Date.now();

            const roomData: RoomData = await getRoomData(fileName, startTimeTimeStamp);
            rooms[roomData.id] = roomData;

            try {
                Logs.initLogWithSchedule(roomData.id, roomData, fileName);
            } catch (error) {
                console.error(`Failed to initialize log with schedule for room ${roomData.id}: ${error.message}`);
            }

            if (!roomData.gptScheduled && (roomData.botType === "Alex (Moderator)" || roomData.botType === "Alex")) {
                GPT.scheduleGPTCalls(roomData.id, io, sendGPTResponse);
                rooms[roomData.id].gptScheduled = true;  // Mark GPT calls as scheduled
            }

            const endTime = new Date(startTimeTimeStamp + roomData.duration * 60 * 1000);

            console.log("endTime", endTime);
            registerEndRoom(roomData.id, endTime);
        }

        return rooms[roomID];
    }
}
