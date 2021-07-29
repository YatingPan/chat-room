import type { Post } from "../../types/post.type";

import path from "path";
import crypt from 'crypto';
import fs  from 'fs';
import type { URL } from "url";

const __dirname = path.resolve();
const privateDir = path.join(__dirname, "server", "private")
const roomDir = path.join(privateDir, "chatPrograms")

export module Posts {
    

    const fileNameToHash = (fileName) => 
        encodeURIComponent(crypt.createHash('sha256').update(fileName).digest('base64'))

    const getRawRoomData = async (postFileName: string) => {
        const rawdata = await fs.promises.readFile(path.resolve(roomDir, "posts", postFileName))
        const roomData = JSON.parse(rawdata.toString())
        return roomData
    }

    export const getPostData = async (postFileName: string): Promise<Post> => {

        const rawPostData = await getRawRoomData(postFileName);

        const id = fileNameToHash(postFileName);
        const time: Date = new Date(Date.parse(rawPostData["time"]))
        const title: string = rawPostData["title"]
        const lead: string = rawPostData["lead"]
        const content: string = rawPostData["content"]
        const imageURL: string = path.join("build", "postImages", rawPostData["imageName"])
        const initialLikes: number = rawPostData["likes"]
        const initialDislikes: number = rawPostData["dislikes"]
        
        return {
            id,
            time,
            title,
            lead,
            content,
            imageURL,
            initialLikes,
            initialDislikes
        }
    }
}