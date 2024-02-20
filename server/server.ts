'use strict';
import type { UserAssignment, AccessInfo, User, UserExtended } from "../types/user.type"
import type {ActionsUpdate, ProposedComment, ProposedReply, Reply} from "../types/comment.type"
import { Rooms } from "./util/room.js";
import { Users } from "./util/users.js";
import { Chats } from "./util/chat.js";
import {Logs} from "./util/logs.js";

import cors from 'cors';

import express from 'express';
import path from 'path';
import http from "http";
import { Server } from "socket.io";
import type { RoomData } from "../types/room.type";
import type{Comment} from "../types/comment.type";
import type{Log} from "../types/room.type";
// import type{LoggedComment} from "../types/comment.type";


const app = express();

app.use(cors());

const port = process.env.PORT || 5000;
const server = http.createServer(app)

// Configure Socket.IO with CORS options
const io = new Server(server, {
  cors: {
    origin: "https://ipz.qualtrics.com",
    methods: ["GET", "POST", "PUT"],
    credentials: true
  }
});

const __dirname =  path.join(path.resolve(), "server");
const publicDir = path.join(__dirname, "../public");
console.log(publicDir)
const privateDir = path.join(__dirname, "private");
// export let allComments: Array<Comment> = [];

app.use(express.static(publicDir));

let waitingRoomUsers = 0;
let timeoutHandle: NodeJS.Timeout | null = null;

const waitingRoomThreshold = 2; // Minimum users required to proceed, should be 5, here 2 is for test

// set the max waiting time to 2 minutes
const waitingRoomDuration = 120000;

//function checkAndHandleWaitingRoom() {
//  if (waitingRoomUsers >= waitingRoomThreshold) {
    // if waiting room has 5 users, send "Proceed" to Qualtrics to set proceedMeet to true, and show "Redirect" block 
//    io.emit('message', 'Proceed');
//    if (timeoutHandle !== null) {
//      clearTimeout(timeoutHandle);
//      timeoutHandle = null;
//    }
//    waitingRoomUsers = 0;
//  } else if (timeoutHandle === null) {
    // if there are less than 5 users in 2 minutes in the waiting room, send "Fail to start" to Qualtrics to set proceedMeet to false, and show "Fail to start" block
//    timeoutHandle = setTimeout(() => {
//      if (waitingRoomUsers < waitingRoomThreshold) {
//        io.emit('message', 'Fail to start');
//      }
//      waitingRoomUsers = 0;
//      timeoutHandle = null;
//    }, waitingRoomDuration);
//  }
//}

// select a chat room URL 
const selectChatRoomURL = () => {
  const chatRooms = [
    "https://discussionroom.org/KkhDj%2Bm3qFXhaYVeG076c%2BkMkE24kW1Sjinni8q9lr4%3D",
    "https://discussionroom.org/p6%2BwHz29x1XWz3ddFY%2FU%2FHwdxXKq6WvAwpUStAKcMRA%3D",
  ];
  const randomIndex = Math.floor(Math.random() * chatRooms.length);
  return chatRooms[randomIndex];
};

// page to display the available chatroom access links
// returns HTML page, not JSON!
app.get('/secret', async function (req, res, next) {
  // console.log('Accessing the secret section ...')
  const availableRooms = await Rooms.getAvailableRooms()
  const html = availableRooms.map(function(hashAndFileName) {
    const [hash, fileName] = hashAndFileName;
    const fullUrl = req.protocol + '://' + req.get('host');
    return `<li>${fileName}: <a href="${fullUrl}/${hash}" target="_blank"> ${hash} </a></li>`
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
  // Increment waiting room user count and check if threshold is met
  console.log("A user has connected")
  waitingRoomUsers++;
  
  if (waitingRoomUsers >= waitingRoomThreshold) {
    if (timeoutHandle) {
        clearTimeout(timeoutHandle);
        timeoutHandle = null;
    }
    const chatRoomURL = selectChatRoomURL();
    io.emit('chatRoomURL', chatRoomURL);
    console.log(`Chat room URL: ${chatRoomURL}`);
    waitingRoomUsers = 0;
    } else if (timeoutHandle === null) {
        timeoutHandle = setTimeout(() => {
            if (waitingRoomUsers < waitingRoomThreshold) {
            io.emit('message', 'Fail to start');
            }
            waitingRoomUsers = 0;
            timeoutHandle = null;
        }, waitingRoomDuration);
        }
  
  io.to(socket.id).emit("requestAccessCode");

  socket.on("accessInfo", async (accessInfo: AccessInfo) => {
    const assignedChatRoom = await Rooms.getAssignedChatRoom(accessInfo.accessCode)

    if (assignedChatRoom) {

      const room: RoomData = await Rooms.getStaticRoomData(accessInfo.accessCode)
      const newUser: UserExtended = await Users.userJoin(accessInfo, socket.id)
      let fullLog: Log = Logs.returnLog()[room.id]
      let allReplies: Reply[] = Logs.returnRawReplies()
      let actions:ActionsUpdate[] = Logs.returnAction()
      let comments: Comment[] = fullLog.originalComments
      const userAssignment: UserAssignment = {
        "room": room,
        "user": newUser,
        "logs": comments,
        "replies": allReplies,
        "actions": actions
      }

      socket.join(accessInfo.accessCode)
      // console.log(userAssignment)
      // console.log(`${newUser.user.name} with id ${newUser.user.id} has joined the chatroom: ${assignedChatRoom}`)
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
    // console.log(proposedReply)
    const sendingUser: UserExtended = Users.getUserFromID(proposedReply.comment.user.id)
    
    Chats.broadcastReply(proposedReply, sendingUser, io)
  })
  socket.on("broadcastActionsUpdate", (proposedActionsUpdate: ActionsUpdate) => {
    // console.log(proposedActionsUpdate)
    const sendingUser: UserExtended = Users.getUserFromID(proposedActionsUpdate.senderID)
    
    Chats.broadcastActionsUpdate(proposedActionsUpdate, sendingUser, io)
  })

/*  socket.on("addComment",(tempComment : Comment) => {
    allComments = [... allComments, tempComment]
    console.log("#### addComment.ts allComments",allComments)
    // socket.emit("updateComments", allComments)
  })
  */
  socket.on("disconnect", () => {
    waitingRoomUsers--; // Decrement user count on disconnect
    io.emit('userDisconnect', "A user has left the chat");
    waitingRoomUsers = Math.max(0, waitingRoomUsers - 1)
})
})