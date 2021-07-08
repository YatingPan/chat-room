// const { AccessInfo,  User } = require("../types/user.type");
const fs = require('fs');
const path = require('path');
const crypt = require('crypto');
const cron = require('node-cron');

const publicDir = path.join(__dirname, "../../public");
const privateDir = path.join(__dirname, "../private");
const roomDir = path.join(privateDir, "chatPrograms")

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
    const availableRooms = await getAvailableRooms()
    const availableRoomMap = availableRooms.find(([hash, fileName]) => hash === roomID)
    if(availableRoomMap){
        const [_, fileName] = availableRoomMap
        return fileName
    }
    return undefined
}

async function fileNameToHash(roomFileName) {
    const availableRooms = await getAvailableRooms()
    const availableRoomMap  = availableRooms.find(([hash, fileName]) => fileName === roomFileName)
    if(availableRoomMap){
        const [hash, _] = availableRoomMap
        return hash
    }
    return undefined
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
    getAvailableRooms,
    startCron
} 