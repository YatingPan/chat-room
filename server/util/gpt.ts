import axios from 'axios';
import { Logs } from "./logs.js";
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const GPT_API_URL = 'https://api.openai.com/v1/chat/completions';
const __dirname = path.resolve();
const privateDir = path.join(__dirname, "server", "private");
const responsesDir = path.join(privateDir, "gptResponses");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
}

// Ensure the responses directory exists
if (!fs.existsSync(responsesDir)) {
    fs.mkdirSync(responsesDir);
}

// Mapping function
const getFilenameFromRoomID = (roomID: string): string | undefined => {
    const roomMap: { [key: string]: string } = {
        "7HZLbSsNFN%2F%2F1N6A3U1JcpTA3l%2B38betm5zj0nE3z0M%3D": "pilot_study_1",
        "v1pMhoy36jeLU4I2K%2BTbKzgEeoXTIhpLCAu0SJ55gBA%3D": "pilot_study_2",
        "29pEoP6tZniEzXnw%2F9WuVB1hkw4Lg7ohxE%2BRPAg2L2c%3D": "pilot_study_3",
        "Ii%2FAK3nTxjq7%2BZccEwQAKyakXBECM9IgoXZNMtSLk24%3D": "pilot_study_4",
        "pEnD1fTdbkvf%2BKlv2XGq3PdtfetMjOFM%2BcA008jCHk8%3D": "pilot_study_5",
        "xkOuOeDqHGsLoV7fNI%2BIMv%2FyxXopYkjxpbBkbpdEF9o%3D": "pilot_study_6",
        "U8xy3mGLwGInIbaWBXU8E7kafukrpt6tlMhMP19sKtI%3D": "pilot_study_7",
        "NspUu56Kd0cdk6ieCBz4piqbfd4JY6ibP6V4Ff9bM1U%3D": "pilot_study_8",
        "4wIMLmmzEYhA8O1kgqDtMn1StSSJya3gmxU0T7OqQoE%3D": "pilot_study_9",
    };
    return roomMap[roomID];
};

interface LogData {
    postTitle: string;
    comments: { userName: string; content: string; }[];
}

const preprocessLog = (logData: LogData): string => {
    const { postTitle, comments } = logData;
    const discussion = comments.map(comment => `${comment.userName}: ${comment.content}`).join('\n');
    return `Discussion: ${discussion}`;
};

const sendToGPT = async (messages: { role: string, content: string }[]): Promise<string> => {
    try {
        const response = await axios.post(GPT_API_URL, {
            model: "gpt-3.5-turbo",
            messages: messages
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.choices[0].message.content.trim();
    }
    catch (error) {
        console.error(`Error sending to GPT: `, error);
        return `Error: Unable to process request.`;
    }
};

const saveGPTResponses = async (roomID: string, version: number, gptResponses: any): Promise<void> => {
    const fileName = getFilenameFromRoomID(roomID);
    if (!fileName) {
        throw new Error(`No filename found for room ID: ${roomID}`);
    }
    const currentDate = new Date();
    const formatTime = moment(currentDate).format("D.MM.YYYY-HH:mm");
    const responseFilePath = path.join(responsesDir, `${fileName}_${formatTime}_v${version}.json`);
    await fs.promises.writeFile(responseFilePath, JSON.stringify(gptResponses, null, 2));
    console.log(`GPT responses saved for room ID ${roomID} version ${version}`);
};

const processLogAndSendToGPT = async (roomID: string, version: number, startTime: number, endTime: number, previousArguments: Set<string>, gptResponses: any, argumentsList: string[]): Promise<void> => {
    const logData = Logs.assembleLog(roomID, startTime, endTime);
    const preprocessedLog = preprocessLog(logData);

    const userMessage = {
        role: "user",
        content: `Here is the log data from ${startTime}:00 to ${endTime}:00:\n${preprocessedLog}\n\nHere is the list of arguments with brief explanation:\n${argumentsList.join(', ')}\n\nYour tasks are:
- Identify and list all the arguments in the list that mentioned in the current log using <arguments_mentioned>arguments mentioned here</arguments_mentioned>, separating arguments with commas. If no arguments are mentioned, use <arguments_mentioned>None</arguments_mentioned>.
- Identify and list all the arguments in the list that are not mentioned from the beginning to the current log using <arguments_not>arguments not mentioned here</arguments_not>, separating arguments with commas.
- Pick one of the missing arguments from the list of arguments not mentioned, and insert it into "Have you considered [selected_missing_argument]?" with the brief explanation of the argument from the list. Don't add any special characters or punctuation around the argument.`
    };

    const messages = [
        { role: "system", content: "You are an ArgumentBot for democratic discussions about AI applications in medicine and health." },
        userMessage
    ];

    const response = await sendToGPT(messages);
    console.log(`GPT response for room ID ${roomID} at log version ${version}: `, response);

    const mentionedMatch = response.match(/<arguments_mentioned>(.*?)<\/arguments_mentioned>/);
    const notMentionedMatch = response.match(/<arguments_not>(.*?)<\/arguments_not>/);
    const selectedArgumentMatch = response.match(/(Have you considered.*)$/);

    if (mentionedMatch) {
        const mentionedArguments = mentionedMatch[1].trim().split(',').map(arg => arg.trim());
        mentionedArguments.forEach(arg => previousArguments.add(arg));
        gptResponses[`arguments_mentioned_for_log_${version}`] = mentionedMatch[1].trim();
    }

    if (notMentionedMatch) {
        gptResponses[`arguments_not_mentioned_for_log_${version}`] = notMentionedMatch[1].trim();
    }

    if (selectedArgumentMatch) {
        const selectedArgument = selectedArgumentMatch[1].trim().replace(/\*\*/g, '').replace(/\.\.\./g, '');
        gptResponses[`selected_missing_argument_for_log_${version}`] = selectedArgument;
        previousArguments.add(selectedArgument);
    }

    await saveGPTResponses(roomID, version, gptResponses);
};

const updateArgumentsList = (argumentsList: string[], previousArguments: Set<string>): string[] => {
    return argumentsList.filter(arg => {
        const argName = arg.split(':')[0].trim();
        return !previousArguments.has(argName);
    });
};

export namespace GPT {
    export const scheduleGPTCalls = (roomID: string): void => {
        const previousArguments = new Set<string>();
        const gptResponses: any = {};

        let argumentsList = [
            "large data processing: AI can manage and process vast amounts of data more effectively.",
            "diagnosis speed: AI can speed up the diagnosis process in healthcare by quickly identifying illnesses.",
            "identification of rare symptoms: AI is good at spotting rare symptoms in healthcare data that humans might miss.",
            "timeliness of diagnosis: AI contributes to more timely diagnoses in healthcare and can thus help to detect diseases at an early stage.",
            "workload shift: AI helps free up medical staff's time, allowing them to focus on patient care and professional development.",
            "support for medical staff: AI can act as a support system for medical staff by assisting with various clinical tasks.",
            "interpersonal relationships: Care provided solely by AI can lead to interpersonal relationships being neglected.",
            "danger of misdiagnosis: AI can increase the risk of misdiagnosis, necessitating human validation which might not always be feasible.",
            "dehumanization: AI can contribute to the dehumanization of healthcare by prioritizing efficiency over patient-centered care.",
            "data privacy: AI can pose significant risks to patient data privacy.",
            "personalized treatment: AI can enhance personalized treatment by tailoring healthcare to individual patient needs.",
            "treatment specification: AI can specify treatments by closely analyzing disease patterns and patient responses.",
            "health monitoring: AI can improve health monitoring by continuously tracking patient health data.",
            "accuracy improvement: AI can improve the accuracy of diagnoses and the comprehensiveness of treatments in healthcare.",
            "cost reduction: AI can reduce costs in healthcare by streamlining operations and reducing resource utilization.",
            "diagnosis interpretability: AI can make it difficult to understand how diagnoses are reached.",
            "data bias and quality: AI can reflect issues in data quality, including bias, inaccuracy, and incompleteness, affecting healthcare decisions.",
            "responsibility, accountability and liability: Determining responsibility for AI decisions in healthcare can be complex.",
            "reliability: AI can offer more reliable performance in healthcare, unaffected by human limitations.",
            "healthcare system integration challenge: AI integration into existing healthcare frameworks can be challenging.",
            "trust in and acceptance of AI: Building trust and acceptance of AI among healthcare professionals and patients can be difficult.",
            "upfront investment: The initial investment for implementing AI in healthcare can be substantial.",
            "loss of human competences: Reliance on AI can lead to the erosion of traditional medical skills.",
            "data misuse risk: AI can be misused for patient profiling in ways that compromise ethics and privacy.",
            "AI transparency: Transparency in AI processes is often lacking in healthcare applications.",
            "risk prevention: AI can enhance risk prevention in healthcare by predicting and mitigating potential health issues.",
            "drug development: AI accelerates the drug development process, making it more efficient and less costly.",
            "inequality in access: AI can exacerbate healthcare access inequalities.",
            "job loss: AI can lead to job losses in the healthcare sector.",
            "objectivity: AI can offer objectivity in medical diagnoses and treatments, minimizing human biases.",
            "healthcare philosophy: AI may prioritize quick, high-tech interventions over addressing underlying lifestyle factors in healthcare.",
            "adaptiveness: AI may struggle to adapt to new medical scenarios or unexpected conditions.",
            "diverse language support: AI can facilitate healthcare delivery in multilingual contexts, improving accessibility.",
            "pressure to be healthy: AI-driven health monitoring can increase pressure on individuals to maintain constant health vigilance.",
            "data sharing obligation: Widespread AI use in healthcare can pressure individuals into sharing their personal health data.",
            "moral dilemmas: AI can introduce moral dilemmas in healthcare decisions, challenging ethical norms.",
            "right to ignorance: AI's capability to predict health outcomes can conflict with an individual’s right to not know certain information.",
            "integrated care coordination: AI facilitates smoother and more effective information exchange among healthcare stakeholders."
        ];

        setTimeout(async () => {
            await processLogAndSendToGPT(roomID, 1, 0, 2, previousArguments, gptResponses, argumentsList);
            argumentsList = updateArgumentsList(argumentsList, previousArguments);
            console.log("Scheduled GPT call 1 with arguments: ", argumentsList);
        }, 2 * 60 * 1000 + 3 * 1000); // At 2:03

        setTimeout(async () => {
            await processLogAndSendToGPT(roomID, 2, 2, 5, previousArguments, gptResponses, argumentsList);
            argumentsList = updateArgumentsList(argumentsList, previousArguments);
            console.log("Scheduled GPT call 2 with arguments: ", argumentsList);
        }, 5 * 60 * 1000 + 3 * 1000); // At 5:03

        setTimeout(async () => {
            await processLogAndSendToGPT(roomID, 3, 5, 8, previousArguments, gptResponses, argumentsList);
            console.log("Scheduled GPT call 3 with arguments: ", argumentsList);
        }, 8 * 60 * 1000 + 3 * 1000); // At 8:03
    };
}
