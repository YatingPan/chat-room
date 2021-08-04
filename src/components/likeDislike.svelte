<script lang="ts">
    import { onMount } from "svelte";
    import type { ActionsUpdate, Like } from "../../types/comment.type";
    import type { User, UserExtended } from "../../types/user.type";
    import store from "../stores/store";

    export let likes : Like[]
    export let dislikes : Like[]
    export let parentCommentID: number
    let user: User
    $: likeNr = likes ? likes.length : 0
    $: dislikeNr = dislikes ? dislikes.length : 0
    $: iLiked = likeNr > 0 && -1 < likes.findIndex((like: Like) => like?.userID === user?.id) 
    $: iDisliked = dislikeNr > 0 && -1 < dislikes.findIndex((dislike: Like) => dislike?.userID === user?.id) 

    const generateLike = (): Like => {
        return {
            userID: user.id,
            time: new Date()
        }
    }    
    const removeActionByUserID = (actionsList: Like[], userID): Like[] => {
        const userActionIndex = actionsList.findIndex((like: Like) => like.userID === userID)
        if (userActionIndex > -1) {
            actionsList.splice(userActionIndex, 1);
        }
        return actionsList
    }

    const like = () => {
        if(!iLiked) {
            const newActionsUpdate: ActionsUpdate = {
                senderID: user.id,
                parentCommentID: parentCommentID,
                likes: [... likes, generateLike()],
                dislikes: removeActionByUserID(dislikes, user.id)
            }
            store.sendActionsUpdate(newActionsUpdate)
        } else {
            const newActionsUpdate: ActionsUpdate = {
                senderID: user.id,
                parentCommentID: parentCommentID,
                likes: removeActionByUserID(likes, user.id),
                dislikes
            }
            store.sendActionsUpdate(newActionsUpdate)
        }
    }
    const dislike = () => {
        if(!iDisliked) {
            const newActionsUpdate: ActionsUpdate = {
                senderID: user.id,
                parentCommentID: parentCommentID,
                likes: removeActionByUserID(likes, user.id),
                dislikes: [... dislikes, generateLike()]
            }
            store.sendActionsUpdate(newActionsUpdate)
        } else {
            const newActionsUpdate: ActionsUpdate = {
                senderID: user.id,
                parentCommentID: parentCommentID,
                likes,
                dislikes: removeActionByUserID(dislikes, user.id)
            }
            store.sendActionsUpdate(newActionsUpdate)
        }
    }

    onMount(() => {
        store.userStore.subscribe((userExt: UserExtended) => {
            if(userExt) user = userExt.user
            console.log(parentCommentID, likes, dislikes)
        })
    })
</script>

<div class="likes-dislikes">
    <div class="likes up-down">
        <span class="vote-count">{likeNr}</span>
        <button class:active={iLiked} on:click={like}>
            <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;">
                <g class="icon">
                    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" class=""></path>
                </g>
            </svg>
        </button>
    </div>
    <div class="dislikes up-down">
        <span class="vote-count">{dislikeNr}</span>
        <button class:active={iDisliked} on:click={dislike}>
            <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;">
                <g class="icon">
                    <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" class=""></path>
                </g>
            </svg>
        </button>
    </div>
</div>

<style lang="scss">
    @import "src/vars";

    .likes-dislikes {
        display: flex;
        flex-direction: row;
        width: 8em;
        justify-content: space-between;
        .up-down {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
        }
        .dislikes {
            margin-left: 0.5em;
        }
        .vote-count {
            margin-right: 0.5em;
        } 
        button {
            height: 2.5rem;
            width: 2.5rem;
            margin: 0;
            background: none;
            border: none;
        }
        button:hover {
            svg {
                fill: rgb(75, 75, 75);
            }
        }
        button.active {
            svg {
                fill: rgb(131, 128, 128);
            }
        }
    }
</style>