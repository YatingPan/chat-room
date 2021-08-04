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
        const imageName = unparsedPostData.imageName; //path.join("build", "postImages", unparsedPostData.imageName)
        const likes = [...Array(unparsedPostData.likes)].map(() => {
            return {
                userID: "NoOne",
                time: new Date()
            };
        });
        const dislikes = [...Array(unparsedPostData.dislikes).keys()].map(() => {
            return {
                userID: "NoOne",
                time: new Date()
            };
        });
        console.log(likes, dislikes);
        return {
            id,
            time,
            title,
            lead,
            content,
            imageName,
            likes,
            dislikes
        };
    };
})(Posts || (Posts = {}));
//# sourceMappingURL=post.js.map