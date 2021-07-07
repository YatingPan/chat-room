import { io } from "socket.io-client";
import { writable, readable, Writable } from "svelte/store";
import type { Comment } from "../types/message.type"


const socket = io();
const commentStore: Writable<Comment> = writable()

// const chatRoom = readable(null, set => {
//     set()
// })


// client-side
socket.on("requestAccessCode", (arg) => {
	console.log("Server requested Access code.");

	const urlParams = new URLSearchParams(window.location.search);
	const hasAccessCode = urlParams.has('accessCode');
	const accessCode = hasAccessCode ? urlParams.get("accessCode") : undefined

	console.log(`My Access code: ${accessCode}`)
  
	socket.emit("checkAccessCode", encodeURIComponent(accessCode))
});

socket.on("chatRoomAssignment", (data) => {
	if(data.accessGranted) {
		console.log("Access granted for Room: "+data.chatRoomName)

	} else {
		console.log("Access denied, propably wrong access code")
	}
})

socket.on("comment", (data: Comment) => {
	commentStore.set(data)
})

// function reply() {

// }

const sendComment = (commentText) => {
	socket.emit("broadcastComment", commentText)
}

// function like() {

// }


export default {
    subscribe: commentStore.subscribe,
	sendComment
}

