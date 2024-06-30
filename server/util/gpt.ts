import axios from 'axios';
import type { Log } from "../../types/room.type";
import type { Comment } from "../../types/comment.type";
import { Logs } from "./logs.js";
import { Rooms } from "./room.js";

const GPT_API_URL = 'https://api.openai.com/v1/engines/davinci-codex/completions';

export module GPT {
    const sendLogToGPT = async (logData: Log, version: number): Promise<string> => {
        try {
            const response = await axios.post(GPT_API_URL, {
                prompt: `Analyze the following chat log and identify missing democratic discussion elements:\n\n${JSON.stringify(logData, null, 2)}`,
                max_tokens: 150,
                n: 1,
                stop: null,
                temperature: 0.7,
            }, {
                headers: {
                    'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].text.trim();
        } catch (error) {
            console.error(`Error sending log version ${version} to GPT-4: `, error);
            return `Error: Unable to analyze log version ${version}.`;
        }
    }

    const updateRoomDataWithGPTResponse = async (roomID: string, version: number, gptResponse: string) => {
        const roomData = await Rooms.getStaticRoomData(roomID);
        const commentIndex = version - 1;
        if (roomData.automaticComments[commentIndex]) {
            roomData.automaticComments[commentIndex].content = gptResponse;
            await Rooms.updateRoomData(roomID, roomData);  // You need to implement this function to update the room data
        }
    }

    export const analyzeLogs = async (roomID: string) => {
        const logVersions = [1, 2, 3];
        for (const version of logVersions) {
            const logData = Logs.returnLog()[roomID];
            const gptResponse = await sendLogToGPT(logData, version);
            await updateRoomDataWithGPTResponse(roomID, version, gptResponse);
        }
    }
}
