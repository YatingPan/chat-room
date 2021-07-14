import { io } from "socket.io-client";
import { writable } from "svelte/store";
const userToStorage = (user) => JSON.stringify(user);
const roomToStorage = (room) => JSON.stringify(room);
const storageToUser = (storedUserData) => JSON.parse(storedUserData);
const storageToRoom = (storedRoomData) => JSON.parse(storedRoomData);
const socket = io();
const commentStore = writable();
const userStore = writable(storageToUser(sessionStorage.getItem("userData")));
const roomStore = writable(storageToRoom(sessionStorage.getItem("roomData")));
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
socket.on("checkCron", data => {
    console.log(data);
});
socket.on("userAssignment", (userAssignment) => {
    console.log(userAssignment);
    console.log("Access granted for Room: " + userAssignment.room.name);
    console.log("userAssignment", userAssignment);
    const user = userAssignment.user;
    const room = userAssignment.room;
    console.log("Assigned User:", user);
    if (user) {
        sessionStorage.setItem("userData", userToStorage(user));
        userStore.set(user);
    }
    if (room) {
        sessionStorage.setItem("roomData", roomToStorage(room));
        roomStore.set(room);
    }
});
socket.on("accessDenied", (data) => {
    console.log("Access denied, propably wrong access code");
});
socket.on("comment", (data) => {
    console.log("recieved comment", data);
    commentStore.set(data);
});
// function reply() {
// }
const sendComment = (newComment) => {
    socket.emit("broadcastComment", newComment);
};
// function like() {
// }
export default {
    commentStore,
    sendComment,
    roomStore,
    userStore
};
//# sourceMappingURL=store.js.map