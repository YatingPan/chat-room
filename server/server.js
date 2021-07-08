'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
var room_1 = require("./util/room");
var express = require('express');
var app = express();
var port = process.env.PORT || 5000;
var path = require('path');
var http = require("http");
var Server = require("socket.io").Server;
var server = http.createServer(app);
var io = new Server(server);
var _a = require("./util/users"), userJoin = _a.userJoin, getUserFromID = _a.getUserFromID;
var publicDir = path.join(__dirname, "../public");
var privateDir = path.join(__dirname, "private");
app.use(express.static(publicDir));
var userId = 0;
var commentID = 0;
var comments = [];
// page to display the available chatroom access links
app.get('/secret', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var availableRooms, html;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Accessing the secret section ...');
                    return [4 /*yield*/, room_1.getAvailableRooms()];
                case 1:
                    availableRooms = _a.sent();
                    console.log(availableRooms);
                    html = availableRooms.map(function (hashAndFileName) {
                        var hash = hashAndFileName[0], fileName = hashAndFileName[1];
                        return "<li>" + fileName + " -> " + hash + "</li>";
                    }).join("");
                    res.write("\n    <!DOCTYPE html>\n    <body>\n      <div id=\"linkList\">\n        <ul>\n          " + html + "\n        </ul>\n      </div>\n    </body>\n  ");
                    res.end();
                    return [2 /*return*/];
            }
        });
    });
});
// Every other link is resolved to the svelte application
app.get('*', function (req, res) {
    res.sendFile(path.resolve(publicDir, 'index.html'));
});
server.listen(port, function () {
    console.log("Server is up at port " + port);
});
// run when client connects
io.on("connection", function (socket) {
    console.log("New websocket connection");
    io.to(socket.id).emit("requestAccessCode", "");
    socket.on("accessInfo", function (accessInfo) { return __awaiter(void 0, void 0, void 0, function () {
        var assignedChatRoom, newUser, room, userAssignment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, room_1.getAssignedChatRoom(accessInfo.accessCode)];
                case 1:
                    assignedChatRoom = _a.sent();
                    if (!assignedChatRoom) return [3 /*break*/, 4];
                    return [4 /*yield*/, userJoin(accessInfo, socket.id)];
                case 2:
                    newUser = _a.sent();
                    return [4 /*yield*/, room_1.getRoomMetaData(assignedChatRoom)];
                case 3:
                    room = _a.sent();
                    userAssignment = {
                        "room": room,
                        "user": newUser
                    };
                    socket.join(accessInfo.accessCode);
                    console.log(userAssignment);
                    console.log(newUser.user.name + " with id " + newUser.user.id + " has joined the chatroom: " + assignedChatRoom);
                    io.to(socket.id).emit("userAssignment", userAssignment);
                    return [3 /*break*/, 5];
                case 4:
                    socket.emit("accessDenied", "accessDenied");
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    socket.on("broadcastComment", function (proposedComment) {
        var currentUser = getUserFromID(proposedComment.user.id);
        var newComment = {
            id: commentID++,
            content: proposedComment.content,
            user: proposedComment.user,
            time: new Date()
        };
        comments = __spreadArray(__spreadArray([], comments), [newComment]);
        io.to(currentUser.accessCode).emit('comment', newComment);
        console.log(newComment);
    });
    socket.on("disconnect", function () {
        io.emit('userDisconnect', "A user has left the chat");
    });
});
