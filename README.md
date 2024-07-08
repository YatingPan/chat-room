# ArgumentBot Research
This is the github repository for ArgumentBot project, based on the TOD developed by the DigDemLab of the Political Science Deparment of University of Zurich. 

# Main Workflow
This project allows researchers to launch discussion experiment in various chatrooms with different moderation integrating of GPT API from OpenAI.


## For researchers to start:
Please make sure to be in the UZH network when attempting to upload the files to the respective folders via FTP or Github access.


1. Add posts

In order to add posts, create a json file of post, i.e. `examplePost.json` file, in the 
`server/private/chatPrograms/posts/` folder. It's optional to add image of post or not. If need to add, the corresponding image have to be saved to  the `public/postImages/` folder, under the name as used in the `imageName`, i.e. `exampleImg.jpg`, tag in the room spec. 

The basic format of a post is as follows:
```json
{
    "title": "Post Title",
    "time": "2024-07-13 20:00", // Year-Month-Day 24 hours time
    "content": "Descrption of the post",
    "imageName": "exampleImg.jpg", // Needs to be consistent with above
    "lead": "Short description to lead the discussion"
}
```
2. Add usernames

In order to create preset usernames, which will be used up from the beginning
of the list for each room, modify/replace the file `nickNames.json` in the 
`server/private/chatPrograms/` folder. The format is as follows:
```json
[
    "user1",
    "user2",
    "user3",
    ...,
    "userN-1",
    "userN"
]
```

3. Add Chatrooms

In order to add a chatroom, create a `exampleChat.json` in the `server/private/chatPrograms/roomSpecs/` folder.

The format is as follows in the example of all possible moderation features,
the usernames must not, but can match the file above. For more examples on 
the moderation features, browse through the different example room spec files 
in the `server/private/chatPrograms/roomSpecs/` folder.

```json
{   
  "roomName": "the online discussion room", // The name of the room
  "startTime": "", // Leave this field empty if you don't want to define a fixed starting time
  "postName": "prompt_test_chat.json", // The post to show
  "duration": 10, // In minutes
  "outboundLink": "https://example_survey.com", // The post-survey link, will display on the checkout page when the discussion ends. If you don't have a post-survey, leave this field empty.
  "botType": "", 
  "comments": [] // Add defined comments here with username, time and content. The comments will be sent out at the defined time during the discussion. The time should be in millionsecond.
}
```

The `botType` is used to control the GPT integration during the discussion. If it is empty, the room will not call GPT API. If it has values, the room will call GPT API and send the GPT response with username as `botType` value during the discussion. 


4. Upload the files to the server, preferably using FTP or Github. Then rebuild and restart the server. Make sure the server is in /srv/chat-room for the nginx setup to work, or do the reverse proxy setup yourself. 
   
   For convenience, a build script is included in the repo, filename: `server_setup_restart.sh`, and can be launched right after forking the project and CHANGING THE REPO URL TO POINT TO THE FORK AND NOT THE OLD, UNMAINTAINED VERSION! 
   To use it, `cd /srv/chat-room` and then `source server_setup_restart.sh`.
    
    See excerpts of the script below for convenience:  
    ```bash
    echo "STARTING SETUP; DELETING CONTENTS OF /srv/chat-room"

    cd /srv
    rm -rf chat-room/*
    rm -rf chat-room/.*
    cd /srv/chat-room

    # CHANGE THIS TO THE RIGHT GITHUB REPOSITORY
    repo_url="https://github.com/YatingPan/chat-room.git" 

    echo "YOU NEED TO USE THE RIGHT REPO URL FOR THIS SCRIPT, CURRENTLY: " $repo_url
    # DON'T FORGET TO CHANGE THIS TO THE NEW REPO
    echo "==============================================================="
    git clone $repo_url .

    npm install
    npm run build

    echo "DONE BUILDING, RESTARTING USING pm2 restart 0 "

    cd /srv
    pm2 restart 0
    ```

5. After uploading the files to the server using FTP or Github, add the room SHA id into the Qualtrics waitingroom, to allow users from Prolific can join the chatrooms.

6. Make sure to add your OpenAI key to call your GPT API in `/srv/chat-room/.env`. This file is added in `/srv/chat-room/.gitignore`.


## Experiment procedure
1. When a participant clicks the customized link in the pre-Qualtrics study. As soon as the first participant enters the Room (i.e. he or she clicks the link and the chatroom page loaded), the startTime of the chatroom is set to the current time. The chatroom records the following 3 parameters for participannt from Prolific:
- ProlificPID: this is the unique ID of a Prolific user;
- StudyID: this is the unique ID of a Prolific study;
- SessionID: this is the unique ID of a Prolific user joining a Prolifi study.
The start time and end time of the chatroom, as well as the nickname of the user in the chatroom, are displayed to the user.
There are 10 seconds countdown on the welcome page.

2. Once the 10 seconds countdown ends, participants are let into the chatroom and see the post and all automated comments, as well as the comments and replies of other participants, and they themselves can comment and reply. They can reply to their own comments, other particpants' comments, automated comments (including predefined comments in the room file, or the bot moderation comments from GPT). 

3. After the study is over, the participants may be presented the post-study suvery, which is the outbound link in the room file. If there is no post-study survey, the expeirment ends. The particpants may need to go back to the platform like Prolific and complete the experiment officially there.

4. If there is a post-survey, the ProlificPID, studyID, sessionID will be recorded and submmited again.

5. After completing the post-survey, participants can copy the completion code and paste back to Prolific, or click the completion link, to officially end the experiment.

6. After the room ends, a log file is generated automatically in `/srv/chat-room/server/private/chatLogs` with room_name_date_time_log_version. The GPT response is automatically written in `/srv/chat-room/server/private/gptResponses` with the room_name_date_time_version. The logs are backed up in `/var/www/logBackup`. 

7. If you want to modify the console log in details during the experiment in terminal, run `pm2 logs` in the terminal.
