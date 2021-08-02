import path from "path";
import fs  from 'fs';
import crypt from 'crypto';
import { Posts } from "./post.js";
import type { Post, RoomData, UnparsedRoomData } from "../../types/room.type";
import type { BotComment, Comment, UnparsedBotComment } from "../../types/comment.type.js";
import { Chats } from "./chat.js";

const __dirname = path.resolve();
const privateDir = path.join(__dirname, "server", "private")
const roomDir = path.join(privateDir, "chatPrograms")

export module Rooms {

    let rooms = {}

    const loadChatrooms = async () => {
        const availableRooms = await getAvailableRooms()
        for(let availableRoom of availableRooms) {
            const [_, fileName] = availableRoom
            const roomData = await getRoomData(fileName)
            rooms[roomData.id] = roomData
        }
        console.log(rooms)
    }

    // Access is granted if the access Code is equal to the sha265 hash of a file in the chatPrograms directory
    // TODO: not every time fs read
    export async function getAvailableRooms() {
        const files = await fs.promises.readdir(path.resolve(roomDir, "roomSpecs"))
        return files.reduce((a, fileName) => {
            const hash = fileNameToHash(fileName)
            return [...a, [hash, fileName]]
        }, [])
    }
    
    export async function getAssignedChatRoom(roomID: string): Promise<string> {
        const availableRooms = await getAvailableRooms()
        const availableRoomMap = availableRooms.find(([hash, fileName]) => hash === roomID)
        if(availableRoomMap){
            const [_, fileName] = availableRoomMap
            return fileName
        }
        return undefined
    }

    async function fileNameLookup(roomFileName: string): Promise<string> {
        const availableRooms = await getAvailableRooms()
        const availableRoomMap = availableRooms.find(([hash, fileName]) => fileName === roomFileName)
        if(availableRoomMap){
            const [hash, _] = availableRoomMap
            return hash
        }
        return undefined
    }

    const  fileNameToHash = (fileName: string) => 
    encodeURIComponent(crypt.createHash('sha256')
            .update(fileName)
            .digest('base64'))

    const parseRoomData = async (roomData: UnparsedRoomData, fileName: string): Promise<RoomData> => {
        
        // Just for debugging always start room on server start
        const startTimeTimeStamp = Date.now() // Date.parse(roomData["startTime"])
        const startTime = new Date(startTimeTimeStamp)

        // The duration of the room experiment in minutes
        const duration = roomData.duration
        const automaticComments: BotComment[] = roomData.comments.map( (comment: UnparsedBotComment): BotComment => {
            return Chats.parseComment(comment, startTimeTimeStamp)
        })
        const id: string = fileNameToHash(fileName)
        const name: string = roomData.roomName
        const post: Post = await Posts.getPostData(roomData.postName)
        console.log(post)
        const parsedRoomData: RoomData = {
            id,
            name,
            startTime,
            duration,
            post,
            automaticComments
        }
        return parsedRoomData
    }

    const getRawRoomData = async (roomFileName: string): Promise<UnparsedRoomData> => {
        const rawdata = await fs.promises.readFile(path.resolve(roomDir, "roomSpecs", roomFileName))
        const roomData = JSON.parse(rawdata.toString())
        return roomData
    }
    /**
     * @returns The a room Object
     * @argument The file name of a room
     */
    const getRoomData = async (roomFileName: string) : Promise<RoomData> => {
        const unparsedRoomData: UnparsedRoomData = await getRawRoomData(roomFileName)
       
        return parseRoomData(unparsedRoomData, roomFileName)
    }

    export const getStaticRoomData = async (roomID: string): Promise<RoomData> => {
        if(!rooms.hasOwnProperty(roomID)) {
            console.log("Loading Rooms for the first time")
            await loadChatrooms()
        }
        
        return rooms[roomID]
    }
}