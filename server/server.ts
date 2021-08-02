'use strict';
import type { UserAssignment, AccessInfo, User, UserExtended } from "../types/user.type"
import type { Comment, Like, ProposedComment, ProposedReply, RevokeLike} from "../types/comment.type"
import { Rooms } from "./util/room.js";
import { Users } from "./util/users.js";
import { Chats } from "./util/chat.js";

import express from 'express';
import path from 'path';
import http from "http";
import { Server } from "socket.io";
import type { RoomData } from "../types/room.type";

const app = express();


const port = process.env.PORT || 5000;
const server = http.createServer(app)
const io = new Server(server);

const __dirname =  path.join(path.resolve(), "server");
const publicDir = path.join(__dirname, "../public");
console.log(publicDir)
const privateDir = path.join(__dirname, "private");

app.use(express.static(publicDir));

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
  io.to(socket.id).emit("requestAccessCode");
  
  socket.on("accessInfo", async (accessInfo: AccessInfo) => {
    const assignedChatRoom = await Rooms.getAssignedChatRoom(accessInfo.accessCode)

    if (assignedChatRoom) {

      const newUser: UserExtended = await Users.userJoin(accessInfo, socket.id)
      const room: RoomData = await Rooms.getStaticRoomData(accessInfo.accessCode)
      
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

  socket.on("broadcastComment", (proposedComment: ProposedComment) => {
    const sendingUser: UserExtended = Users.getUserFromID(proposedComment.user.id)
    
    Chats.broadcastComment(proposedComment, sendingUser, io)
  })
  socket.on("broadcastReply", (proposedReply: ProposedReply) => {
    console.log(proposedReply)
    const sendingUser: UserExtended = Users.getUserFromID(proposedReply.comment.user.id)
    
    Chats.broadcastReply(proposedReply, sendingUser, io)
  })
  socket.on("broadcastLike", (proposedLike: Like) => {
    console.log(proposedLike)
    const sendingUser: UserExtended = Users.getUserFromID(proposedLike.userID)
    
    Chats.broadcastLike(proposedLike, sendingUser, io)
  })
  socket.on("broadcastDislike", (proposedDislike: Like) => {
    console.log(proposedDislike)
    const sendingUser: UserExtended = Users.getUserFromID(proposedDislike.userID)
    
    Chats.broadcastDislike(proposedDislike, sendingUser, io)
  })
  socket.on("broadcastRevoceLike", (proposedRevokation: RevokeLike) => {
    console.log(proposedRevokation)
    const sendingUser: UserExtended = Users.getUserFromID(proposedRevokation.userID)
    
    Chats.broadcastRevokeLike(proposedRevokation, sendingUser, io)
  })
  socket.on("broadcastRevoceDislike", (proposedRevokation: RevokeLike) => {
    console.log(proposedRevokation)
    const sendingUser: UserExtended = Users.getUserFromID(proposedRevokation.userID)
    
    Chats.broadcastRevokeDislike(proposedRevokation, sendingUser, io)
  })
  
  socket.on("disconnect", () => {
    io.emit('userDisconnect', "A user has left the chat")
  })
})

// const test = async () => {
//   Rooms.registerAutomaticMessages(io)
//   //console.log(await loadChatrooms())
// }
// test()
//startCron()


