'use strict';
import type { UserAssignment, AccessInfo, User, UserExtended, Room } from "../types/user.type"
import type { NewComment, Comment} from "../types/message.type"
import { getRoomMetaData, getAssignedChatRoom, availableRooms, initRooms } from "./util/room";

const express = require('express');
const app = express();

const port = process.env.PORT || 5000;
const path = require('path');
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app)
const io = new Server(server);

const {userJoin, getUserFromID} = require("./util/users")

const publicDir = path.join(__dirname, "../public");
const privateDir = path.join(__dirname, "private");

app.use(express.static(publicDir));

let userId = 0;
let commentID = 0;
let comments: Comment[] = []

initRooms()

// page to display the available chatroom access links
app.get('/secret', function (req, res, next) {
  console.log('Accessing the secret section ...')
  const availableHashes = availableRooms
  console.log(availableHashes)

  const html = Object.keys(availableHashes).map(function(hash, index) {
    const fileName = availableHashes[hash];
    return `<li>${fileName} -> ${hash}</li>`
  });
  res.write(`
    <!DOCTYPE html>
    <body>
      <div id="linkList">
        <ul>
          ${html}
        </ul>
      </div>
    </body>
  `);
  res.end();
})

// Every other link is resolved to the svelte application
app.get('*', (req, res) => {
   res.sendFile(path.resolve(publicDir, 'index.html'));
});
server.listen(port, () => {
   console.log(`Server is up at port ${port}`);
});

// run when client connects
io.on("connection", socket => {
  console.log("New websocket connection")
  io.to(socket.id).emit("requestAccessCode", "");
  
  socket.on("accessInfo", async (accessInfo: AccessInfo) => {
    const assignedChatRoom = await getAssignedChatRoom(accessInfo.accessCode)

    if (assignedChatRoom) {

      // TODO get chatroom name

      const newUser: UserExtended = await userJoin(accessInfo, socket.id)
      const room: Room = await getRoomMetaData(assignedChatRoom)
      
      const userAssignment: UserAssignment = {
        "room": room,
        "user": newUser
      }

      socket.join(accessInfo.accessCode)
      console.log(userAssignment)
      console.log(`${newUser.user.name} with id ${newUser.user.id} has joined the chatroom: ${assignedChatRoom}`)
      io.to(socket.id).emit("userAssignment", userAssignment)
    } else {
      socket.emit("accessDenied", "accessDenied")
    }
  })

  socket.on("broadcastComment", (proposedComment: NewComment) => {
    const currentUser: UserExtended = getUserFromID(proposedComment.user.id)
    const newComment: Comment = {
      id: commentID++,
      content: proposedComment.content,
      user: proposedComment.user,
      time: new Date()
    }
    comments = [... comments, newComment]
    io.to(currentUser.accessCode).emit('comment', newComment)
    console.log(newComment)
  })
  socket.on("disconnect", () => {
    io.emit('userDisconnect', "A user has left the chat")
  })
})


//startCron()