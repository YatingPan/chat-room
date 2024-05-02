import path from "path";
import fs from 'fs';
import crypt from 'crypto';
import { Posts } from "./post.js";
import type { Post, RoomData, UnparsedBot, UnparsedRoomData } from "../../types/room.type";
//import { ModerationType } from "../../types/room.type.js";
import type { BotComment, Comment, UnparsedBotComment } from "../../types/comment.type.js";
import { Chats } from "./chat.js";
import { Logs } from "./logs.js"

const __dirname = path.resolve();
const privateDir = path.join(__dirname, "server", "private")
const roomDir = path.join(privateDir, "chatPrograms")


export module Rooms {

    let rooms = {}
    let roomSpecFiles: string[] = []

    // const registerRoomDataCollection = (roomID, time: Date) => {
    //     const timetarget = time.getTime();
    //     const timenow =  new Date().getTime();
    //     const offsetmilliseconds = timetarget - timenow;
        
        
    //     if (offsetmilliseconds > 0) setTimeout(() => Logs.writeLog(roomID), offsetmilliseconds)
    //     else Logs.writeLog(roomID)
    // }

    const registerEndRoom = (roomID, time: Date) => {
        const timetarget = time.getTime();
        console.log("timetarget", timetarget)
        const timenow =  new Date().getTime();
        console.log("timenow", timenow)
        const offsetmilliseconds = timetarget - timenow;
        console.log("offsetmilliseconds", offsetmilliseconds)
        
        //const end_func = () => {
        //    Logs.writeLog(roomID)
        //    console.log("start writing log for room", roomID)
        //    delete rooms[roomID]
        //}
        
        //if (offsetmilliseconds > 0) setTimeout(end_func, offsetmilliseconds)
        //else end_func()

        const end_func = async () => {
            await Logs.writeLog(roomID);  // Assuming writeLog returns a promise
            console.log("start writing log for room", roomID);

            delete rooms[roomID];
            // Possibly include redirection here or signal that it's okay to redirect
        }
        
        if (offsetmilliseconds > 0) {
            setTimeout(end_func, offsetmilliseconds);
        } else {
            end_func();
        }
        
    }
    // const registerCloseChatRoom = (roomID, time: Date) => {
    //     const timetarget = time.getTime();
    //     const timenow =  new Date().getTime();
    //     const offsetmilliseconds = timetarget - timenow;
        
        
    //     if (offsetmilliseconds > 0) setTimeout(() => {delete rooms[roomID]})
    //     else Logs.writeLog(roomID)
    // }

    /**
     * Used for Access checks
     * Access is granted if the access Code is equal to the sha265 hash of a filename in the chatPrograms directory
     * 
     * 
     * @returns Returns an array of tupples (arrays) that maps from hash to fileNames and back
     * 
     */
    export async function getAvailableRooms(): Promise<any[]> {
        // only read the room spec file list the first time this function gets called.
        // if spec files added -> need to restart the chatroom
        if(!(roomSpecFiles.length > 0)) {
            roomSpecFiles = await fs.promises.readdir(path.resolve(roomDir, "roomSpecs"))
        }
        const hash_filename_map: string[][] = roomSpecFiles.map((fileName: string) => {
            const hash: string = fileNameToHash(fileName)
            const res: any[] = [hash, fileName]
            return res
        }, [])
        console.log(hash_filename_map)
        return hash_filename_map
    }
    
    /**
     * The roomID argument is the sha256 hash of the file name of the room spec file
     * 
     * @param roomID: string
     * @returns Returns a promise of the fileName if there is a chat room specfile who's hash is equal to the roomID
     */
    export async function getAssignedChatRoom(roomID: string): Promise<string> {
        const availableRooms = await getAvailableRooms()
        const availableRoomMap = availableRooms.find(([hash, fileName]) => hash === roomID)
        if(availableRoomMap){
            const [_, fileName] = availableRoomMap
            return fileName
        }
        return undefined
    }
    /**
     * 
     * @param roomFileName 
     * @returns a promise of the hash of the roomSpecFile name given the roomFileName and undefined if it cannot be found
     */
    async function fileNameLookup(roomFileName: string): Promise<string> {
        const availableRooms = await getAvailableRooms()
        const availableRoomMap = availableRooms.find(([hash, fileName]) => fileName === roomFileName)
        if(availableRoomMap){
            const [hash, _] = availableRoomMap
            return hash
        }
        return undefined
    }

    const fileNameToHash = (fileName: string) => 
        encodeURIComponent(crypt.createHash('sha256')
            .update(fileName)
            .digest('base64'))

    /**
     * 
     * @param botId 
     * @returns 
     */
    //const parseUserModeration = (unparsedModeration: UnparsedModeration, botId: string, startTime: number): Moderation => {
        
    //    const time: Date = new Date(startTime + unparsedModeration.time * 1000)
        //console.log("parseUserModeration", time, unparsedModeration)
    //    const moderation: Moderation = {
    //        type: ModerationType.Ban,
    //        time,
    //        target: botId,
    //        textNotification: unparsedModeration.textNotification,
    //        textComment: unparsedModeration.textComment,
    //        textColor: unparsedModeration?.textColor,
    //        textSize: unparsedModeration?.textSize,
    //        bgColor: unparsedModeration?.bgColor,
    //        signature: unparsedModeration?.signature

    //    }
    //    return moderation
    //}

    /**
     * 
     * @param roomData is an object of unparsed, raw room data
     * @param fileName is the file name this data has originated from
     * @param startTimeStamp is the time stamp at which this room should be started
     * @returns returns a promise of the parsed room data
     */
    const parseRoomData = async (roomData: UnparsedRoomData, fileName: string, startTimeStamp: number): Promise<RoomData> => {
        


        // The duration of the room experiment in minutes
        const duration = roomData.duration
        const automaticComments: BotComment[] = 
            roomData.comments.map( (comment: UnparsedBotComment): BotComment => {
                return Chats.parseComment(comment, startTimeStamp)
            })
        const id: string = fileNameToHash(fileName)
        const name: string = roomData.roomName
        const post: Post = await Posts.getPostData(roomData.postName)

        //const userModerationEvents: Moderation[] = roomData.bots
        //    .filter((bot: UnparsedBot) => bot.moderation ? true : false)
        //    .map((bot: UnparsedBot): Moderation => {
        //            return parseUserModeration(bot.moderation, bot.name, startTimeStamp)
        //    })
        //console.log("userModerationEvents", userModerationEvents)

        const outboundLink = roomData.outboundLink

        const parsedRoomData: RoomData = {
            id,
            name,
            startTime: new Date(startTimeStamp), // set the start time of the room to the current time
            duration,
            post,
            automaticComments,
            //userModerationEvents,
            outboundLink
        }
        return parsedRoomData
    }

    const getRawRoomData = async (roomFileName: string): Promise<UnparsedRoomData> => {
        const rawdata = await fs.promises.readFile(path.resolve(roomDir, "roomSpecs", roomFileName))
        const roomData = JSON.parse(rawdata.toString())
        return roomData
    }
    /**
     * 
     * @parameter roomFileName of a room
     * @parameter start time is the time stamp at which the room should start
     * @returns A parsed room Object
     */
    const getRoomData = async (roomFileName: string, startTime: number) : Promise<RoomData> => {
        const unparsedRoomData: UnparsedRoomData = await getRawRoomData(roomFileName)
       
        return parseRoomData(unparsedRoomData, roomFileName, startTime)
    }

    /**
     * If there exists a room spec file with the corresponding hash (roomID) it will parse the file and return the RoomData object
     * where the time is set to this first call to the function.
     * 
     * @param roomID the sha256 hash of the file name of the room spec file
     */
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
}