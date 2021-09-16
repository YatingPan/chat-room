<script lang="ts">
    import type { RoomData } from "../../../types/room.type";
    import type { UserExtended } from "../../../types/user.type";
	import { Router, Link, Route, navigate } from "svelte-routing";
    import { onMount } from "svelte";
    import store from "../../stores/store";
    import moment from "moment";
    import { writable } from "svelte/store";

    // export let url = "";
    let user: UserExtended;
    let room: RoomData;
    let startTime;
    let endTime;
    const countdown = writable(0);

    var countdownfunc = setInterval(() => {
        countdown.set(Math.floor((startTime - Date.now()) / 1000));

        if($countdown < -3) {
            condRedirect()
        }
    }, 1000);
    
    $: roomAccessible = $countdown < 0
    
    onMount(() => {
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
    const condRedirect = () => {
        console.log("trying redirect", startTime, Date.now())
        if(startTime.getTime() < Date.now()) {
            console.log("redirecting to room")
            navigate(`/${user.accessCode}/room`, { replace: true})
            clearInterval(countdownfunc)
        }
    }
    const formatTime = (date: Date): string => {
        return moment(date).format("D.MM.YYYY, HH:mm")
        //date.toLocaleString('de-DE', {weekday: "long", year: "numeric", month:"numeric", day: "numeric"});
    }

</script>

<svelte:head>
    <title>Welcome</title>
</svelte:head>

<div class="container">
    <h1>Welcome to {room?.name}</h1>
    <h2>Your user name is: <bold>{user?.user?.name}</bold></h2>
    <p>Room starts at: {formatTime(room?.startTime)}</p>
    <p>Room ends at: {formatTime(endTime)}</p>

    {#if !roomAccessible}
        <p>You can enter in {$countdown}.</p> 
    {/if}

    {#if roomAccessible}
        <button on:click="{(e) => condRedirect()}">Start Chatting</button>
    {/if}

</div>

<style lang="scss">
    @import "src/vars";

    .container {
        margin: 1em;
        min-height: 90vh;
    }
</style>