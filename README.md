# Online Discussion Platform with ArgumentBot

## Introduction

This project is a multi-user, multi-chatroom online discussion platform with argumentation moderation powered by GPT. It is based on the TOD platform developed by the DigDemLab at the Department of Political Science, University of Zurich. Designed for group discussions in research projects, the platform supports the ArgumentBot project led by Valeria Vuk, Prof. Dr. Fabrizio Gilardi, and Dr. Cristina Sarasua at the Department of Political Science, UZH. The technology is supported by Yating Pan from the Department of Computational Linguistics, UZH.

Participants can join discussions in two ways:
- **Directly via URL**: [https://online.discussionroom.org/secret](https://online.discussionroom.org/secret)
- **Via Prolific Study**: Using their Prolific PID, session ID, and study ID.

## Technology Stack

### Backend
- **Programming Language**: Python
- **Framework**: Flask
- **Database**: SQLite
- **API**: OpenAI API

### Frontend
- **Programming Language**: JavaScript
- **Framework**: Svelte, npm

### Communication and Integration
- **Front-End/Back-End Communication**: Socket.IO
- **Deployment and Monitoring**: PM2, Nginx

## Key Features
- Support for creating and managing multiple chatrooms simultaneously.
- Dynamic generation and management of discussion posts, rooms, comments, and replies.
- GPT-supported automated discussion moderation.
- Detailed logging and analysis of discussions.

## GPT Moderation Flow

In the ArgumentBot project, participants are invited to join different chatrooms, with five participants per room. Each room session lasts 10 minutes and discusses the same topic. Pre-surveys and post-surveys on Qualtrics are consistent across all participants.

### Moderation Types
1. **No Moderation**: No intervention during the 10-minute session.
2. **User-Skinned GPT Moderation**: GPT responses appear as if sent by a user named "Alex."
3. **Moderator-Skinned GPT Moderation**: GPT responses are labeled as sent by "Alex (Moderator)" in orange, indicating a moderation message.

### Moderation Timing
- **At 02:03**: The chat log from 00:00 to 02:00 is sent to GPT-4, which identifies mentioned and missing arguments and selects one missing argument to generate a suggestion in the format: "Have you considered...?"
- **At 05:03**: The chat log from 02:00 to 05:00 is sent to GPT-4, with previously selected arguments removed from consideration.
- **At 08:03**: The chat log from 05:00 to 08:00 is sent to GPT-4, again with prior selections removed.

A full log is generated at the end of the session.

### Log Storage
- **Chat Logs**: Stored at `/srv/chat-room/server/private/chatLogs`.
- **GPT Responses**: Stored at `/srv/chat-room/server/private/gptResponses`.

Logs are sent to GPT at intervals rather than the complete session log to reduce costs.

### Front-End Timing Discrepancies
Due to potential loading delays on participants’ devices, the timer may show slight differences across users. To ensure all comments are recorded, a final log (Log 5) covering the entire session from 00:00 to 11:00 is generated.

## Settings for Researchers

### Setting Up Chatrooms

#### Creating a Discussion Post

1. **Navigate to the Posts Directory**:  
   `/srv/chat-room/server/private/chatPrograms/posts`

2. **Add an Image (Optional)**:  
   Save the image as a `.jpg` file in `/srv/chat-room/server/private/chatPrograms/posts/images`.

3. **Create a New Post**:  
   Create a JSON file with the following structure:
   ```json
   {
       "title": "Human Cloning: The Debate We Need to Have",
       "time": "2022-05-13 09:24",
       "content": "While this changed in 2015, there has been no real progress on the issue...",
       "imageName": "human_cloning.jpg",
       "lead": "Since Dolly the Sheep was cloned in 1996, the question of whether human reproductive cloning should be banned or pursued has been the subject of national and international debates..."
   }
   ```

   For the ArgumentBot project, an example post might look like this:
   ```json
   {
      "title": "Artificial Intelligence in Healthcare - What Do You Think?",
      "time": "", // Leave empty if you don’t want to display time
      "content": "", // Leave empty if there is no content
      "imageName": "", // Leave empty if there is no image
      "lead": "Should artificial intelligence (AI) be used in healthcare? Discuss this question with others in this group. Express your opinion on the topic by providing arguments for or against the use of AI in healthcare. Remember to always be respectful of others and their opinions, even if you disagree with them."
   }
   ```

#### Creating Chatrooms

1. **Navigate to the Chatroom Specifications Directory**:  
   `/srv/chat-room/server/private/chatPrograms/roomSpecs`

2. **Create a Chatroom**:  
   Chatroom files start with “pilot_study” for the ArgumentBot project. Example:
   ```json
   {
      "outboundLink": "https://ipz.qualtrics.com/jfe/form/SV_aXIdNomI88sWYDk", // Post-survey link from Qualtrics
      "roomName": "The Online Discussion Room",
      "postName": "prompt_test_chat.json", // Post file name
      "startTime": "", // Leave empty; the start time will be set when the room is first initialized
      "duration": 10, // Duration in minutes
      "botType": "Alex (Moderator)", // Bot type can be "Alex" or empty
      "comments": [] // Leave empty if no pre-defined comments
   }
   ```

#### Batch Creating Multiple Chatrooms

1. **Modify the Script**:  
   Edit `/srv/chat-room/server/private/chatPrograms/roomSpecs/createRooms.py`:
   ```python
   # Number of rooms to create
   total_rooms = 87  # Total number of rooms

   # Shared parameters for all room files
   room_base = {
       "roomName": "The Online Discussion Room",
       "startTime": "",
       "postName": "prompt_test_chat.json",
       "duration": 10,
       "outboundLink": "https://ipz.qualtrics.com/jfe/form/SV_aXIdNomI88sWYDk",
       "comments": []
   }
   ```

2. **Run the Script**:  
   ```bash
   cd /srv/chat-room/server/private/chatPrograms/roomSpecs
   python createRooms.py
   ```

   The script will generate multiple chatrooms with consistent settings. Bot types are assigned based on the room index:
   - `index % 3 == 0`: No bot
   - `index % 3 == 1`: Alex (Moderator)
   - `index % 3 == 2`: Alex

3. **Customize Nicknames**:  
   Every user entering a chatroom will receive a nickname. Edit `/srv/chat-room/server/private/nickNames.json` to modify the list of nicknames.

### Log Generation

For each 10-minute session, five log files are generated, named in the format `roomName_date-time_logVersion_log.json`.

#### Log Details
- **Log 1**: Covers chat from 00:00 to 02:00, generated at 02:00.
- **Log 2**: Covers chat from 02:00 to 05:00, generated at 05:00.
- **Log 3**: Covers chat from 05:00 to 08:00, generated at 08:00.
- **Log 4**: Covers chat from 00:00 to 10:00, generated at 10:00.
- **Log 5**: Covers chat from 00:00 to 11:00, generated at 11:00.

Logs 1, 2, and 3 are used during the chat to send to GPT for analysis. Log 4 contains the entire chat session. Log 5 ensures all comments are captured due to potential front-end loading delays.

### GPT Moderation

#### Adding Your OpenAI Token
Before using GPT, add your OpenAI API token. Create a file named `.env` in `/srv/chat-room` with the following content:

```
OPENAI_API_KEY=sk-xxxxx
```

Note: This file is included in `.gitignore` and won't be pushed to GitHub.

#### Modifying GPT Prompts and Argument List
You can modify the prompt and argument list in `/srv/chat-room/server/util/gpt.ts`.

1. **Modify GPT Model**:
   ```typescript
   const sendToGPT = async (messages: { role: string, content: string }[]): Promise<string> => {
       try {
           const response = await axios.post(GPT_API_URL, {
               model: "gpt-4", // Change to other models if needed
               messages: messages
           }, {
               headers: {
                   'Authorization': `Bearer ${OPENAI_API_KEY}`,
                   'Content-Type': 'application/json'
               }
           });
           return response.data.choices[0].message.content.trim();
       } catch (error) {
           console.error(`Error sending to GPT: `, error);


           return `Error: Unable to process request.`;
       }
   };
   ```

2. **Define System and User Prompts**:
   The system prompt defines GPT's role, while the user prompt includes log data and the argument list. For each room session, send the system prompt and the user prompt the first time GPT is called, and send the user prompt with an updated argument list the second and third times GPT is called.
   ```typescript
   const userMessage = {
       role: "user",
       content: `Here is the log data from ${startTime}:00 to ${endTime}:00:\n${preprocessedLog}\n\nHere is the list of arguments with brief explanation:\n${argumentsList.join(', ')}\n\nYour tasks are:
       - Identify and list all the arguments in the list that are mentioned in the current log using <arguments_mentioned>arguments mentioned here</arguments_mentioned>, separating arguments with commas. If no arguments are mentioned, use <arguments_mentioned>None</arguments_mentioned>.
       - Identify and list all the arguments in the list that are not mentioned from the beginning to the current log using <arguments_not>arguments not mentioned here</arguments_not>, separating arguments with commas.
       - Pick one of the missing arguments from the list of arguments not mentioned, and insert it into "Have you considered [selected_missing_argument]?" with the brief explanation of the argument from the list. Don’t add any special characters or punctuation around the argument.`
   };

   const messages = [
       { role: "system", content: "You are an ArgumentBot for democratic discussions about AI applications in medicine and health." },
       userMessage
   ];
   ```

3. **Edit Argument List**:
   You can edit the list of arguments in `gpt.ts`:
   ```typescript
   let argumentsList = [
       "large data processing: AI can manage and process vast amounts of data more effectively.",
       "diagnosis speed: AI can speed up the diagnosis process in healthcare by quickly identifying illnesses.",
       // Add more arguments as needed
   ];
   ```

#### Scheduling GPT Calls in Multiple Rooms
The file `/srv/chat-room/server/util/room.ts` manages GPT calls in multiple rooms. It initializes room data and ensures GPT is called only once per session.

   ```typescript
        const parsedRoomData: RoomData = {
            id,
            name,
            startTime: new Date(startTimeStamp), // Set the start time of the room to the current time
            duration,
            post,
            botType,
            automaticComments,
            outboundLink,
            gptScheduled: false // Initialize the gptScheduled flag, default value is false
        };
   ```

To find the latest GPT response for a room, compare version and generation time:

   ```typescript
    const getLatestResponseFile = async (roomID: string, version: number) => {
        const availableRooms = await getAvailableRooms();
        const availableRoomMap = availableRooms.find(([hash, fileName]) => hash === roomID);
        if (!availableRoomMap) {
            throw new Error(`Room with ID ${roomID} not found`);
        }
        const [_, fileName] = availableRoomMap;
       
        const responseFiles = await fs.promises.readdir(responsesDir);

        const versionFiles = responseFiles
            .filter(file => file.startsWith(`${fileName}_`) && file.includes(`_v${version}.json`))
            .map(file => {
                const match = file.match(/_(\d+\.\d+\.\d+-\d+:\d+)_v\d+\.json$/);
                return {
                    file,
                    time: match ? moment(match[1], "D.MM.YYYY-HH:mm").toDate() : new Date(0)
                };
            })
            .sort((a, b) => b.time.getTime() - a.time.getTime());

        return versionFiles.length > 0 ? versionFiles[0].file : null;
    };
   ```

Extract the selected argument and broadcast it as a comment:
   ```typescript
   const sendGPTResponse = async (roomID: string, version: number, io: any) => {
        try {
            const responseFile = await getLatestResponseFile(roomID, version);
            const roomData = await getStaticRoomData(roomID, io);

            if (responseFile) {
                const responseFilePath = path.join(responsesDir, responseFile);
                const gptResponses = JSON.parse(await fs.promises.readFile(responseFilePath, 'utf-8'));
                const responseContent = gptResponses[`selected_missing_argument_for_log_${version}`];
                console.log(`GPT response for room ID ${roomID} at version ${version}: ${responseContent}`);

                const comment = {
                    user: {
                        id: roomData.botType,
                        name: roomData.botType,
                        prolificPid: null,
                        sessionId: null,
                        studyId: null
                    },
                    content: responseContent
                };

                Chats.broadcastComment(comment, { ...comment.user, user: comment.user, accessCode: roomID }, io);
                console.log(`Broadcasted GPT response for room ID ${roomID} at version ${version}`);
            } else {
                console.error(`GPT response file not found for room ID ${roomID} at version ${version}`);
            }
        } catch (error) {
            console.error(`Failed to send GPT response for room ${roomID} at version ${version}: ${error.message}`);
        }
    };
   ```

Finally, ensure GPT calls are scheduled only once per session:
   ```typescript
            if (!roomData.gptScheduled && (roomData.botType === "Alex (Moderator)" || roomData.botType === "Alex")) {
                GPT.scheduleGPTCalls(roomData.id, io, sendGPTResponse);
                rooms[roomData.id].gptScheduled = true;  // Mark GPT calls as scheduled
            }
   ```

### Highlighting the Moderator

To ensure users notice moderation messages, the username "Alex (Moderator)" is displayed in orange. This is implemented in `/srv/chat-room/src/components/comment.svelte`. If the username contains “Moderator,” it will be styled in orange.

## Data Collection and Processing

### Log Data Processing

#### Renaming Log Files
Log files are named in the format `roomName_date-time_logVersion.log.json`, e.g., `pilot_study_55_23.07.2024-09:32_2.log`. Some systems may not accept symbols like ":", so filenames may need renaming for local downloads.

Use `/srv/chat-room/server/post_process/rename_log.py` to rename log files. Update the script to specify the log file path to process.

#### Correcting Log Versions
Logs generated at the 11th minute are named with a log version of 4, which needs correcting to 5. Use `/srv/chat-room/server/post_process/correct_log_5.py` to update these logs. Modify the script to specify the log directory.

#### Compressing and Downloading Logs
To compress log files for download, navigate to the parent folder of the log folder and use:
```bash
zip -r compressed_file_name folder_to_compress
```

### Log Statistics
To analyze log statistics, use `/srv/chat-room/server/post_process/log_statistics.py`. Update the script with the log directories to process.

The script generates three files:
- **duplicate_usernames.txt**: Lists logs with multiple usernames for the same Prolific PID.
- **log_statistics.csv**: Summarizes participant numbers, actual speakers, and start times for each room.
- **speaking_stats.txt**: Counts rooms with 0 to 5 speakers, categorized by bot type (Alex, Alex (Moderator), or no bot).

### Selecting Final Full Logs and Validating

Typically, Log 5 will have more comprehensive content than Log 4, but sometimes users may leave the room early, making Log 4 more complete. To address this, use `/srv/chat-room/server/post_process/merge_log.py` to compare Log 4 and Log 5 and select the most complete log.

Modify the script to specify the log directories to process.

The script outputs:
- **full_log**: Contains the most complete logs for each session.
- **comparison.csv**: Lists Log 4 and Log 5 files, noting whether they are identical and which was selected.

To verify processing accuracy, compare `comparison.csv` with `log_statistics.csv` using `/srv/chat-room/server/post_process/compare_log_statistics_and_comparison.py`. Modify the script to specify the file paths.

The script generates two files:
- **missing_in_comparison.txt**: Lists Log 4 files found in `log_statistics.csv` but not in `comparison.csv`.
- **missing_in_log_statistics.txt**: Lists Log 4 files found in `comparison.csv` but not in `log_statistics.csv`.

Both files should be empty if processing was correct.

### GPT Response Processing
We only need version 3 (v3) responses, which contain all GPT responses. Use `/srv/chat-room/server/post_process/select_gptresponse.py` to select and store these responses. Update the script with the directories to process, and it will store all GPT responses for each session in a single JSON file.

## Running the Project

### Local Start

1. **Navigate to the Project Directory**:
   ```bash
   cd /srv/chat-room
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Build the Project**:
   ```bash
   npm run build
   ```

4. **Start the Project**:
   ```bash
   npm start
   ```

### Handling Errors

If you encounter errors indicating that the server is already running:

1. **Terminate the Current Server**:
   ```

bash
   sudo lsof -i :5001
   ```

2. **Find the PID and Kill the Process**:
   ```bash
   sudo kill -9 <PID>
   ```

3. **Stop All PM2 Processes**:
   ```bash
   pm2 stop all
   ```

4. **Restart the Project**:
   ```bash
   npm start
   ```

After starting the project, you can access the chatroom at `https://online.discussionroom.org/secret`. Logs will be displayed in the terminal window for debugging.

### Deployment

To deploy the project:

1. **Navigate to the Project Directory**:
   ```bash
   cd /srv/chat-room
   ```

2. **Restart the Chat Room Service**:
   ```bash
   pm2 restart chat-room
   ```

Once the service is online, the chatroom is live. You can view the created rooms at `https://online.discussionroom.org/secret`.

The deployment remains active until stopped with `pm2 stop all` or redeployed.

### Real-Time Log Monitoring

To monitor logs in real-time:
```bash
pm2 logs
```

For historical logs:
- **All Historical Logs**:
  ```bash
  /home/ubuntu/.pm2/logs/chat-room-out.log
  ```

- **All Historical Error Logs**:
  ```bash
  /home/ubuntu/.pm2/logs/chat-room-error.log
  ```

### GitHub and Bash Script

A bash script is available in the chatroom directory: `/srv/chat-room/server_setup_restart.sh`.

Before starting, ensure the path and GitHub repository in the script are correct:

```bash
# CHANGE THIS TO THE RIGHT GITHUB REPOSITORY
repo_url="https://github.com/YatingPan/chat-room.git"
```

After pushing your code to GitHub, run the script to update the project:

```bash
bash server_setup_restart.sh
```

This script deletes the contents of the defined file paths and pulls the updated code from the GitHub repository.

Note: The `.env` file containing the OpenAI API token will not be uploaded to GitHub and will be deleted during the script execution.
