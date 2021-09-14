<script lang="ts">
    import moment from "moment";
    
    import type { Comment, Like } from "../../types/comment.type"
    import CommentComponent from "./comment.svelte"
    import LikesDislikes from "./likeDislike.svelte";
    import SendCommentComponent from "./sendCommentComponent.svelte"

    export let comment: Comment
    export let myComment: Boolean = false
    export let replies: Comment[] = []
    export let likes: {}
    export let dislikes: {}
    export let isTopLevelComment: Boolean = true
    let showReplyInput: Boolean = false
    //export let flagged: Boolean = false
    $: thisCommentLikes = likes[comment.id] ? likes[comment.id] : []
    $: thisCommentDislikes = dislikes[comment.id] ? dislikes[comment.id] : []

    const formatTime = (date: Date): string => moment(date).format("D.MM.YYYY, HH:mm")
    console.log(JSON.stringify(comment, null, 4));
</script>

<article class="commentCard id{comment?.id}" class:myComment={myComment}>

    <div class="commentContainer {comment?.flagged === true ? 'flagged' : ''}">
        <header class="CommentCard_header">
            <div class="userInfo">
                <h2 class="userName">{comment?.user?.name}</h2>
                <h3 class="time">{formatTime(comment?.time)}</h3>
            </div>
        </header>
        <p class="text">{comment?.content}</p>
    </div>
    <div class="actionsContainer">
       <LikesDislikes likes={thisCommentLikes} dislikes={thisCommentDislikes} parentCommentID={comment.id}/>
        <div class="reply-button" class:showReplyButton={isTopLevelComment}>
            <button on:click="{() => showReplyInput = !showReplyInput}">
                <span>Reply</span>
            </button>
        </div>
    </div>
    {#if showReplyInput}
        <div class="reply-input">
            <SendCommentComponent parentID={comment.id} isReply={true} bind:showReplyInput={showReplyInput}/>
        </div>
    {/if}
    {#if replies}  
        <div class="repliesContainer" class:showReplies={replies}> 
            {#each replies as reply, i}
                <CommentComponent comment={reply} replies={[]} isTopLevelComment={false} likes={likes} dislikes={dislikes}/>
            {/each}
        </div>
    {/if}


</article>

<style lang="scss">
    @import "src/vars";
    
    @keyframes newComment {
        from { background: rgb(179, 179, 179)}
        to   { background: white}
    }

    // .commentCard:last-of-type {
    //     border-bottom: .0625rem solid rgba(0,0,0,.15);
    // }
    
    .flagged {
            background: rgba(81, 212, 233, 0.5);
    }
    .flagged::after {
        content: "❗ This comment got flagged by the administrators.";
        font-style: italic;
    }

    .commentCard {
        border-top: .0625rem solid rgba(0,0,0,.15);
        color: #1a1a1a;
        padding: 0.5rem;
        animation: newComment 2s linear;

        header {
            align-items: center;
            display: flex;
            .userInfo {
                margin-left: .625rem;
                font-size: .875rem;
                line-height: 1.5rem;
                .userName {
                    font-size: medium;
                    font-weight: 900;
                    margin: 0;
                }
                .time {
                    font-weight: 400;
                    font-size: small;
                    margin: 0;
                }
            }
        }

        p.text {
            padding: 0 .625rem 0 0.625rem;
            font-size: 1rem;
            line-height: 1.4375rem;
        }
        .actionsContainer {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding: 0 .625rem 0 0.625rem;
            align-items: center;
            
            .reply-button {
                display: none;
                button {
                    width: 5em;
                    background: rgb(189, 193, 248);
                    border: #1a1a1a bold 2px;
                }
            }
            .reply-button.showReplyButton {
                display: block;
            }

        }
        button {
            width: 5em;
            background: rgb(189, 193, 248);
            border: #1a1a1a bold 2px;
        }

        .reply-input {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            width: 100%;
        }

        .repliesContainer {
            margin-left: 2rem;
        }

    }
</style>