import { io } from "socket.io-client";
import { writable, readable, Writable, Readable } from "svelte/store";
import type { Comment, NewComment } from "../../types/message.type"
import type { UserAssignment, User, AccessInfo, UserExtended, Room } from "../../types/user.type";

const userToStorage = (user: UserExtended): string => JSON.stringify(user)
const roomToStorage = (room: Room): string => JSON.stringify(room)

const storageToUser = (storedUserData: string): UserExtended => JSON.parse(storedUserData)
const storageToRoom = (storedRoomData: string): Room => JSON.parse(storedRoomData)


const socket = io();

const commentStore: Writable<Comment> = writable()
const userStore: Writable<UserExtended | undefined> = writable(storageToUser(sessionStorage.getItem("userData")))
const roomStore: Writable<Room | undefined> = writable(storageToRoom(sessionStorage.getItem("roomData")))

// const chatRoom = readable(null, set => {
//     set()
// })


// Server requests an access code from client
socket.on("requestAccessCode", (arg) => {
	console.log("Server requested Access code.");

	// Grabbing access code from URL
	const urlParams = new URLSearchParams(window.location.search);
	const hasAccessCode = urlParams.has('accessCode');
	const accessCode = hasAccessCode ? urlParams.get("accessCode") : undefined
	console.log(`My Access code: ${accessCode}`)

	const storedUserData: UserExtended = storageToUser(sessionStorage.getItem("userData"))
	let accessInfo: AccessInfo = { "accessCode": encodeURIComponent(accessCode) }
	if(storedUserData){
		accessInfo["user"] = storedUserData.user
	}
	console.log(accessInfo, storedUserData)
	socket.emit("accessInfo", accessInfo)
});

socket.on("checkCron", data => {
	console.log(data)
})
socket.on("userAssignment", (userAssignment: UserAssignment) => {
	console.log(userAssignment)
	console.log("Access granted for Room: " + userAssignment.room.name)
	console.log("userAssignment", userAssignment)

	const user: UserExtended = userAssignment.user
	const room: Room = userAssignment.room
	
	console.log("Assigned User:", user)
	if(user){
		sessionStorage.setItem("userData", userToStorage(user))
		userStore.set(user)
	}
	if(room) {
		sessionStorage.setItem("roomData", roomToStorage(room))
		roomStore.set(room)
	}
})

socket.on("accessDenied", (data) => {
	console.log("Access denied, propably wrong access code")
})

socket.on("comment", (data: Comment) => {
	commentStore.set(data)
})

// function reply() {

// }

const sendComment = (newComment: NewComment) => {
	socket.emit("broadcastComment", newComment)
}

// function like() {

// }


export default {
    commentStore,
	sendComment,
	roomStore,
	userStore
}

