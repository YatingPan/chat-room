import { io } from "socket.io-client";
import { writable, Writable } from "svelte/store";
import type { ActionsUpdate, Comment, ProposedComment, ProposedReply, Reply } from "../../types/comment.type"
import type { RoomData } from "../../types/room.type";
import type { UserAssignment, User, AccessInfo, UserExtended } from "../../types/user.type";

import QueryString from "qs";

const userToStorage = (user: UserExtended): string => JSON.stringify(user)
const roomToStorage = (room: RoomData): string => JSON.stringify(room)

const storageToUser = (storedUserData: string): UserExtended => JSON.parse(storedUserData)
const storageToRoom = (storedRoomData: string): RoomData => JSON.parse(storedRoomData)


const socket = io();

const accessCodeStore: Writable<string> = writable()
const commentStore: Writable<Comment> = writable()
const replyStore: Writable<Reply> = writable()
const actionsStore: Writable<ActionsUpdate> = writable()
const userStore: Writable<UserExtended | undefined> = writable(storageToUser(sessionStorage.getItem("userData")))
const roomStore: Writable<RoomData | undefined> = writable()//writable(storageToRoom(sessionStorage.getItem("roomData")))

// Server requests an access code from client
socket.on("requestAccessCode", (arg) => {
	// console.log("Server requested Access code.");

	// Grabbing access code from URL
	const path = window.location.pathname.split("/");
	const accessCode = 2 <= path.length ? path[1] : undefined
	
	// let url_params = QueryString.parse(location.search)
	// const mTurkId = String(url_params['mTurkId'])

	const queryString = window.location.search;
	const url_params = new URLSearchParams(queryString);
	console.log(url_params)
	const mTurkId = url_params.get('mTurkId')
	
	console.log(url_params)
	// // console.log(url_params.mTurkId)
	
	console.log(`My Access code: ${accessCode}, my mTurkId: ${mTurkId}`)

	const storedUserData: UserExtended = storageToUser(sessionStorage.getItem("userData"))
	let accessInfo: AccessInfo = { "accessCode": accessCode, "mTurkId": mTurkId }
	if(storedUserData){
		accessInfo["user"] = storedUserData.user
	}
	// console.log(accessInfo, storedUserData)
	socket.emit("accessInfo", accessInfo)
});

socket.on("userAssignment", (userAssignment: UserAssignment) => {
	// console.log(userAssignment)
	// console.log("Access granted for Room: " + userAssignment.room.name)
	// console.log("userAssignment", userAssignment)

	const user: UserExtended = userAssignment.user
	const room: RoomData = userAssignment.room
	
	// console.log("Assigned User:", user)
	// TODO better login check?
	if (user) {
		sessionStorage.setItem("userData", userToStorage(user))
		userStore.set(user)
	}
	if(room) {
		sessionStorage.setItem("roomData", roomToStorage(room))
		// console.log("recieved roomData")
		roomStore.set(room)
	}
})

socket.on("accessDenied", (data) => {
	// console.log("Access denied. Propably wrong access code.")
})

socket.on("comment", (newComment: Comment) => {
	// console.log("recieved comment", newComment)
	commentStore.set(newComment)
})
socket.on("reply", (newReply: Reply) => {
	// console.log("recieved reply", newReply)
	replyStore.set(newReply)
})
socket.on("actionsUpdate", (newActions: ActionsUpdate) => {
	// console.log("recieved actions", newActions)
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

const sendActionsUpdate= (newActionsUpdate: ActionsUpdate) => {
	// console.log("newActionsUpdate: ", newActionsUpdate)
	socket.emit("broadcastActionsUpdate", newActionsUpdate)
}

export default {
    commentStore,
	replyStore,
	sendComment,
	sendReply,
	sendActionsUpdate,
	actionsStore,
	roomStore,
	userStore
}

