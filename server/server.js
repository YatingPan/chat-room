'use strict';
import { Rooms } from "./util/room.js";
import { Users } from "./util/users.js";
import { Chats } from "./util/chat.js";
import express from 'express';
import path from 'path';
import http from "http";
import { Server } from "socket.io";
const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server);
const __dirname = path.join(path.resolve(), "server");
const publicDir = path.join(__dirname, "../public");
console.log(publicDir);
const privateDir = path.join(__dirname, "private");
app.use(express.static(publicDir));
// page to display the available chatroom access links
app.get('/secret', async function (req, res, next) {
    console.log('Accessing the secret section ...');
    const availableRooms = await Rooms.getAvailableRooms();
    console.log(availableRooms);
    const html = availableRooms.map(function (hashAndFileName) {
        const [hash, fileName] = hashAndFileName;
        return `<li>${fileName} -> ${hash}</li>`;
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
// run when client connects
io.on("connection", socket => {
    io.to(socket.id).emit("requestAccessCode");
    socket.on("accessInfo", async (accessInfo) => {
        const assignedChatRoom = await Rooms.getAssignedChatRoom(accessInfo.accessCode);
        if (assignedChatRoom) {
            const newUser = await Users.userJoin(accessInfo, socket.id);
            const room = await Rooms.getStaticRoomData(accessInfo.accessCode);
            const userAssignment = {
                "room": room,
                "user": newUser
            };
            socket.join(accessInfo.accessCode);
            console.log(userAssignment);
            console.log(`${newUser.user.name} with id ${newUser.user.id} has joined the chatroom: ${assignedChatRoom}`);
            io.to(socket.id).emit("userAssignment", userAssignment);
        }
        else {
            socket.emit("accessDenied", "accessDenied");
        }
    });
    socket.on("broadcastComment", (proposedComment) => {
        const sendingUser = Users.getUserFromID(proposedComment.user.id);
        Chats.broadcastComment(proposedComment, sendingUser, io);
    });
    socket.on("broadcastReply", (proposedReply) => {
        console.log(proposedReply);
        const sendingUser = Users.getUserFromID(proposedReply.comment.user.id);
        Chats.broadcastReply(proposedReply, sendingUser, io);
    });
    socket.on("broadcastLike", (proposedLike) => {
        console.log(proposedLike);
        const sendingUser = Users.getUserFromID(proposedLike.userID);
        Chats.broadcastLike(proposedLike, sendingUser, io);
    });
    socket.on("broadcastDislike", (proposedDislike) => {
        console.log(proposedDislike);
        const sendingUser = Users.getUserFromID(proposedDislike.userID);
        Chats.broadcastDislike(proposedDislike, sendingUser, io);
    });
    socket.on("broadcastRevoceLike", (proposedRevokation) => {
        console.log(proposedRevokation);
        const sendingUser = Users.getUserFromID(proposedRevokation.userID);
        Chats.broadcastRevokeLike(proposedRevokation, sendingUser, io);
    });
    socket.on("broadcastRevoceDislike", (proposedRevokation) => {
        console.log(proposedRevokation);
        const sendingUser = Users.getUserFromID(proposedRevokation.userID);
        Chats.broadcastRevokeDislike(proposedRevokation, sendingUser, io);
    });
    socket.on("disconnect", () => {
        io.emit('userDisconnect', "A user has left the chat");
    });
});
//# sourceMappingURL=server.js.map