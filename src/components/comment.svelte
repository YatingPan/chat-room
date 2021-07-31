<script lang="ts">
    import moment from "moment";
    
    import type { Comment } from "../../types/comment.type"
    import LikesDislikes from "./likeDislike.svelte";
    import SendCommentComponent from "./sendCommentComponent.svelte"

    export let comment: Comment
    export let myComment: Boolean = false
    let showReplyInput: Boolean = false

    const formatTime = (date: Date): string => {
        return moment(date).format("D.MM.YYYY, HH:mm")
        //date.toLocaleString('de-DE', {weekday: "long", year: "numeric", month:"numeric", day: "numeric"});
    }
</script>

<article class="commentCard" class:myComment={myComment}>
    
    <header class="CommentCard_header">
        <div class="userImage">
            <img src="https://api.20min.ch/user/static/15@4x.1a9d6907bd8a7b66b15d3dc47dd8533469c08e25431f80e0a865d29ce4753ebc.png" alt="ManniderLibero" class="sc-1164gis-0 vWuDk">
        </div>
        <div class="userInfo">
            <h2 class="userName">{comment?.user?.name}</h2>
            <h3 class="time">{formatTime(comment?.time)}</h3>
        </div>
    </header>
    <p class="text">{comment?.content}</p>
    
    <div class="actionsContainer">
       <LikesDislikes init_likes={comment?.likes.length} init_dislikes={comment?.dislikes.length}/>
        <div class="reply-button">
                <a class="">
                    <button on:click="{() => showReplyInput = !showReplyInput}">
                        <span>Reply</span>
                    </button>
                </a>
        </div>
    
        <!-- <div class="Likes">
            <span class="likeIcon" style="color: rgb(91, 142, 219);"></span> 
            <span>2 Likes</span>
        </div>
        <div><span>Reply</span></div> -->
    </div>
    <div class="reply-input" class:showReplyInput={showReplyInput}>
        <SendCommentComponent/>
    </div>
    <div class="replies" class:showReplies={comment?.replies}>
        
    </div>


</article>

<style lang="scss">
    @import "src/vars";
    
    .commentCard:last-of-type {
        border-bottom: .0625rem solid rgba(0,0,0,.15);
    }
    .commentCard {
        border-top: .0625rem solid rgba(0,0,0,.15);
        color: #1a1a1a;
        padding: 0.5rem;

        header {
            h1, h2 {
                font-size: 1em;
            }
            align-items: center;
            display: flex;
            
            .userImage {
                border-radius: 50%;
                display: inline-block;
                height: 48px;
                width: 48px;
                img {
                    height: 100%
                }
            }
            .userInfo {
                margin-left: .625rem;
                font-size: .875rem;
                line-height: 1.125rem;
                .userName {
                    font-weight: 900;
                    margin: 0;
                }
                .time {
                    font-weight: 400;
                    margin: 0;
                }
            }
        }

        p.text {
            padding: 0 .625rem 0 3.625rem;
            font-size: 1rem;
            line-height: 1.4375rem;
        }
        .actionsContainer {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding: 0 .625rem 0 3.625rem;
            align-items: center;
            
            .reply-button {
                button {
                    width: 5em;
                    background: rgb(189, 193, 248);
                    border: #1a1a1a bold 2px;
                }
            }

        }
        button {
            width: 5em;
            background: rgb(189, 193, 248);
            border: #1a1a1a bold 2px;
        }

        .reply-input.showReplyInput {
            display: block;
        }
        .reply-input {
            display: none;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 0 .625rem 0 3.625rem;
            height: 10em;
            width: 100%;
            .reply-text {
                height: 90%;
                width: 80%;
            }
        }
    }
</style>