<script lang="ts">
    import type { Comment, NewComment } from "../../types/message.type"
    import type { User, UserExtended } from "../../types/user.type";

    import CommentComponent from "./comment.svelte"
    import { onMount } from "svelte";
    import  store from "../stores/store";

    export let user: UserExtended;

    let comments: Array<Comment> = [];
    let commentText: string = "";
    
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
    })
</script>

<div class="container">
    <div class="commentDisplay">
        {#each comments as comment, i}
            <CommentComponent comment={comment} myComment={comment.user.id === user.user.id}/>
        {/each}
    </div>

    <div class="newCommentField">
        <input type="text" bind:value={commentText}>
        <button on:click={onSendComment}>
            Send Comment
        </button>
    </div>
</div>

<style lang="scss">
    @import "src/vars";

    .commentDisplay {
        min-height: 20em;
    }
    .container {
        border: solid black 2px;
        border-top: 0;
        width: 90%;
        min-height: 50vh;

        display: grid;
        
        .newCommentField {
            display: flex;
            flex-direction: row;

            input {
                width: 80%;
                height: 100%;
            }
            button {
                width: 20%;
            }
        }
    }
</style>