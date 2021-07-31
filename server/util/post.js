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
        const unparsedPostData = await getRawRoomData(postFileName);
        const id = fileNameToHash(postFileName);
        const time = new Date(Date.parse(unparsedPostData.time));
        const title = unparsedPostData.title;
        const lead = unparsedPostData.lead;
        const content = unparsedPostData.content;
        const imageURL = path.join("build", "postImages", unparsedPostData.imageName);
        const initialLikes = unparsedPostData.initialLikes;
        const initialDislikes = unparsedPostData.initialDislikes;
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