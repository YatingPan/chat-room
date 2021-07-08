<script lang="ts">
	import { Router, Link, Route } from "svelte-routing";
    import { onMount } from "svelte";
    import  store from "./stores/store";
    import type { Comment, NewComment } from "../types/message.type";
    import type { Room, User, UserExtended } from "../types/user.type";
    import moment from "moment"
    import CommentComponent from "./components/comment.svelte";

	// export let url = "";

    let commentText = "";
    let comments: Array<Comment> = [];
    let user: UserExtended;
    let room: Room;

    function onSendComment(e) {
        if( commentText.length > 0) {
            const comObj : NewComment = {
                "user": user.user,
                "content": commentText
            }
            commentText = ""
            console.log("Sending Comment: ", comObj)
            store.sendComment(comObj)
        } else {
            console.log("Not sending comment")
        }
    }

    onMount(() => {
        store.commentStore.subscribe(currentComment => {
            if(currentComment) comments = [... comments, currentComment]
        })

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

	<div id="content">

        <div class="userName">We assigned you the name: {user?.user?.name} and the id: {user?.user?.id}</div>
        <div>
            <h2>Comments:</h2>
            {#each comments as comment, i}
                <CommentComponent comment={comment}/>
            {/each}
        </div>

        <input type="text" bind:value={commentText}>
        <button on:click={onSendComment}>
            Send Comment
        </button>

    </div>

    <div id="footer">
        <span>Chat Room &copy; 2021 </span>
    </div>
   
</main>

<style lang="scss">

@import "vars";

main {
    display: grid;
    width: 100%;
    grid-template-columns: auto;
    grid-template-rows: 5em 2em auto 2em;
    grid-template-areas: 
    "topboard"
    "leuchtreklame"
    "content"
	"footer";
    @media only screen and (max-width: $small-bp) {
        grid-template-columns: auto;
        grid-template-rows: 5em auto 2em;
        grid-template-areas: 
        "topboard"
        "content"
        "footer";
    }
    padding: 0;
    margin: 0;
}

#footer {
    border-top: 2px solid $main-color;
	grid-area: footer;
    font-family: happytimes;
    color: $main-color;
    font-size: 10pt;
    padding: 0.5em;
}

#content{
    grid-area: content;
}

:global(a) {
	text-decoration: none;
}
:global(body) {
	margin: 0;
	padding: 0;
}

  
</style>