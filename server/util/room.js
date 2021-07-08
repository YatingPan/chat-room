// const { AccessInfo,  User } = require("../types/user.type");
const fs = require('fs');
const path = require('path');
const crypt = require('crypto');
const cron = require('node-cron');

const publicDir = path.join(__dirname, "../../public");
const privateDir = path.join(__dirname, "../private");
const roomDir = path.join(privateDir, "chatPrograms")

let availableRooms = []

const initRooms = async () => {
    availableRooms = await getAvailableRooms()
    
    fs.watch(path.resolve(roomDir, "roomSpecs"), async (eventType, filename) => {
        console.log(filename);
        availableRooms = await getAvailableRooms()
        console.log("Dir changeed", filename, eventType, availableRooms);
    })
}
const startCron = () => {
    // cron.schedule('0,30 * * * * *', async () => {
    //     availableRooms = await getAvailableRooms()
    //     console.log("updating chatRoomLists", availableRooms)
    //     io.emit("checkCron", "updating chatRoomLists")
    // });
 }

// Access is granted if the access Code is equal to the sha265 hash of a file in the chatPrograms directory
// TODO: not every time fs read
async function getAvailableRooms() {
    const files = await fs.promises.readdir(path.resolve(roomDir, "roomSpecs"))
    return files.reduce((a, fileName) => {
        const hash = encodeURIComponent(crypt.createHash('sha256').update(fileName).digest('base64'))
        return [...a, [hash, fileName]]
    }, [])
}
  
async function getAssignedChatRoom(roomID) {
    //const availableRooms = await getAvailableRooms()
    const [hash, fileName] = availableRooms.find(([hash, fileName]) => hash === roomID)
    return fileName
}

async function fileNameToHash(roomFileName) {
    //const availableRooms = await getAvailableRooms()
    const [hash, fileName] = availableRooms.find(([hash, fileName]) => fileName === roomFileName)
    return hash
}


const getRoomData = async (roomFileName) => {
    const rawdata = await fs.promises.readFile(path.resolve(roomDir, "roomSpecs", roomFileName))
    const roomData = JSON.parse(rawdata)
    return roomData
}
const getRoomMetaData = async (roomFileName) => {
    const roomData = await getRoomData(roomFileName)
    //console.log(roomData)
    const id = await fileNameToHash(roomFileName)
    const name = roomData["roomName"]
    const startTime = new Date(Date.parse(roomData["startTime"]))
    const post = roomData["post"]
    return {
        id,
        name,
        startTime,
        post
    }
}

module.exports = {
    getRoomMetaData,
    getAssignedChatRoom,
    availableRooms,
    initRooms,
    startCron
} 