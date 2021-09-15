# Chat Moderation Research
A chat room application for researching chat moderation


## For researchers:
All filenames (`examplePost.json`, `exampleImg.jpg`, `exampleChat.json`) 
can be freely chosen but need to be consistent with the references to said names. Please make sure to be in the UZH network when attempting to upload the files to the respective folders via FTP or Github access.


1. Add posts

In order to add posts, create a `examplePost.json` file in the 
`server/private/chatPrograms/posts/` folder. Furthermore, the corresponding images 
have to be saved to  the `public/postImages/` folder, under the name as used in the 
`imageName`, i.e. `exampleImg.jpg`, tag in the room spec. The format is as follows:
```json
{
    "title": "Post Title",
    "time": "2021-07-13 20:00", // Year-Month-Day 24 hours time
    "content": "Long Description.",
    "imageName": "exampleImg.jpg", // needs to be consistent with above
    "lead": "Short Description.",
    "likes": 4, // number of preset likes and dislikes
    "dislikes": 3
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
    ...
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
    "roomName": "Example Chat Room",
    "startTime": "2021-07-13 20:00",
    "postName": "examplePost.json", // needs to be consistent with above
    "duration": 15, // in minutes
    "outboundLink": "https://example.com/survey",
    "bots": [
        {
            "name": "bot1",
            "moderation": [
                {
                    "type": "ban", // will be banned 100 seconds in
                    "time": 100 // in seconds, relative to the startTime
                }
            ]
        },
        {
            "name": "bot2",
            "moderation": [
                {
                    "type": "ban",
                    "time": -10 // will be marked banned from the beginning
                }
            ]
        }
    ],
    "comments": [
        {
            "userName": "bot1",
            "time":     10,
            "content": "Hello from a user?! in Room 2",
            "moderation": {
                "type": "flag",
                "time":     15
            },
            "replies": [
                {
                    "userName": "bot3",
                    "time":     -100,
                    "content": "asdasd hello"
                }
            ],
            "likes": [
                {
                    "userName": "bot4",
                    "time":     -900
                }
            ],
            "dislikes": [
                {
                    "userName": "bot2",
                    "time":     -900
                }
            ]
        },
        {
            "userName": "bot2",
            "time":     14,
            "content": "Hmmm...",
            "moderation": {
                "type": "remove",
                "time": 30,
                "text": "😃 notifications can be customized! this is the notification of removing the comment by bot2 with content 'Hmmm...'",
                "bgColor": "#009900",
                "textColor": "#fff",
                "textSize": "16px"
            },
            "replies": [
            ],
            "likes": [
            ]
        },
        {
            "userName": "bot2",
            "time":     17,
            "content": "Ciao!",
            "moderation": {
            },
            "replies": [
            ],
            "likes": [
            ]
        }
    ]
}
```

4. Upload the files to the server, preferably using FTP or Github. Then rebuild  and restart the server:
    ```bash
    cd /srv/www/chat-room # get the newest version of all files and server
    git pull
    npm run build
    pm2 restart server
    ```

5. After uploading the files to the server using FTP or Github, distribute the links to the chatrooms to the Mturklers. The toom inks can be retrieved when visiting the `discussionroom.org/secret` endpoint. Make sure to add the Qualtrics options for stylized links, for room with the hash `abcde` like so:
   ```bash
        http://www.discussonroom.org/abcde?&mTurkId=123456 # note that the mTurkId is added after the questionmark, with a leading ampersand. 
        # outbound link (including roomId and mTurkId): https://survey.com/example?&roomId=abcde&mTurkId=123456
   ```
   
## Experiment procedure
1. When a participant clicks the customized link in the previous Qualtrics study, he gets sent to a 'waiting room', in which a button to `Start Chatting` is visible, and only clickable if the chatroom `startTime` is past. There, the mTurkId of the participant is saved alongside the assigned username in the logfile.
    Their username is displayed to them.
2. Once the `Start Chatting` button is pressed, the participants are let into the chatroom and see the post and all automated comments, as well as the comments and likes of other participants, and they themselves can comment and like/dislike. 
3. After the study is over, the participants are presented the followup study using a customized link, so that the mTurkId is again traceable throughout the course of the study.
4. The ids and the respective usernames are logged in the logfile. In the qualtrics survey, another exitcode can be generated or the mTurkId reused for the participants to provide on completing the HIT for the researchers to verify the full study was done for payment.
5. The participant submits the HIT with her mTurkId.
6. The logfile of the chatroom and all actions of the participants within can be retrieved as a JSON file on the server, using FTP or SSH access.
