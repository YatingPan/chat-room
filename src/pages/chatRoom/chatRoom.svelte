<script lang="ts">
  import type { ActionsUpdate, BotComment, Comment, Reply } from "../../../types/comment.type"
  import type { User, UserExtended } from "../../../types/user.type";
  import type { RoomData } from "../../../types/room.type";
  import { navigate } from 'svelte-routing';
  // import { Users } from "../../../server/util/users";
  import CommentComponent from "../../components/comment.svelte"
  import SendCommentComponent from "../../components/sendCommentComponent.svelte"
  import { onMount } from "svelte";
  import  store from "../../stores/store";
  // import {allComments} from "../../../server/server";
  // import {Logs} from "../../../server/util/logs";
  import * as animateScroll from "svelte-scrollto";
  import IntersectionObserver from "svelte-intersection-observer";
  

  let element;
  let remainingTimeCounter
  let remainingTime = 0
  let historyComments: Array<Comment> = [];
  let user: UserExtended;

  let comments: Array<Comment> = [];
  let replies = {};
  //let likes = {};
  //let dislikes = {};
  let notifications: Notification[] = [];
  let n_new_comments = 0;


  //const addNotification = (notification: Notification) => {
  //    notifications = [... notifications, notification]
  //}
  //const removeNotification = (index: number) => {
  //    notifications = [
  //        ...notifications.slice(0, index),
  //        ...notifications.slice(index + 1, notifications.length)
  //    ]
  //}
  //const addLike = (newLike: Like, parentCommentID: number) => {
  //    if(likes[parentCommentID]) {
  //        likes[parentCommentID] = [... likes[parentCommentID], newLike]
  //    } else {
  //        likes[parentCommentID] = [newLike]
  //    }
  //    console.log(likes)
  //}
  //const addDislike = (newDislike: Like, parentCommentID: number) => {
  //    if(dislikes[parentCommentID]) {
  //        dislikes[parentCommentID] = [... dislikes[parentCommentID], newDislike]
  //    } else {
  //        dislikes[parentCommentID] = [newDislike]
  //    }
  //}
  //const updateLikes = (commentID: number, updates: Like[]) => {
  //    likes[commentID] = updates
  //}
  //const updateDislikes = (commentID: number, updates: Like[]) => {
  //    dislikes[commentID] = updates
  //}
  const addReply = (newReply: Reply) => {
      if(replies[newReply.parentID])
          replies[newReply.parentID] = [... replies[newReply.parentID], newReply.comment]
      else
          replies[newReply.parentID] = [newReply.comment]

      if(newReply.comment.user.id === user.user.id)
          animateScroll.scrollTo({element: `.commentCard.id${newReply.comment.id}`})
  }
  //const botLikeToLike = (botDislike: BotLike, parentCommentID: number): Like => {
  //    return {
  //        userID: botDislike.botName,
  //        time: new Date(botDislike.time)
  //    }
  //}
  const generateComment = (autoComment: BotComment) => {
      console.log(`received bot Comment: ${JSON.stringify(autoComment, null, 4)}`)
      const newComment: Comment = {
          id: autoComment.id,
          time: new Date(autoComment.time),
          user: {
              id: autoComment.botName,
              name: autoComment.botName
          },
          content: autoComment.content,
          //moderation: autoComment.moderation
      }
      console.log(`generated new comment: ${JSON.stringify(newComment, null, 4)}`)
      return newComment
  }

  const addComment = (newComment: Comment) => {
      console.log("####Comments before adding",comments)
      comments = [... comments, newComment]
      console.log("####Comments after adding",comments)
      if(newComment.user.id === user.user.id) {
          console.log("###Animation since it's my comment")
          animateScroll.scrollToBottom()
      }
      else{
          n_new_comments++
      }
  }
  // Remove Flag
  //const flagComment = (commentID: number) => {
  //    const comment = comments.find((comment: Comment) => comment.id === commentID)
  //    const index = comments.findIndex((comment: Comment) => comment.id === commentID)
  //    const newComment = comment
  //    newComment.flagged = true
  //    console.log("Flagged moderation: " + console.log(JSON.stringify(newComment, null, 4)));
  //    comments = [
  //        ...comments.slice(0, index),
  //        newComment,
  //        ...comments.slice(index + 1, comments.length)
  //    ]
  //}

  const removeComment = (commentID: number) => {
      const comment = comments.find((comment: Comment) => comment.id === commentID)
      const index = comments.findIndex((comment: Comment) => comment.id === commentID)
      const newComment = comment;
      //newComment.content = comment.moderation.textComment;
      newComment.removed = true;
      //console.log("Removed moderation: " + console.log(JSON.stringify(newComment, null, 4)));
      comments = [
          ...comments.slice(0, index),
          newComment,
          ...comments.slice(index + 1, comments.length-1)
      ]
  }
  const removeCommentsOfUser = (comms: Comment[], userID: string) => {
      let index = comms.findIndex((comment: Comment) => comment.user.id === userID)
      while( -1 < index) {
          comms.splice(index,1)
          index = comms.findIndex((comment: Comment) => comment.user.id === userID)
      }
      return comms
  }

  const removeEveryCommentFromUser = (userID: string) => {
      comments = removeCommentsOfUser(comments, userID)
      for (const key in replies) {
          replies[key] = removeCommentsOfUser(replies[key], userID)
      }
  }

  const autoSend = (time: Date, callback, ...args) => {
      const timetarget = time.getTime();
      const timenow =  new Date().getTime();
      const offsetmilliseconds = timetarget - timenow;


      if (offsetmilliseconds > 0) setTimeout(() => callback.apply(this, args), offsetmilliseconds)
      else callback.apply(this, args)
  }
  

  const closeChatRoom = () => {
      navigate(`checkout`, { replace: false });
      clearInterval(remainingTimeCounter)
      console.log("Experiment ends")
  }

  const closeChatRoomRefresh = () => {
      navigate(`checkoutOnRefresh`, { replace: false });
      clearInterval(remainingTimeCounter)
      console.log("Experiment ends")
  }

  onMount(() => {
      store.userStore.subscribe((currentUser: UserExtended) => {
          if(currentUser) user = currentUser
      })

      store.roomStore.subscribe((assignedRoom: RoomData) => {
          comments = []
          console.log("incommingRoom", assignedRoom)
          //if(assignedRoom?.userModerationEvents) {
              //assignedRoom.userModerationEvents.map((moderation: Moderation) => {

                  //autoSend(new Date(moderation.time), addNotification, moderation)
                  // if User got removed, remove every comment of that user from the comments list
                  //if(moderation?.type === 0)
                      //autoSend(new Date(moderation.time), removeEveryCommentFromUser, moderation.target)
              //})
          //}

          // add to set room time as 5 minutes
          assignedRoom.duration = 5;
          // Calculate the end time accounting for the 10-second wait time to join
          const endTime = new Date(new Date(assignedRoom?.startTime).getTime() + assignedRoom?.duration * 60 * 1000 + 10000)
          //const endTime = new Date(new Date(assignedRoom?.startTime).getTime() + assignedRoom?.duration * 60 * 1000)
          //const startTimeWithDelay = new Date(new Date(assignedRoom.startTime).getTime() + 10000); // 10 seconds for waiting to join
          //const endTime = new Date(startTimeWithDelay.getTime() + assignedRoom.duration * 60000); // 5 minutes for the chat
          console.log("assigned room is")
          console.log(assignedRoom)
          if (typeof assignedRoom !== 'undefined'){
              autoSend(endTime, closeChatRoom)
          }
          else{
              console.log("Its undefined")
              autoSend(endTime,closeChatRoomRefresh)
          }

          // Set up a countdown for the remaining time
          remainingTimeCounter = setInterval(() => {
              const now = Date.now();
              const remainingTimeMS = endTime - now;
              remainingTime = remainingTimeMS / 1000;

              // Stop the countdown when the time is up
              if (remainingTime <= 0) {
                  clearInterval(remainingTimeCounter);
                  closeChatRoom(); // Call this function to handle the chat room closure
              }
      }   , 1000);
          
          //remainingTimeCounter = setInterval(() => {
          //    const now = Date.now()
          //    const remainingTimeMS = endTime - now
          //    remainingTime = remainingTimeMS / 1000
          //}, 1000);

          if(assignedRoom?.automaticComments) {
              const comms = assignedRoom?.automaticComments.sort((a: BotComment, b: BotComment) => a.time > b.time ? 1 : -1)
              console.log("automaticComments", comms)
              comms.map((autoComment: BotComment) => {

                  const newComment = generateComment(autoComment)
                  autoSend(newComment.time, addComment, newComment)

                  // register top level comment moderation messages
                  //if(autoComment?.moderation) {
                  //    const moderationEvent = autoComment.moderation
                  //    autoSend(new Date(moderationEvent.time), addNotification, moderationEvent)
                      // remove flag
                      // if(moderationEvent?.type === 1)
                      //    autoSend(new Date(moderationEvent.time), flagComment, moderationEvent.target)
                      // If comment got removed, mark it's content as removed
                  //    if(moderationEvent?.type === 2)
                  //        autoSend(new Date(moderationEvent.time), removeComment, moderationEvent.target)
                  //}

                  if(autoComment.replies) {
                      for(let reply of autoComment.replies) {
                          const newReply = {
                              parentID: autoComment.id,
                              comment: generateComment(reply)
                          }
                          autoSend(newReply.comment.time, addReply, newReply)

                          // register reply level comment moderation messages
                          //if(reply?.moderation) {
                          //    const moderationEvent = autoComment.moderation
                          //    autoSend(new Date(moderationEvent.time), addNotification, moderationEvent)
                          //}
                      }
                  }
                  //if(autoComment.likes) {
                  //    for(let like of autoComment.likes) {
                  //        const newLike = botLikeToLike(like, autoComment.id)
                  //        autoSend(newLike.time, addLike, newLike, autoComment.id)
                  //    }
                  //}
                  //if(autoComment.dislikes) {
                  //    for(let dislike of autoComment.dislikes) {
                  //        const newDislike = botLikeToLike(dislike, autoComment.id)
                  //        autoSend(newDislike.time, addDislike, newDislike, autoComment.id)
                  //    }
                  //}
              })
          }
      })

      store.replyStore.subscribe((currentReply: Reply) => {
          if(currentReply) {
              addReply(currentReply)
          }
      })
      store.actionsStore.subscribe((actionsUpdate: ActionsUpdate) => {
          //if(actionsUpdate) {
          //    updateLikes(actionsUpdate.parentCommentID, actionsUpdate.likes)
          //    updateDislikes(actionsUpdate.parentCommentID, actionsUpdate.dislikes)
          //}
      })

      store.commentStore.subscribe((currentComment: Comment) => {
          if(currentComment) addComment(currentComment)
      })

      store.commentsStore.subscribe((allPrevComments:Comment[]) =>{
          if(allPrevComments){
              for(const tempComment of allPrevComments){
                  addComment(tempComment)
              }
          }
      })

      store.repliesStore.subscribe((allReplies: Reply[]) => {
          if(allReplies) {
              for(const currentReply of allReplies){
                  addReply(currentReply)
              }
          }
      })

      store.allActionsStore.subscribe((allActionsUpdate: ActionsUpdate[]) => {
          if(allActionsUpdate) {
              //for(const actionsUpdate of allActionsUpdate) {
              //    updateLikes(actionsUpdate.parentCommentID, actionsUpdate.likes)
              //    updateDislikes(actionsUpdate.parentCommentID, actionsUpdate.dislikes)
              //}
          }
      })

  })
  let y;

  function secondsToDhms(seconds) {
      seconds = Number(seconds);
      const d = Math.floor(seconds / (3600*24));
      const h = Math.floor(seconds % (3600*24) / 3600);
      const m = Math.floor(seconds % 3600 / 60);
      const s = Math.floor(seconds % 60);

      const dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
      const hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
      const mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
      const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";

      const res = (dDisplay + hDisplay + mDisplay + sDisplay).replace(/,\s*$/, "");
      return res
  }



  $: remainingTimeFormatted = secondsToDhms(remainingTime)
</script>

<svelte:window bind:scrollY={y}/>

<svelte:head>
  <title>Discussion Room</title>
</svelte:head>
<div class = "timer-and-button-container">
<div class="remaining-time-container">
  <div class="remaining-time">
      <p>Remaining time: </p>
      <p>{remainingTimeFormatted}</p>
  </div>
</div>
</div>
<div class="container">

  <div class="center">
      <div class="commentDisplay">
          {#if comments.length == 0}
              <span class="no-comments">No comments yet...</span>
          {/if}
          {#each comments as comment, i}
              <CommentComponent
                      isTopLevelComment={true}
                      comment={comment}
                      replies={replies[comment.id]}
                      myComment={comment?.user?.id === user?.user?.id}/>
          {/each}
          {#if n_new_comments > 0}
              <div class="newCommentIndicator" on:click="{() => animateScroll.scrollToBottom()}">
                  <img src="../../icons/new-message.svg" alt="new comment">
                  <span>{n_new_comments}</span>
              </div>
          {/if}
          <IntersectionObserver {element} on:observe="{(e) => n_new_comments = 0}">
              <div bind:this={element} class="bottomCommentDisplay"></div>

          </IntersectionObserver>
      </div>
      <SendCommentComponent showReplyInput={false}/>
  </div>
  {#if y > 200}
      <div class="scrollToTop" id="scrollToTop">
          <a on:click={() => animateScroll.scrollToTop()}> <img src="../../icons/cd-top-arrow.svg" alt="scroll to top">
              <!-- <br> <b>To Top</b></a> -->
      </div>
  {/if}


</div>


<style lang="scss">
@import "src/vars";

.timer-and-button-container {
position: fixed; // Fixed position
top: 1rem; // Adjust as necessary for spacing from the top
left: 1rem; // Adjust as necessary for spacing from the left
display: flex; // Use flexbox
flex-direction: column; // Stack children vertically
align-items: center; // Center-align the flex items
gap: 0.5rem; // Space between timer and button
z-index: 1000; // Ensure it's on top of other elements
}

  .remaining-time-container {
  position: fixed; /* Keep it fixed at the top left */
  top: 1rem; /* Adjust as necessary for spacing from the top */
  left: 1rem; /* Adjust as necessary for spacing from the left */
  background: white;
  padding: 1rem;
  border-radius: 5px; /* Rounded corners for aesthetics */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Shadow for depth */
  z-index: 1000; /* Ensure it's on top of other elements */
  }
    .remaining-time p {
    margin: 0;
    text-align: center; /* Center the text */
    font-weight: bold; /* Make the text bold */
  }

.container {
  width: 100%;
  min-height: 50vh;

  @media (min-width: $mid-bp) {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  //.notificationArea {
  //  display: flex;
  //  flex-direction: column;
  //  position: fixed;
  //  top: 0;
  //  right: 0;

  //  .notification {
  //    position: relative;
  //    border-top: .1rem solid rgba(0,0,0,.15);
  //    background: #dddc;
  //    padding: 1.2rem;
  //    width: 50vw;
  //    max-width: 18rem;

  //    .signature {
  //      color:rgb(31, 31, 31);
  //    }
  //    .close-icon {
  //      position: absolute;
  //      cursor: pointer;
  //      top: 0.5rem;
  //      right: 0.5rem;
  //      height: 1rem;
  //    }
  //  }
  //}

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
      .newCommentIndicator {
        background: white;
        position: fixed;
        bottom: 7rem;
        right: 3rem;
        width: 3rem;
        height: 3rem;
        img {
          width: 3rem;
          height: 3rem;
        }
        span {
          position: absolute;
          text-align: center;
          right: -1px;
          top: 2px;
          background: black;
          color: white;
          font-size: 15px;
          font-weight: bold;
          width: 21px;
          height: 21px;
          border-radius: 50%;
        }
      }
      .bottomCommentDisplay {
        height: 1rem;
        width: 100%;
      }
    }

  }
}
.scrollToTop {
  background: white;
  position: fixed;
  bottom: 3rem;
  right: 3.3rem;
  width: 2rem;
  height: 2rem;
  // reinstate clicks
  pointer-events: all;

  // basic styling
  display: inline-block !important;
  text-decoration: none;
  text-align: center;
  border-radius: 20%;
  padding: 0.25rem;

  $color: rgba(0, 0, 0, 0.9);

  // "pretty" styles, including states
  // border: 1px solid $color;
  background-color: $color; // scale-color($color, $lightness: 15%);
  transition: transform 80ms ease-in;

  &:hover,
  &:focus {
    transform: scale(1.03);
  }
  a {
    text-decoration: none;
    color: white;
    cursor: pointer;
    img {
      padding-top: 0.4rem;
    }
  }
}
.modal-overlay {
position: fixed;
top: 0;
left: 0;
width: 100vw;
height: 100vh;
background-color: rgba(0, 0, 0, 0.5);
display: flex;
justify-content: center;
align-items: center;
}

.modal {
background: white;
padding: 2rem;
border-radius: 8px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
z-index: 1000;
display: flex;
flex-direction: column;
gap: 1rem;

h2 {
  margin-top: 0;
}
}

</style>