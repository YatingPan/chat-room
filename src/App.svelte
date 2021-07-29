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
        
        <Post></Post>
        <ChatRoom user={user} />

    </div>

    <div id="footer">
        <span>Chat Room &copy; 2021 </span>
    </div>
   
</main>

<style lang="scss">

    @import "vars";

    :global(a) {
        text-decoration: none;
    }
    :global(body) { 
        margin: 0;
        padding: 0;
    }

  
</style>