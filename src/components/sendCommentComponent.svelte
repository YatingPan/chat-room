<script lang="ts">
    import type { NewComment } from "../../types/message.type"
    import type { UserExtended } from "../../types/user.type";

    import  store from "../stores/store";

    export let user: UserExtended;
    let commentText: string = "";
    
    const onSendComment = () => {
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
</script>

<div class="newCommentField">
    <textarea type="text" bind:value={commentText} 
    placeholder="Send a comment" cols="30" rows="5"></textarea>
    <button on:click={onSendComment}>
        <img src="build/icons/sendIcon.svg" alt="send comment">
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