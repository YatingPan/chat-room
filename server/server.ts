'use strict';
import type { UserAssignment, AccessInfo, UserExtended } from "../types/user.type";
import type { ActionsUpdate, ProposedComment, ProposedReply, Reply } from "../types/comment.type";
import { Rooms } from "./util/room.js";
import { Users } from "./util/users.js";
import { Chats } from "./util/chat.js";
import { Logs } from "./util/logs.js";

import cors from 'cors';
import express from 'express';
import path from 'path';
import http from "http";
import { Server } from "socket.io";
import type { RoomData } from "../types/room.type";
import type { Comment } from "../types/comment.type";
import type { Log } from "../types/room.type";

const app = express();

app.use(cors());

const port = process.env.PORT || 5001; // change from 5000 to 5001 to run on the subdomain
const server = http.createServer(app);

// Configure Socket.IO with CORS options
const io = new Server(server, {
  cors: {
    origin: ["https://ipz.qualtrics.com", "http://online.discussionroom.org/"],
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  },
});

const __dirname = path.join(path.resolve(), "server");
const publicDir = path.join(__dirname, "../public");
console.log(publicDir);
const privateDir = path.join(__dirname, "private");

app.use(express.static(publicDir));

// Page to display the available chatroom access links
app.get('/secret', async function (req, res, next) {
  const availableRooms = await Rooms.getAvailableRooms();
  const html = availableRooms.map(function (hashAndFileName) {
    const [hash, fileName] = hashAndFileName;
    const fullUrl = req.protocol + '://' + req.get('host');
    return `<li>${fileName}: <a href="${fullUrl}/${hash}" target="_blank"> ${hash} </a></li>`;
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
});

// Every other link is resolved to the svelte application
app.get('*', (req, res) => {
  res.sendFile(path.resolve(publicDir, 'index.html'));
});

server.listen(port, () => {
  console.log(`Server is up at port ${port}`);
});

// Run when client connects
io.on("connection", (socket) => {
  console.log("A user has connected");

  io.to(socket.id).emit("requestAccessCode");

  socket.on("accessInfo", async (accessInfo: AccessInfo) => {
    const assignedChatRoom = await Rooms.getAssignedChatRoom(accessInfo.accessCode);
    console.log("accessInfo", accessInfo);
    console.log("assignedChatRoom", assignedChatRoom);

    if (assignedChatRoom) {
      const room: RoomData = await Rooms.getStaticRoomData(accessInfo.accessCode);
      const newUser: UserExtended = await Users.userJoin(accessInfo, socket.id)
      let fullLog: Log = Logs.returnLog()[room.id];
      let allReplies: Reply[] = Logs.returnRawReplies();
      let actions: ActionsUpdate[] = Logs.returnAction();
      let comments: Comment[] = Logs.returnLog()[room.id].comments;
      const userAssignment: UserAssignment = {
        "room": room,
        "user": newUser,
        "logs": comments,
        "replies": allReplies,
        "actions": actions,
      };

      socket.join(accessInfo.accessCode);
      console.log(userAssignment);
      console.log(`${newUser.user.name} with id ${newUser.user.id} has joined the chatroom: ${assignedChatRoom}`);
      io.to(socket.id).emit("userAssignment", userAssignment);
    } else {
      socket.emit("accessDenied", "accessDenied");
    }
  });

  socket.on("broadcastComment", (proposedComment: ProposedComment) => {
    const sendingUser: UserExtended = Users.getUserFromID(proposedComment.user.id);
    console.log("User", sendingUser, "proposedComment", proposedComment);

    Chats.broadcastComment(proposedComment, sendingUser, io);
    console.log("broadcastComment");
  });

  socket.on("broadcastReply", (proposedReply: ProposedReply) => {
    const sendingUser: UserExtended = Users.getUserFromID(proposedReply.comment.user.id);
    console.log("User", sendingUser, "proposedReply", proposedReply);

    Chats.broadcastReply(proposedReply, sendingUser, io);
    console.log("broadcastReply");
  });

  socket.on("broadcastActionsUpdate", (proposedActionsUpdate: ActionsUpdate) => {
    const sendingUser: UserExtended = Users.getUserFromID(proposedActionsUpdate.senderID);

    Chats.broadcastActionsUpdate(proposedActionsUpdate, sendingUser, io);
  });

  socket.on("disconnect", () => {
    io.emit('userDisconnect', "A user has left the chat");
  });
});
