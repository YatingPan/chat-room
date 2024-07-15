'use strict';
import type { UserAssignment, AccessInfo, UserExtended } from "../types/user.type";
import type { ActionsUpdate, ProposedComment, LoggedComment, ProposedReply, Reply } from "../types/comment.type";
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
import moment from "moment";
import fs from 'fs';

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

  // Helper function to convert LoggedComment to Comment
  function loggedCommentToComment(loggedComment: LoggedComment): Comment {
    return {
        id: loggedComment.id,
        time: new Date(loggedComment.time),
        user: {
            id: loggedComment.userName,
            name: loggedComment.userName,
            prolificPid: null,
            sessionId: null,
            studyId: null
        },
        content: loggedComment.content
      };
    }

    socket.on("accessInfo", async (accessInfo) => {
      try {
        const assignedChatRoom = await Rooms.getAssignedChatRoom(accessInfo.accessCode);
        console.log("accessInfo", accessInfo);
        console.log("assignedChatRoom", assignedChatRoom);

        if (assignedChatRoom) {
          const room = await Rooms.getStaticRoomData(accessInfo.accessCode, io);
          const newUser = await Users.userJoin(accessInfo, socket.id);
          let fullLog = Logs.returnLog()[room.id] || { comments: [] };
          let allReplies = Logs.returnRawReplies();
          let actions = Logs.returnAction();

          let comments = fullLog.comments.map(loggedCommentToComment);

          const userAssignment = {
            room,
            user: newUser,
            logs: comments,
            replies: allReplies,
            actions: actions
          };

          socket.join(accessInfo.accessCode);
          console.log(userAssignment);
          console.log(`${newUser.user.name} with id ${newUser.user.id} has joined the chatroom: ${assignedChatRoom}`);
          io.to(socket.id).emit("userAssignment", userAssignment);

          console.log("The bot type is", room.botType);
        } else {
          socket.emit("accessDenied", "accessDenied");
        }
      } catch (error) {
        console.error(error);
        socket.emit("accessDenied", "accessDenied");
      }
    }
  );

  socket.on("broadcastComment", (proposedComment) => {
    const sendingUser = Users.getUserFromID(proposedComment.user.id);
    console.log("User", sendingUser, "proposedComment", proposedComment);

    Chats.broadcastComment(proposedComment, sendingUser, io);
    console.log("broadcastComment");
  });

  socket.on("broadcastReply", (proposedReply) => {
    const sendingUser = Users.getUserFromID(proposedReply.comment.user.id);
    console.log("User", sendingUser, "proposedReply", proposedReply);

    Chats.broadcastReply(proposedReply, sendingUser, io);
    console.log("broadcastReply");
  });

  socket.on("broadcastActionsUpdate", (proposedActionsUpdate) => {
    const sendingUser = Users.getUserFromID(proposedActionsUpdate.senderID);

    Chats.broadcastActionsUpdate(proposedActionsUpdate, sendingUser, io);
  });

  socket.on("disconnect", () => {
    io.emit('userDisconnect', "A user has left the chat");
  });
});
