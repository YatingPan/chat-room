<script lang="ts">
    import type { ActionsUpdate, BotComment, BotLike, Comment, Like, Reply } from "../../types/comment.type"
    import type { User, UserExtended } from "../../types/user.type";
    import type { RoomData } from "../../types/room.type";

    import CommentComponent from "./comment.svelte"
    import SendCommentComponent from "./sendCommentComponent.svelte"
    import { onMount } from "svelte";
    import  store from "../stores/store";

    export let user: UserExtended;

    let comments: Array<Comment> = [];
    let replies = {};
    let likes = {};
    let dislikes = {};
        
    const addLike = (newLike: Like) => {
        if(likes[newLike.parentCommentID]) {
            likes[newLike.parentCommentID] = [... likes[newLike.parentCommentID], newLike]
        } else { 
            likes[newLike.parentCommentID] = [newLike]
        }
        console.log(likes)
    }
    const addDislike = (newDislike: Like) => {
        if(dislikes[newDislike.parentCommentID]) {
            dislikes[newDislike.parentCommentID] = [... dislikes[newDislike.parentCommentID], newDislike]
        } else {
            dislikes[newDislike.parentCommentID] = [newDislike]
        }
    }
    const updateLikes = (commentID: number, updates: Like[]) => {
        likes[commentID] = updates
        console.log(likes)
    }
    const updateDislikes = (commentID: number, updates: Like[]) => {
        dislikes[commentID] = updates
        console.log(dislikes)
    }
    const addReply = (newReply: Reply) => {
        if(replies[newReply.parentID]) 
            replies[newReply.parentID] = [... replies[newReply.parentID], newReply.comment]
        else 
            replies[newReply.parentID] = [newReply.comment]
        console.log("xxxadding Reply", newReply)
        console.log("xxxreplies", replies)
    }
    const botLikeToLike = (botDislike: BotLike, parentCommentID: number): Like => {
        return {
            parentCommentID,
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

    const sendAutoLike = (newLike: Like) => {
        // const likes = autoComment?.likes?.map((botLike: BotLike) => botLikeToLike(botLike, autoComment.id))
        // const dislikes = autoComment?.dislikes?.map((botDislike: BotLike) => botLikeToLike(botDislike, autoComment.id))
        addLike(newLike)
    }
    const sendAutoDislike = (newDislike: Like) => {
        // const likes = autoComment?.likes?.map((botLike: BotLike) => botLikeToLike(botLike, autoComment.id))
        // const dislikes = autoComment?.dislikes?.map((botDislike: BotLike) => botLikeToLike(botDislike, autoComment.id))
        addDislike(newDislike)
    }

    const sendAutoComment = (newComment: Comment) => {
        comments = [... comments, newComment]
    }

    const sendAutoReply = (newReply: Reply) => {
        console.log("Sending auto Reply", newReply)
        addReply(newReply)
        // if(replies[parentCommentID])
        //     $: replies[parentCommentID] = [... replies[parentCommentID], newReply]
        // else
        //     $: replies[parentCommentID] = [newReply]
    }

    const send = (time: Date, callback, ...args) => {
        const timetarget = time.getTime();
        const timenow =  new Date().getTime();
        const offsetmilliseconds = timetarget - timenow;
        
        
        console.log("xxxSending", args)
        if (offsetmilliseconds > 0) setTimeout(() => callback.apply(this, args), offsetmilliseconds)
        else callback.apply(this, args)
    }

    onMount(() => {
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
            if(assignedRoom?.automaticComments) {
                const comms = assignedRoom?.automaticComments.sort((a: BotComment, b: BotComment) => a.time > b.time ? 1 : -1)
                console.log("automaticComments", comms)
                comms.map((autoComment: BotComment) => {
                    
                    const newComment = generateComment(autoComment)
                    send(newComment.time, sendAutoComment, newComment)
                    
                    if(autoComment.replies) {
                        for(let reply of autoComment.replies) {
                            const newReply = {
                                parentID: autoComment.id,
                                comment: generateComment(reply)
                            }
                            console.log("Sending... ", newReply)
                            send(newReply.comment.time, sendAutoReply, newReply)
                        }
                    }
                    if(autoComment.likes) {
                        for(let like of autoComment.likes) {
                            const newLike = botLikeToLike(like, autoComment.id)
                            send(newLike.time, sendAutoLike, newLike)
                        }
                    }
                    if(autoComment.dislikes) {
                        for(let dislike of autoComment.dislikes) {
                            const newDislike = botLikeToLike(dislike, autoComment.id)
                            send(newDislike.time, sendAutoDislike, newDislike)
                        }
                    }
                })
            }
        })
    })
</script>

<div class="container">

    <div class="center">
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