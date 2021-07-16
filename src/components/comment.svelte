<script lang="ts">
    import moment from "moment";
    
    import type { Comment } from "../../types/message.type"

    export let comment: Comment
    export let myComment: Boolean = false
    let showReplyInput: Boolean = false

    const formatTime = (date: Date): string => {
        return moment(date).format("D.MM.YYYY, hh:mm")
        //date.toLocaleString('de-DE', {weekday: "long", year: "numeric", month:"numeric", day: "numeric"});
    }
</script>

<article class="commentCard" class:myComment={myComment}>
    
    <header class="CommentCard_header">
        <div class="userImage">
            <img src="https://api.20min.ch/user/static/15@4x.1a9d6907bd8a7b66b15d3dc47dd8533469c08e25431f80e0a865d29ce4753ebc.png" alt="ManniderLibero" class="sc-1164gis-0 vWuDk">
        </div>
        <div class="userInfo">
            <h2 class="userName">{comment.user.name}</h2>
            <h3 class="time">{formatTime(comment?.time)}</h3>
        </div>
    </header>
    <p class="text">{comment.content}</p>
    
    <div class="actionsContainer">
        <div class="likes-dislikes">
            <div class="likes up-down">
                <span class="vote-count">26</span>
                <a>
                    <button>
                        <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;">
                            <g class="style-scope yt-icon">
                                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" class=""></path>
                            </g>
                        </svg><!--css-build:shady-->
                    </button>
                </a>
            </div>
            <div class="dislikes up-down">
                <span class="vote-count">26</span>
                <a>
                    <button>
                        <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;">
                            <g class="style-scope yt-icon">
                                <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" class=""></path>
                            </g>
                        </svg>
                    </button>
                </a>
            </div>
        </div>
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
        <textarea name="reply-text" class="reply-text"></textarea>
        <div class="reply-button">
            <a class="">
                <button on:click="{() => showReplyInput = !showReplyInput}">
                    <span>Reply</span>
                </button>
            </a>
    </div>
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
                a > button {
                    height: 2.5rem;
                    width: 2.5rem;
                    margin: 0;
                }
            }
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
            display: flex;
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
    .myComment {
        background-color: #e2e2e2;
    }
</style>