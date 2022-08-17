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
    
    const createUser = async (accessCode: string, mTurkId: string, assignmentId:string, hitId: string, id: string): Promise<UserExtended> => {
        const userName = await assignUserName()
        const newUser: UserExtended = {
            "user": {
                "name": userName,
                "mTurkId": mTurkId,
                "id": id,
                "hitId": hitId,
                "assignmentId": assignmentId

            },
            "accessCode": accessCode
        }
        Logs.appendUser(accessCode, newUser)
        return newUser 
    }

    export const userJoin = async (accessInfo: AccessInfo, id: string) => {

        // Check if the user is already logged in with its details
        const user = getUserFromID(accessInfo?.user?.id)
        
        if(user) {
            console.log("Logging in user", user)
            return user
        }

        const mTurkUser = getUserFromMturkId(accessInfo?.mTurkId)
        if(mTurkUser){
            console.log("Logging in user", mTurkUser)
            return mTurkUser
        }

        let newUser: UserExtended = await createUser(accessInfo?.accessCode, accessInfo?.mTurkId, accessInfo?.assignmentId, accessInfo?.hitId, id);
        console.log("New user created", newUser)
        users.push(newUser)
        //console.log("Users:", users)
        return newUser    
    }

    export function getUserFromID(id) {
        return users.find(user => id === user.user.id)
    }

    export function getUserFromMturkId(id) {
        return users.find(user => id === user.user.mTurkId)
    }


}
