<script lang="ts">
    import type { RoomData } from "../../../types/room.type";
    import type { UserExtended } from "../../../types/user.type";
	import { Router, Link, Route, navigate } from "svelte-routing";
    import { onMount } from "svelte";
    import store from "../../stores/store";
    import moment from "moment";

    export let url = "";
    let surveyLink = "survey";
    let user: UserExtended;
    let room: RoomData;
    let startTime, endTime
    
    onMount(() => {

        //navigate(surveyLink, {replace: true})
        store.userStore.subscribe((userData: UserExtended) => {
            user = userData
        })

        store.roomStore.subscribe((roomData: RoomData) => {
            if(roomData) {
                room = roomData
                console.log(room)
                startTime = new Date(room.startTime)
                console.log(startTime)
                endTime = new Date(startTime.getTime() + room.duration * 60 * 1000)
            }
        })

    })
    const formatTime = (date: Date): string => {
        return moment(date).format("D.MM.YYYY, HH:mm")
        //date.toLocaleString('de-DE', {weekday: "long", year: "numeric", month:"numeric", day: "numeric"});
    }

</script>

<div class="container">
    <h1>Experiment ended from chat room {room?.name}</h1>
    <h2>Your user Name is {user?.user?.name}</h2>
    <p>Room starts at: {formatTime(room?.startTime)}</p>
    <p>Room ends at: {formatTime(endTime)}</p>
    <p>
        Continue with the survey by clicking <a href={surveyLink}>here</a>
    </p>
</div>

<style lang="scss">
    @import "src/vars";

    .container {
        margin: 1em;
    }
</style>