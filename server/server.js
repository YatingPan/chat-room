
const express = require('express');
const app = express();

var crypto = require('crypto');
const port = process.env.PORT || 5000;
const path = require('path');
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app)
const io = new Server(server);
const fs = require('fs');
// const cors = require('cors');
// app.use(cors());


const publicDir = path.join(__dirname, "../public");
const privateDir = path.join(__dirname, "private");

app.use(express.static(publicDir));

// page to display the available chatroom access links
app.get('/secret', async function (req, res, next) {
  console.log('Accessing the secret section ...')
  const availableHashes = await getAvailableHashes()
  console.log(availableHashes)

  html = Object.keys(availableHashes).map(function(hash, index) {
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

// Access is granted if the access Code is equal to the sha265 hash of a file in the chatPrograms directory
// TODO: not every time fs read
async function getAvailableHashes() {
  const files = await fs.promises.readdir(path.resolve(privateDir, "chatPrograms", "roomSpecs"))
  return files.reduce((a, fileName) => {
    hash = encodeURIComponent(crypto.createHash('sha256').update(fileName).digest('base64'))
    return {...a, [hash]: fileName}
  }, {})
}
async function getAssignedChatRoom(accessCode) {
  const availableHashes = await getAvailableHashes()
  return availableHashes[accessCode]
}

async function assignUserName() {
  
}

// run when client connects
io.on("connection", socket => {
  console.log("New websocket connection")
  socket.emit("requestAccessCode", "");
  
  socket.on("checkAccessCode", async (accessCode) => {
    assignedChatRoom = await getAssignedChatRoom(accessCode)

    if (assignedChatRoom) {
      console.log("New user in room", assignedChatRoom)
      socket.emit("chatRoomAssignment", {
        "chatRoomName": accessCode,
        "accessGranted": true
      });
    } else {
      socket.emit("chatRoomAssignment", {
        "chatRoomName": accessCode,
        "accessGranted": false
      });
    }
  })
  socket.on("broadcastComment", (comment) => {
    io.emit('comment', comment)
    console.log(comment)
  })
  socket.on("disconnect", () => {
    io.emit('userDisconnect', "A user has left the chat")
  })
})

// io.on()
// // server-side
// // io.on("connection", (socket) => {
// //   socket.emit("hello", "world");
// // });


// // expressApp.get("*", function(req, res) {
// //   const { html } = expressApp.render({ url: req.url });
// //   res.write(`
// //     <!DOCTYPE html>
// //     <link rel='stylesheet' href='/global.css'>
// //     <link rel='stylesheet' href='/bundle.css'>
// //     <div id="app">${html}</div>
// //     <script src="/bundle.js"></script>
// //   `);

// //   res.end();
// // });

