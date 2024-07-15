<script lang="ts">
    import { onMount } from "svelte";
    import store from "../stores/store";
    import type { RoomData, Post } from "../../types/room.type";
    import moment from "moment";
    import type { ActionsUpdate } from "../../types/comment.type";

    let post: Post = null;
    $: headerImageURL = post?.imageName ? `../postImages/${post.imageName}` : null;

    onMount(() => {
        store.roomStore.subscribe((assignedRoom: RoomData) => {
            if (assignedRoom?.post) {
                post = assignedRoom.post;
            }
        });

        store.actionsStore.subscribe((actionsUpdate: ActionsUpdate) => {
            if (actionsUpdate && actionsUpdate.parentCommentID == 0) {
                // Update likes and dislikes if needed
            }
        });
    });

    const formatTime = (date: Date): string => {
        return moment(date).format("HH:mm D.MM.YYYY");
    };
</script>

<div class="container">
    <div class="center">
        {#if headerImageURL}
        <div class="imageContainer" style="background-image: url({headerImageURL});"></div>
        {/if}
        <div class="metaDataContainer">
            {#if post?.time}
            <div class="time">
                <span>{formatTime(post?.time)}</span>
            </div>
            {/if}
            <div class="actionsContainer">
                <!-- Actions like likes and dislikes can be added here -->
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
                    height: 12em;
                    margin: 0;
                }
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
                    // Actions styles
                }
            }

            .title {
                margin: 0.5rem 1rem;
                text-align: center;
            }

            .lead {
                margin: 0.5rem 1rem;
                font-weight: normal;
                text-align: justify;  
            }

            .text {
                margin: 1em;
            }
        }
    }
</style>
