import path from 'path';
import fs from 'fs';
import type { AccessInfo, User, UserExtended } from '../../types/user.type';
import { Logs } from './logs.js';

const __dirname =  path.join(path.resolve(), "server");
const privateDir = path.join(__dirname, "private");

const rawdata = await fs.promises.readFile(path.resolve(privateDir, "nickNames.json"));
const nickNames: string[] = JSON.parse(rawdata.toString())
const nNickNames: number = nickNames.length
let takenNickNamesIndex = []
let counter = 0
export module Users {
    const users: UserExtended[] = []

    async function assignUserName() {
        // choose a random user name fromt the samples given
        let finalIndex;
        while (true) {
            let tempIndex = Math.random()*nNickNames;
            finalIndex = Math.floor(tempIndex);
            if (takenNickNamesIndex.length === nNickNames){
                takenNickNamesIndex = []
            }
            if (!takenNickNamesIndex.includes(finalIndex)) {
                takenNickNamesIndex.push(finalIndex);
                break;
            }
        }
        const chosenNickName = nickNames[finalIndex]
        return chosenNickName
       
    }
    
    const createUser = async (accessCode: string, id: string): Promise<UserExtended> => {
        const userName = await assignUserName()
        const newUser: UserExtended = {
            "user": {
                "name": userName,
                "id": id,
            },
            "accessCode": accessCode
        }
        Logs.appendUser(accessCode, newUser)
        return newUser 
    }

    export const userJoin = async (accessInfo: AccessInfo, id: string) => {

        // Check if the user is already logged in with its details
        const user = getUserFromID(accessInfo?.user?.id)
        
        if(user){
            if (user.accessCode !== accessInfo.accessCode){
                console.log("Logging in user", user)
                return user
            }
            else{
                user.accessCode = accessInfo.accessCode
                return user
            }
        }

        // if(accessInfo?.mTurkId !== null) {
        //     const mTurkUser = getUserFromMturkId(accessInfo?.mTurkId)
        //     if (mTurkUser) {
        //         if (mTurkUser.accessCode !== accessInfo.accessCode) {
        //             return mTurkUser
        //         }
        //     }
        // }

        let newUser: UserExtended = await createUser(accessInfo?.accessCode, id);
        console.log("New user created", newUser)
        users.push(newUser)
        //console.log("Users:", users)
        return newUser    
    }

    export function getUserFromID(id) {
        return users.find(user => id === user.user.id)
    }

    //export function getUserFromMturkId(id) {
    //    return users.find(user => id === user.user.mTurkId)
    //}


}
