import { io } from "socket.io-client";
import { writable, readable, Writable, Readable } from "svelte/store";
import type { ActionsUpdate, Comment, Like, ProposedComment, ProposedReply, Reply, RevokeLike } from "../../types/comment.type"
import type { RoomData } from "../../types/room.type";
import type { UserAssignment, User, AccessInfo, UserExtended } from "../../types/user.type";

const userToStorage = (user: UserExtended): string => JSON.stringify(user)
const roomToStorage = (room: RoomData): string => JSON.stringify(room)

const storageToUser = (storedUserData: string): UserExtended => JSON.parse(storedUserData)
const storageToRoom = (storedRoomData: string): RoomData => JSON.parse(storedRoomData)


const socket = io();

const commentStore: Writable<Comment> = writable()
const replyStore: Writable<Reply> = writable()
const actionsStore: Writable<ActionsUpdate> = writable()
const userStore: Writable<UserExtended | undefined> = writable(storageToUser(sessionStorage.getItem("userData")))
const roomStore: Writable<RoomData | undefined> = writable()//writable(storageToRoom(sessionStorage.getItem("roomData")))

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

socket.on("userAssignment", (userAssignment: UserAssignment) => {
	console.log(userAssignment)
	console.log("Access granted for Room: " + userAssignment.room.name)
	console.log("userAssignment", userAssignment)

	const user: UserExtended = userAssignment.user
	const room: RoomData = userAssignment.room
	
	console.log("Assigned User:", user)
	// TODO better login check?
	if (user) {
		sessionStorage.setItem("userData", userToStorage(user))
		userStore.set(user)
	}
	if(room) {
		sessionStorage.setItem("roomData", roomToStorage(room))
		console.log("recieved roomData")
		roomStore.set(room)
	}
})

socket.on("accessDenied", (data) => {
	console.log("Access denied. Propably wrong access code.")
})

socket.on("comment", (newComment: Comment) => {
	console.log("recieved comment", newComment)
	commentStore.set(newComment)
})
socket.on("reply", (newReply: Reply) => {
	console.log("recieved reply", newReply)
	replyStore.set(newReply)
})
socket.on("actionsUpdate", (newActions: ActionsUpdate) => {
	console.log("recieved actions", newActions)
	actionsStore.set(newActions)
})

// function reply() {

// }

const sendComment = (newComment: ProposedComment) => {
	socket.emit("broadcastComment", newComment)
}

const sendReply = (newReply: ProposedReply) => {
	socket.emit("broadcastReply", newReply)
}

const sendLike= (newLike: Like) => {
	socket.emit("broadcastLike", newLike)
}
const sendDislike= (newDislike: Like) => {
	socket.emit("broadcastDislike", newDislike)
}

const sendRevokeLike = (newLike: RevokeLike) => {
	socket.emit("broadcastRevoceLike", newLike)
}
const sendRevokeDislike = (newDislike: RevokeLike) => {
	socket.emit("broadcastRevoceDislike", newDislike)
}

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
}

