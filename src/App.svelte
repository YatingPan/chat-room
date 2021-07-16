<script lang="ts">
	import { Router, Link, Route } from "svelte-routing";
    import { onMount } from "svelte";
    import  store from "./stores/store";
    import type { Comment, NewComment } from "../types/message.type";
    import type { Room, User, UserExtended } from "../types/user.type";
    import ChatRoom from "./components/chatRoom.svelte";
    import Post from "./components/post.svelte";

	// export let url = "";
    let user: UserExtended;
    let room: Room;

   
    onMount(() => {

        store.userStore.subscribe(userData => {
            user = userData
        })

        store.roomStore.subscribe((roomData: Room) => {
            room = roomData
        })
    })
    
</script>
<main>
    <div id="topboard">
        Welcome to {room?.name}
    </div>

	<div class="content">
        
        <!-- <div class="userName">We assigned you the name: {user?.user?.name} and the id: {user?.user?.id}</div> -->
        <div class="postContainer">
            <Post></Post>
        </div>
        <div class="chatRoomContainer">
            <ChatRoom user={user} />
        </div>

    </div>

    <div id="footer">
        <span>Chat Room &copy; 2021 </span>
    </div>
   
</main>

<style lang="scss">

@import "vars";

.content{
    
    .postContainer {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
    }
    .chatRoomContainer {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
    }
}
:global(a) {
    text-decoration: none;
}
:global(body) { 
    margin: 0;
    padding: 0;
}

  
</style>