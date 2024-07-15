<script lang="ts">
    import type { RoomData } from "../../../types/room.type";
    import type { UserExtended } from "../../../types/user.type";
    import { onMount } from "svelte";
    import store from "../../stores/store";

    let user: UserExtended;
    let room: RoomData;
    let surveyLink: string;

    onMount(() => {
        store.userStore.subscribe((userData: UserExtended) => {
            user = userData;
        });

        store.roomStore.subscribe((roomData: RoomData) => {
            if (roomData) {
                room = roomData;
                const startTime = new Date(room.startTime);
                const endTime = new Date(startTime.getTime() + room.duration * 60 * 1000);
                surveyLink = `${room.outboundLink}?PROLIFIC_PID=${user?.user?.prolificPid}&STUDY_ID=${user?.user?.studyId}&SESSION_ID=${user?.user?.sessionId}`;

                // Redirect immediately
                window.location.href = surveyLink;
            }
        });
    });
</script>

<svelte:head>
    <title>Checkout</title>
</svelte:head>

<style lang="scss">
    @import "src/vars";

    .container {
        margin: 1em;
        min-height: 90vh;
    }
</style>
