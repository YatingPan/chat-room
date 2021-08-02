import { io } from "socket.io-client";
import { writable } from "svelte/store";
const userToStorage = (user) => JSON.stringify(user);
const roomToStorage = (room) => JSON.stringify(room);
const storageToUser = (storedUserData) => JSON.parse(storedUserData);
const storageToRoom = (storedRoomData) => JSON.parse(storedRoomData);
const socket = io();
const commentStore = writable();
const replyStore = writable();
const actionsStore = writable();
const userStore = writable(storageToUser(sessionStorage.getItem("userData")));
const roomStore = writable(); //writable(storageToRoom(sessionStorage.getItem("roomData")))
// const chatRoom = readable(null, set => {
//     set()
// })
// Server requests an access code from client
socket.on("requestAccessCode", (arg) => {
    console.log("Server requested Access code.");
    // Grabbing access code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const hasAccessCode = urlParams.has('accessCode');
    const accessCode = hasAccessCode ? urlParams.get("accessCode") : undefined;
    console.log(`My Access code: ${accessCode}`);
    const storedUserData = storageToUser(sessionStorage.getItem("userData"));
    let accessInfo = { "accessCode": encodeURIComponent(accessCode) };
    if (storedUserData) {
        accessInfo["user"] = storedUserData.user;
    }
    console.log(accessInfo, storedUserData);
    socket.emit("accessInfo", accessInfo);
});
socket.on("userAssignment", (userAssignment) => {
    console.log(userAssignment);
    console.log("Access granted for Room: " + userAssignment.room.name);
    console.log("userAssignment", userAssignment);
    const user = userAssignment.user;
    const room = userAssignment.room;
    console.log("Assigned User:", user);
    // TODO better login check?
    if (user) {
        sessionStorage.setItem("userData", userToStorage(user));
        userStore.set(user);
    }
    if (room) {
        sessionStorage.setItem("roomData", roomToStorage(room));
        console.log("recieved roomData");
        roomStore.set(room);
    }
});
socket.on("accessDenied", (data) => {
    console.log("Access denied. Propably wrong access code.");
});
socket.on("comment", (newComment) => {
    console.log("recieved comment", newComment);
    commentStore.set(newComment);
});
socket.on("reply", (newReply) => {
    console.log("recieved reply", newReply);
    replyStore.set(newReply);
});
socket.on("actionsUpdate", (newActions) => {
    console.log("recieved actions", newActions);
    actionsStore.set(newActions);
});
// function reply() {
// }
const sendComment = (newComment) => {
    socket.emit("broadcastComment", newComment);
};
const sendReply = (newReply) => {
    socket.emit("broadcastReply", newReply);
};
const sendLike = (newLike) => {
    socket.emit("broadcastLike", newLike);
};
const sendDislike = (newDislike) => {
    socket.emit("broadcastDislike", newDislike);
};
const sendRevokeLike = (newLike) => {
    socket.emit("broadcastRevoceLike", newLike);
};
const sendRevokeDislike = (newDislike) => {
    socket.emit("broadcastRevoceDislike", newDislike);
};
export default {
    commentStore,
    replyStore,
    sendComment,
    sendReply,
    sendLike,
    sendRevokeLike,
    sendDislike,
    sendRevokeDislike,
    actionsStore,
    roomStore,
    userStore
};
//# sourceMappingURL=store.js.map