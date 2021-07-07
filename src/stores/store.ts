import { io } from "socket.io-client";
import { writable, readable } from "svelte/store";

const time = readable(null, set => {
	set(new Date());

	const interval = setInterval(() => {
		set(new Date());
	}, 1000);

	return () => clearInterval(interval);
});

const commentStore = writable("")
// const chatRoom = readable(null, set => {
//     set()
// })

const socket = io();


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
socket.on("message", (arg) => {
  console.log(arg); // world
});

// function reply() {

// }

// function comment() {

// }

// function like() {

// }

// socket.on('messages', messages => {
// 	app.set({
// 	  messages
// 	});
// });

  // app.on('submitForm', () => {
  // 	const { newMessage, username } = app.get();
  // 	socket.emit('newMessage', {
  // 	  text: newMessage,
  // 	  author: username
  // 	});
  // 	app.set({ newMessage: '' });
  //   });
	
  //   app.on('setUsername', () => {
  // 	app.set({ username: document.getElementById('enter-username').value });
  //   });

export default {
    subscribe: commentStore.subscribe 
}

