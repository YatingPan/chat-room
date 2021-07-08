// const { AccessInfo,  User } = require("../types/user.type");
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, "../../public");
const privateDir = path.join(__dirname, "../private");
let userID = 0
const users = []


async function assignUserName(){
    const rawdata = await fs.promises.readFile(path.resolve(privateDir, "nickNames.json"));
    const nickNames = JSON.parse(rawdata);

    // choose a random user name fromt the samples given
    const chosenNickName = nickNames[Math.floor(Math.random()*nickNames.length)]
    return chosenNickName
}
  
const createUser = async (accessInfo, id) => {
    const userName = await assignUserName()
    return {
        "user": {
            "name": userName,
            "id": id,
        },
        "accessCode": accessInfo.accessCode
    }
}

const userJoin = async (accessInfo, id) => {

    // Check if the user is already logged in with its details
    const user = getUserFromID(accessInfo?.user?.id)
    
    if(user) {
        console.log("Logging in user", user)
        return user
    }

    let newUser = await createUser(accessInfo, id);
    console.log("New user created",newUser)
    users.push(newUser)
    //console.log("Users:", users)
    return newUser    
}

function getUserFromID(id) {
    return users.find(user => id === user.user.id)
}

module.exports = {
    userJoin,
    getUserFromID
} 