<script lang="ts">
    import type { Comment, NewComment } from "../../types/comment.type"
    import type { User, UserExtended } from "../../types/user.type";

    import CommentComponent from "./comment.svelte"
    import SendCommentComponent from "./sendCommentComponent.svelte"
    import { onMount } from "svelte";
    import  store from "../stores/store";

    export let user: UserExtended;

    let comments: Array<Comment> = [];
    
    onMount(() => {
        store.commentStore.subscribe(currentComment => {
            if(currentComment) comments = [... comments, currentComment]
        })
    })
</script>

<div class="container">

    <div class="center">
        <SendCommentComponent user={user}/>
        <div class="commentDisplay">
            {#if comments.length == 0}
                <span class="no-comments">No comments yet...</span>
            {/if}
            {#each comments as comment, i}
                <CommentComponent comment={comment} myComment={comment.user.id === user.user.id}/>
            {/each}
        </div>

    </div>
</div>

<style lang="scss">
    @import "src/vars";

    .container {
        width: 100%;
        min-height: 50vh;

        @media (min-width: $mid-bp) {
            display: flex;
            flex-direction: row;
            justify-content: center;
        }

        .center {
            display: flex;
            flex-direction: column;
        
            @media (min-width: $mid-bp) {
                max-width: $mid-bp;
                width: 100%;
            }

            .commentDisplay {
                min-height: 20em;
                margin: 0.5rem 1rem;
            }
            
            .newCommentField {
                display: flex;
                flex-direction: row;
                margin: 0.5rem 1rem;
                textarea {
                    outline: none;
                    width: 100%;
                    height: 100%;
                    background-color: transparent;
                    border: none;
                    border-bottom: .0625rem solid;
                    display: block;
                    font-size: 1.125rem;
                    height: 5rem;
                    line-height: 1.5rem;
                }
                button {
                    background: none;
                    border: none;
                    img {
                        height: 2rem;
                    }
                }
            }
            
        }
    }
</style>