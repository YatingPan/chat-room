<script lang="ts">
    import { onMount } from "svelte";
    import  store from "../stores/store";
    import type { RoomData, Post } from "../../types/room.type";
    import moment from "moment";
    import type { ActionsUpdate } from "../../types/comment.type";

    //const bgImage = "build/Material/images/testImage.jpg"
    let post: Post = null
    //let likes: Like[] 
    //let dislikes: Like[]
    $: headerImageURL = `../postImages/${post?.imageName}`

    onMount(() => {
        store.roomStore.subscribe((assignedRoom: RoomData) => {
            if(assignedRoom?.post) {
                post = assignedRoom.post
                //likes = post?.likes
                //dislikes = post?.dislikes
            }
        })

        store.actionsStore.subscribe((actionsUpdate: ActionsUpdate) => {
            if(actionsUpdate && actionsUpdate.parentCommentID == 0) {
                //likes = actionsUpdate.likes
                //dislikes = actionsUpdate.dislikes
            }
        })
    })
    const formatTime = (date: Date): string => {
        return moment(date).format("HH:mm D.MM.YYYY")
        //date.toLocaleString('de-DE', {weekday: "long", year: "numeric", month:"numeric", day: "numeric"});
    }
</script>

<div class="container">
    <div class="center">
        <div class="imageContainer" style="background-image: url({headerImageURL});">
            <!-- <img src="build/Material/images/testImage.jpg"/> -->
        </div>
        <div class="metaDataContainer">

            <div class="time">
                <span>{formatTime(post?.time)}</span>
            </div>
            <div class="actionsContainer">
            </div>
        </div>
        <div class="header">
            <h2 class="title">{post?.title}</h2>
            <h3 class="lead">{post?.lead}</h3>
        </div>
        <div class="text">{post?.content}</div>
    </div>
</div>

<style lang="scss">
    @import "src/vars";
    
    .container {
        width: 100%;

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
            }

            .imageContainer {
                height: 40vw;
                max-height: 50vh;
                margin: 0.5rem 1rem;
                background-position: center center;
                background-size: cover;
                background-repeat: no-repeat;
                @media (max-width: $mid-bp) {
                    max-width: none;
                    width: 100%;
                    height: 12em;
                    margin: 0;
                }
                margin-right: 1em;
            }
            .header {
                margin: 0.5rem 1rem;
            }
            .metaDataContainer {
                margin: 0.5rem 1rem;
                display: flex;
                flex-direction: row;
                justify-content: space-between;

                .time {
                    font-size: small;
                    display: flex;
                    span {
                        align-self: center;
                    }
                }
                .actionsContainer {

                }
            }
            .text {
                margin: 1em;
            }
        }
    }
</style>
