'use strict';
import type { UserAssignment, AccessInfo, UserExtended } from "../types/user.type";
import type { ActionsUpdate, ProposedComment, LoggedComment, ProposedReply, Reply } from "../types/comment.type";
import { Rooms } from "./util/room.js";
import { Users } from "./util/users.js";
import { Chats } from "./util/chat.js";
import { Logs } from "./util/logs.js";
import { GPT } from "./util/gpt.js";

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

const activeChatSessions = new Map();

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
      const assignedChatRoom = await Rooms.getAssignedChatRoom(accessInfo.accessCode);
      console.log("accessInfo", accessInfo);
      console.log("assignedChatRoom", assignedChatRoom);

    if (assignedChatRoom) {
      const room = await Rooms.getStaticRoomData(accessInfo.accessCode);
      const newUser = await Users.userJoin(accessInfo, socket.id);
      let fullLog = Logs.returnLog()[room.id];
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

      // Schedule GPT responses only if this is a new session, and the room.botType is "Alex" or "Alex (Moderator)"
      if (!activeChatSessions.has(room.id) && (room.botType == "Alex" || room.botType == "Alex (Moderator)")) {
        scheduleGPTResponses(room.id, newUser);
        console.log(`Scheduled GPT responses for room ID ${room.id}`);
        activeChatSessions.set(room.id, Date.now());
        console.log(`Room ID ${room.id} is now active.`);

        // Reset the active session after 10 minutes
        setTimeout(() => {
          activeChatSessions.delete(room.id);
          console.log(`Room ID ${room.id} is now available for a new session.`);
        }, 10 * 60 * 1000);
      }
    } else {
      socket.emit("accessDenied", "accessDenied");
    }
  });

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

const scheduleGPTResponses = (roomID, user) => {
  const responsesDir = path.join(__dirname, "private", "gptResponses");
  const responseTimers = new Set();

  const getFilenameFromRoomID = (roomID) => {
    const roomMap = {
      "7HZLbSsNFN%2F%2F1N6A3U1JcpTA3l%2B38betm5zj0nE3z0M%3D": "pilot_study_1",
      "Q8N4%2B1cOZjA%2FkkrukolWAjeVsBZRYfhLyF1adDA68JE%3D": "pilot_study_10",
      "PUmAwsVscy0ScltUHLSaVDdqcMyFTO9CCsBE%2BTVZnCs%3D": "pilot_study_11",
      "v1pMhoy36jeLU4I2K%2BTbKzgEeoXTIhpLCAu0SJ55gBA%3D": "pilot_study_2",
      "29pEoP6tZniEzXnw%2F9WuVB1hkw4Lg7ohxE%2BRPAg2L2c%3D": "pilot_study_3",
      "Ii%2FAK3nTxjq7%2BZccEwQAKyakXBECM9IgoXZNMtSLk24%3D": "pilot_study_4",
      "pEnD1fTdbkvf%2BKlv2XGq3PdtfetMjOFM%2BcA008jCHk8%3D": "pilot_study_5",
      "xkOuOeDqHGsLoV7fNI%2BIMv%2FyxXopYkjxpbBkbpdEF9o%3D": "pilot_study_6",
      "U8xy3mGLwGInIbaWBXU8E7kafukrpt6tlMhMP19sKtI%3D": "pilot_study_7",
      "NspUu56Kd0cdk6ieCBz4piqbfd4JY6ibP6V4Ff9bM1U%3D": "pilot_study_8",
      "4wIMLmmzEYhA8O1kgqDtMn1StSSJya3gmxU0T7OqQoE%3D": "pilot_study_9",
      "%2FQgAFOcnKEFLgCu%2FfwkYtHNETfy62Fuk%2F%2FpQiw7STMQ%3D": "piolot_study_12",
    };
    return roomMap[roomID];
  };

  const getLatestResponseFile = async (roomID, version) => {
    const fileName = getFilenameFromRoomID(roomID);
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

  const sendGPTResponse = async (roomID, version, commentIndex) => {
    if (responseTimers.has(`${roomID}_${version}`)) {
      console.log(`GPT response for room ID ${roomID} at version ${version} has already been scheduled.`);
      return;
    }
    responseTimers.add(`${roomID}_${version}`);

    const responseFile = await getLatestResponseFile(roomID, version);
    const roomData = await Rooms.getStaticRoomData(roomID);

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

      Chats.broadcastComment(comment, { ...comment.user, user: comment.user, accessCode: user.accessCode }, io);
      console.log(`Broadcasted GPT response for room ID ${roomID} at version ${version}`);
    } else {
      console.error(`GPT response file not found for room ID ${roomID} at version ${version}`);
    }
  };

  setTimeout(() => sendGPTResponse(roomID, 1, 0), 2 * 60 * 1000 + 10 * 1000); // At 2:10
  setTimeout(() => sendGPTResponse(roomID, 2, 1), 5 * 60 * 1000 + 10 * 1000); // At 5:10
  setTimeout(() => sendGPTResponse(roomID, 3, 2), 8 * 60 * 1000 + 10 * 1000); // At 8:10
};

