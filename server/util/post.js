import path from "path";
import crypt from 'crypto';
import fs from 'fs';
const __dirname = path.resolve();
const privateDir = path.join(__dirname, "server", "private");
const roomDir = path.join(privateDir, "chatPrograms");
export var Posts;
(function (Posts) {
    const fileNameToHash = (fileName) => encodeURIComponent(crypt.createHash('sha256').update(fileName).digest('base64'));
    const getRawRoomData = async (postFileName) => {
        const rawdata = await fs.promises.readFile(path.resolve(roomDir, "posts", postFileName));
        const roomData = JSON.parse(rawdata.toString());
        return roomData;
    };
    Posts.getPostData = async (postFileName) => {
        const rawPostData = await getRawRoomData(postFileName);
        const id = fileNameToHash(postFileName);
        const time = new Date(Date.parse(rawPostData["time"]));
        const title = rawPostData["title"];
        const lead = rawPostData["lead"];
        const content = rawPostData["content"];
        const imageURL = path.join("build", "postImages", rawPostData["imageName"]);
        const initialLikes = rawPostData["likes"];
        const initialDislikes = rawPostData["dislikes"];
        return {
            id,
            time,
            title,
            lead,
            content,
            imageURL,
            initialLikes,
            initialDislikes
        };
    };
})(Posts || (Posts = {}));
//# sourceMappingURL=post.js.map