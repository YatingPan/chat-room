<script lang="ts">
	import { Router, Link, Route } from "svelte-routing";
    import { onMount } from "svelte";
    import  commentStore from "./stores/commentStore";
    import type { Comment, NewComment } from "./types/message.type";

	// export let url = "";

    let comment = ""
    let comments : Array<Comment> = []

    function onSendComment(e) {
        if( comment.length > 0) {
            console.log("Sending Comment: ", comment)
            const comObj : NewComment = {
                "userName": "uuuser",
                "content": comment
            }
            commentStore.sendComment(comObj)
        } else {
            console.log("Not sending comment")
        }
    }

    onMount(() => {
        commentStore.subscribe(currentComment => {
            comments = [... comments, currentComment]
        })
    })
    
</script>
<main>
    <div id="topboard">
       
    </div>

	<div id="content">

        <div>
            <h2>Comments:</h2>
            {#each comments as comment}
                <p> <b>{comment?.userName}</b> -> {comment?.content}</p>
            {/each}
        </div>

        <input type="text" bind:value={comment}>
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