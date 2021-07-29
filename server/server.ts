'use strict';
import type { UserAssignment, AccessInfo, User, UserExtended, RoomData } from "../types/user.type"
import type { NewComment, Comment} from "../types/message.type"
import { Rooms } from "./util/room.js";
import { Users } from "./util/users.js";
// import { Posts } from "./util/post.js";

import express from 'express';
import path from 'path';
import http from "http";
import { Server } from "socket.io";

const app = express();


const port = process.env.PORT || 5000;
const server = http.createServer(app)
const io = new Server(server);

const __dirname =  path.join(path.resolve(), "server");
const publicDir = path.join(__dirname, "../public");
console.log(publicDir)
const privateDir = path.join(__dirname, "private");

app.use(express.static(publicDir));

let userId = 0;
let commentID = 0;
let comments: Comment[] = []

// page to display the available chatroom access links
app.get('/secret', async function (req, res, next) {
  console.log('Accessing the secret section ...')
  const availableRooms = await Rooms.getAvailableRooms()
  console.log(availableRooms)

  const html = availableRooms.map(function(hashAndFileName) {
    const [hash, fileName] = hashAndFileName;
    return `<li>${fileName} -> ${hash}</li>`
  }).join("");
  
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
    const assignedChatRoom = await Rooms.getAssignedChatRoom(accessInfo.accessCode)

    if (assignedChatRoom) {

      const newUser: UserExtended = await Users.userJoin(accessInfo, socket.id)
      const room: RoomData = await Rooms.getRoomData(assignedChatRoom)
      
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
    const currentUser: UserExtended = Users.getUserFromID(proposedComment.user.id)
    const newComment: Comment = {
      id: commentID++,
      content: proposedComment.content,
      user: proposedComment.user,
      time: new Date(),
      likes: 0,
      dislikes: 0
    }
    comments = [... comments, newComment]
    io.to(currentUser.accessCode).emit('comment', newComment)
    console.log(newComment)
  })
  socket.on("disconnect", () => {
    io.emit('userDisconnect', "A user has left the chat")
  })
})

const test = async () => {
  Rooms.registerAutomaticMessages(io)
  //console.log(await loadChatrooms())
}
test()
//startCron()