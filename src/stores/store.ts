import { io } from "socket.io-client";
import { writable, Writable } from "svelte/store";
import type { ActionsUpdate, Comment, ProposedComment, ProposedReply, Reply } from "../../types/comment.type"
import type { RoomData } from "../../types/room.type";
import type { UserAssignment, User, AccessInfo, UserExtended } from "../../types/user.type";

import QueryString from "qs";
import type{LoggedComment} from "../../types/comment.type";

const userToStorage = (user: UserExtended): string => JSON.stringify(user)
const roomToStorage = (room: RoomData): string => JSON.stringify(room)
const commentToStorage = (comment:Comment): string => JSON.stringify(comment)

const storageToUser = (storedUserData: string): UserExtended => JSON.parse(storedUserData)
const storageToRoom = (storedRoomData: string): RoomData => JSON.parse(storedRoomData)
const storageToComment = (storedCommentData: string): Comment => JSON.parse(storedCommentData)


const socket = io();

const accessCodeStore: Writable<string> = writable()
const commentStore: Writable<Comment| undefined> = writable(storageToComment(sessionStorage.getItem("userData")))
const commentsStore: Writable<Comment[]> = writable()
const replyStore: Writable<Reply> = writable()
const repliesStore: Writable<Reply[]> = writable()
const actionsStore: Writable<ActionsUpdate> = writable()
const allActionsStore: Writable<ActionsUpdate[]> = writable()
const userStore: Writable<UserExtended | undefined> = writable(storageToUser(sessionStorage.getItem("userData")))
const roomStore: Writable<RoomData | undefined> = writable()//writable(storageToRoom(sessionStorage.getItem("roomData")))
let tempComments: Array<Comment> = [];

// Server requests an access code from client
socket.on("requestAccessCode", (arg) => {
	// console.log("Server requested Access code.");

	// Grabbing access code from URL
	const path = window.location.pathname.split("/");
	const accessCode = 2 <= path.length ? path[1] : undefined

	if (!accessCode) {
		console.error("Access code not found in URL.");
		return;
	  }
	
	// let url_params = QueryString.parse(location.search)
	// const mTurkId = String(url_params['mTurkId'])

	const queryString = window.location.search;
	const url_params = new URLSearchParams(queryString);
	//const mTurkId = url_params.get('mTurkId')
	//const hitId = url_params.get("hitId")
	//const assignmentId = url_params.get("assignmentId")
	//console.log(url_params)
	//console.log(url_params.mTurkId)
	
	// console.log(`My Access code: ${accessCode}, my mTurkId: ${mTurkId}, hitId: ${hitId}, assignmentId: ${assignmentId}`)

	//const storedUserData: UserExtended = storageToUser(sessionStorage.getItem("userData"))
	//let accessInfo: AccessInfo = { "accessCode": accessCode, "mTurkId": mTurkId, "assignmentId": assignmentId, "hitId": hitId }
	//if(storedUserData){
		//accessInfo["user"] = storedUserData.user
	//}
	// console.log(accessInfo, storedUserData)
	//socket.emit("accessInfo", accessInfo)
//});

	let accessInfo: AccessInfo = {accessCode};
	const storedUserData: String | null=sessionStorage.getItem("userData");

	if (storedUserData) {
		const storedUser: UserExtended = JSON.parse(storedUserData);
		accessInfo.user = storedUser.user;
	}
	
	socket.emit("accessInfo", accessInfo);
});

socket.on("userAssignment", (userAssignment: UserAssignment) => {
	//const user: UserExtended = userAssignment.user
	//const room: RoomData = userAssignment.room
	const orignalComments:Comment[] = userAssignment.logs
	const allReplies: Reply[] = userAssignment.replies
	const actions: ActionsUpdate[] = userAssignment.actions
	console.log("#####printingh comments in store.ts after socket call")
	console.log(orignalComments)
	console.log("#####printingh allReplies in store.ts after socket call")
	console.log(allReplies)
	console.log("#####printingh actions in store.ts after socket call")
	console.log(actions)
	
	// console.log("Assigned User:", user)
	// TODO better login check?
	//if (user) {
	//	console.log("#####Entering the value in userstore")
	//	sessionStorage.setItem("userData", userToStorage(user))
	//	userStore.set(user)
	//}
	//if(room) {
	//	console.log("#####Entering the value in roomstore")
	//	sessionStorage.setItem("roomData", roomToStorage(room))
	//	roomStore.set(room)
	//}

	if (userAssignment.user) {
		sessionStorage.setItem("userData", JSON.stringify(userAssignment.user));
		userStore.set(userAssignment.user);
	}
	  
	if (userAssignment.room) {
		sessionStorage.setItem("roomData", JSON.stringify(userAssignment.room));
		roomStore.set(userAssignment.room);
	}

	if(orignalComments){
		console.log("#####Entering the value in commentstore")
		// for(var val of orignalComments){
		// 	console.log("Adding to commentstore")
		// 	console.log(val)
		// 	let temp_val = commentToStorage(val)
		// 	temp_val = temp_val.replace("hoi","hola")
		// 	sessionStorage.setItem("commentData",temp_val)
		// 	commentStore.set(storageToComment(temp_val))
		// }
		commentsStore.set(orignalComments)

	}

	if(allReplies){
		console.log("#####Entering the value in replystore")
		repliesStore.set(allReplies)
	}

	if(actions){
		console.log("#####Entering the value in actionsStore")
		allActionsStore.set(actions)
	}
})

socket.on("accessDenied", (data) => {
	// console.log("Access denied. Propably wrong access code.")
})

socket.on("comment", (newComment: Comment) => {
	// console.log("recieved comment", newComment)
	// tempComments = [... tempComments, newComment]
	console.log("#### calling socket add comment")
	// socket.emit("addComment", newComment)
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

socket.on("updateComments", (tempComment:Array<Comment>) => {
	tempComments = tempComment
	console.log("After update tempComments", tempComments)
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
	commentsStore,
	replyStore,
	repliesStore,
	sendComment,
	sendReply,
	sendActionsUpdate,
	actionsStore,
	allActionsStore,
	roomStore,
	userStore,
	tempComments
}

