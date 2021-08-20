<script lang="ts">
    import type { ActionsUpdate, BotComment, BotLike, Comment, Like, Reply } from "../../../types/comment.type"
    import type { User, UserExtended } from "../../../types/user.type";
    import type { Moderation, RoomData, Notification } from "../../../types/room.type";

    import CommentComponent from "../../components/comment.svelte"
    import SendCommentComponent from "../../components/sendCommentComponent.svelte"
    import { onMount } from "svelte";
    import  store from "../../stores/store";
import Comment from "../../components/comment.svelte";

    let user: UserExtended;

    let comments: Array<Comment> = [];
    let replies = {};
    let likes = {};
    let dislikes = {};
    let notifications: Notification[] = [];
    
    const addNotification = (notification: Notification) => {
        notifications = [... notifications, notification]
    }
    const removeNotification = (index: number) => {
        notifications = [
			...notifications.slice(0, index),
			...notifications.slice(index + 1, notifications.length)
        ]
    }
    const addLike = (newLike: Like, parentCommentID: number) => {
        if(likes[parentCommentID]) {
            likes[parentCommentID] = [... likes[parentCommentID], newLike]
        } else { 
            likes[parentCommentID] = [newLike]
        }
        console.log(likes)
    }
    const addDislike = (newDislike: Like, parentCommentID: number) => {
        if(dislikes[parentCommentID]) {
            dislikes[parentCommentID] = [... dislikes[parentCommentID], newDislike]
        } else {
            dislikes[parentCommentID] = [newDislike]
        }
    }
    const updateLikes = (commentID: number, updates: Like[]) => {
        likes[commentID] = updates
    }
    const updateDislikes = (commentID: number, updates: Like[]) => {
        dislikes[commentID] = updates
    }
    const addReply = (newReply: Reply) => {
        if(replies[newReply.parentID]) 
            replies[newReply.parentID] = [... replies[newReply.parentID], newReply.comment]
        else 
            replies[newReply.parentID] = [newReply.comment]
    }
    const botLikeToLike = (botDislike: BotLike, parentCommentID: number): Like => {
        return {
            userID: botDislike.botName,
            time: new Date(botDislike.time)
        }
    }
    const generateComment = (autoComment: BotComment) => {

        const newComment: Comment = {
            id: autoComment.id,
            time: new Date(autoComment.time),
            user: {
                id: autoComment.botName,
                name: autoComment.botName
            },
            content: autoComment.content
        }
        return newComment
    }

    const addComment = (newComment: Comment) => {
        comments = [... comments, newComment]
    }
    const removeComment = (commentID: number) => {
        const index = comments.findIndex((comment: Comment) => comment.id === commentID)
        comments = [
			...comments.slice(0, index),
			...comments.slice(index + 1, notifications.length)
        ]
    }

    const autoSend = (time: Date, callback, ...args) => {
        const timetarget = time.getTime();
        const timenow =  new Date().getTime();
        const offsetmilliseconds = timetarget - timenow;
        
        
        if (offsetmilliseconds > 0) setTimeout(() => callback.apply(this, args), offsetmilliseconds)
        else callback.apply(this, args)
    }

    onMount(() => {
        store.userStore.subscribe((currentUser: UserExtended) => {
            if(currentUser) user = currentUser
        })
        store.commentStore.subscribe((currentComment: Comment) => {
            if(currentComment) comments = [... comments, currentComment]
        })
        store.replyStore.subscribe((currentReply: Reply) => {
            if(currentReply) {
                addReply(currentReply)
            }
        })
        store.actionsStore.subscribe((actionsUpdate: ActionsUpdate) => {
            if(actionsUpdate) {
                updateLikes(actionsUpdate.parentCommentID, actionsUpdate.likes)
                updateDislikes(actionsUpdate.parentCommentID, actionsUpdate.dislikes)
            }
        })

        store.roomStore.subscribe((assignedRoom: RoomData) => {
            comments = []
            console.log("incommingRoom", assignedRoom)
            if(assignedRoom?.userModerationEvents) {
                assignedRoom.userModerationEvents.map((moderation: Moderation) => {
                    
                    autoSend(new Date(moderation.time), addNotification, moderation)
                })
            }
            if(assignedRoom?.automaticComments) {
                const comms = assignedRoom?.automaticComments.sort((a: BotComment, b: BotComment) => a.time > b.time ? 1 : -1)
                console.log("automaticComments", comms)
                comms.map((autoComment: BotComment) => {
                    
                    const newComment = generateComment(autoComment)
                    autoSend(newComment.time, addComment, newComment)

                    // register top level comment moderation messages
                    if(autoComment?.moderation) {
                        const moderationEvent = autoComment.moderation
                            autoSend(new Date(moderationEvent.time), addNotification, moderationEvent)
                            if(moderationEvent?.type === 1)
                                autoSend(new Date(moderationEvent.time), removeComment, moderationEvent.target)
                    }
                    
                    if(autoComment.replies) {
                        for(let reply of autoComment.replies) {
                            const newReply = {
                                parentID: autoComment.id,
                                comment: generateComment(reply)
                            }
                            autoSend(newReply.comment.time, addReply, newReply)
                            
                            // register reply level comment moderation messages
                            if(reply?.moderation) {
                                const moderationEvent = autoComment.moderation
                                autoSend(new Date(moderationEvent.time), addNotification, moderationEvent)
                            }
                        }
                    }
                    if(autoComment.likes) {
                        for(let like of autoComment.likes) {
                            const newLike = botLikeToLike(like, autoComment.id)
                            autoSend(newLike.time, addLike, newLike, autoComment.id)
                        }
                    }
                    if(autoComment.dislikes) {
                        for(let dislike of autoComment.dislikes) {
                            const newDislike = botLikeToLike(dislike, autoComment.id)
                            autoSend(newDislike.time, addDislike, newDislike)
                        }
                    }
                })
            }
        })
    })
</script>

<div class="container">
    <div class="center">
        <div class="notificationArea">
            {#each notifications as notification, i}
                <div class="notification" on:click={(e) => removeNotification(i)}>
                    <h3>{notification?.text}</h3>
                </div>
            {/each}
        </div>
        <SendCommentComponent showReplyInput={false}/>
        <div class="commentDisplay">
            {#if comments.length == 0}
                <span class="no-comments">No comments yet...</span>
            {/if}
            {#each comments as comment, i}
                <CommentComponent 
                    isTopLevelComment={true} 
                    comment={comment} 
                    replies={replies[comment.id]}
                    likes={likes}
                    dislikes={dislikes}
                    myComment={comment?.user?.id === user?.user?.id}/>
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

        .notificationArea {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 0;
            right: 0;

            .notification {
                border-top: .1rem solid rgba(0,0,0,.15);
                background: #dddc;
                padding: 1.2rem;
                width: 50vw;
                max-width: 18rem;
                transition: cubic-bezier(1, 0, 0, 1) 0.5s;
                animation: ease-in 2s;
            }
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