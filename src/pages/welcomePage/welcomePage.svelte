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
    let countdown = 10;
    let interval
    
    $: roomAccessible = countdown < 0
    
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
                
                interval = setInterval(() => {
                    countdown = Math.max(countdown-1, 0)

                    if(countdown <= 0) {
                        condRedirect()
                    }
                }, 1000);
            }
        })


    })
    const condRedirect = () => {
        console.log("trying redirect", startTime, Date.now())
        if(startTime.getTime() < Date.now()) {
            console.log("redirecting to room")
            navigate(`/${user.accessCode}/room`, { replace: true})
            clearInterval(interval)
        }
    }
    const formatTime = (date: Date): string => {
        return moment(date).format("D.MM.YYYY, HH:mm")
        //date.toLocaleString('de-DE', {weekday: "long", year: "numeric", month:"numeric", day: "numeric"});
    }

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

    $: seconds_countDown = secondsToDhms(countdown)
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
        <p>You can enter in {seconds_countDown}.</p> 
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