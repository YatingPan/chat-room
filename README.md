# Chat Moderation Research
A chat room application for researching chat moderation


## For researchers:
All filenames (`examplePost.json`, `exampleImg.jpg`, `exampleChat.json`) 
can be freely chosen but need to be consistent with the references to said names. Please make sure to be in the UZH network when attempting to upload the files to the respective folders via FTP.


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
the usernames must not, but can match the file above.
```json
{   
    "roomName": "Example Chat Room",
    "startTime": "2021-07-13 20:00",
    "postName": "examplePost.json", // needs to be consistent with above
    "duration": 15, // in minutes
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
                "time": 15
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

4. After uploading the files to the server using FTP, distribute the links to the chatrooms to the Mturklers. The links can be retrieved when visiting the `discussionroom.org/secret` endpoint. 
## Experiment procedure
1. When a participant clicks the link, he gets sent to a 'waiting room', in which a button to `Start Chatting` is visible, and only clickable if the chatroom `startTime` is past. 
    Here, their username is displayed to them.
2. Once the `Start Chatting` button is pressed, the participants are let into the chatroom and see the post and all automated posts, as well as the comments and likes of other participants, and they themselves can comment and like/dislike. 
3. After the study is over, the participants are automatically forwarded to the checkout page. On the checkout page, they receive a unique `Exitcode`, as well as a link to the following Qualtrics survey.
4.  These codes and the respective usernames are logged in the logfile. The exitcode can be supplied to the qualtrics survey to track users. _(EITHER BY PARTICIPANTS OR PROGRAMMATICALLY?)_ In the qualtrics survey, another exitcode can be generated or the old one reused for the participants to provide on completing the HIT for the researchers to verify the full study was done for payment.
5.  The participant submits the HIT with her unique exit code.
6.  The logfile of the chatroom and all actions of the participants within can be retrieved as a JSON file on the following endpoint: _LOGFILE_
