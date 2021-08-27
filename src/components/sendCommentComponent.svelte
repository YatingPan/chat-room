<script lang="ts">
import { onMount } from "svelte";

    import type { ProposedComment, ProposedReply } from "../../types/comment.type"
    import type { User } from "../../types/user.type";

    import  store from "../stores/store";

    export let isReply: Boolean = false
    export let parentID: number = null
    export let showReplyInput: Boolean
    let user: User = undefined;
    const commentTypeStr = isReply ? "reply" : "comment"

    onMount( () => {
        store.userStore.subscribe((usr) => {
            user = usr?.user
        })
    })
    let commentText: string = "";
    
    const onSendComment = () => {
        if( commentText.length > 0) {
            const comObj: ProposedComment = {
                "user": user,
                "content": commentText
            }
            commentText = ""
            console.log(`Sending ${commentTypeStr}: `, comObj)
            if(isReply) {
                const replyObj: ProposedReply = {
                    comment: comObj,
                    parentID
                }
                store.sendReply(replyObj)
            }
            else {
                store.sendComment(comObj)
                //animateScroll.scrollTo({element: '.commentCard :last-of-type'})
            }

        } else {
            console.log("Not sending comment")
        }
        // Toggle off input field
        showReplyInput = false
    }
</script>

<div class="newCommentField">
    <textarea type="text" bind:value={commentText} placeholder="{`Send a ${commentTypeStr}`}" cols="30" rows="5" autofocus></textarea>
    <button on:click={onSendComment}>
        <img src="../icons/sendIcon.svg" alt="send comment">
    </button>
</div>

<style lang="scss">
    @import "src/vars";
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
</style>