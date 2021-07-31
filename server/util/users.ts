import path from 'path';
import fs from 'fs';
import type { AccessInfo, User, UserExtended } from '../../types/user.type';

const __dirname =  path.join(path.resolve(), "server");
const privateDir = path.join(__dirname, "private");

export module Users {
    const users: UserExtended[] = []

    async function assignUserName(){
        const rawdata = await fs.promises.readFile(path.resolve(privateDir, "nickNames.json"));
        const nickNames = JSON.parse(rawdata.toString())

        // choose a random user name fromt the samples given
        const chosenNickName = nickNames[Math.floor(Math.random()*nickNames.length)]
        return chosenNickName
    }
    
    const createUser = async (accessCode: string, id: string): Promise<UserExtended> => {
        const userName = await assignUserName()
        return {
            "user": {
                "name": userName,
                "id": id,
            },
            "accessCode": accessCode
        }
    }

    export const userJoin = async (accessInfo: AccessInfo, id: string) => {

        // Check if the user is already logged in with its details
        const user = getUserFromID(accessInfo?.user?.id)
        
        if(user) {
            console.log("Logging in user", user)
            return user
        }

        let newUser: UserExtended = await createUser(accessInfo?.accessCode, id);
        console.log("New user created",newUser)
        users.push(newUser)
        //console.log("Users:", users)
        return newUser    
    }

    export function getUserFromID(id) {
        return users.find(user => id === user.user.id)
    }
}