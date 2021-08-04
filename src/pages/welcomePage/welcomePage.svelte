<script lang="ts">
    import type { RoomData } from "../../../types/room.type";
    import type { UserExtended } from "../../../types/user.type";
	import { Router, Link, Route } from "svelte-routing";
    import { onMount } from "svelte";
    import store from "../../stores/store";
import moment from "moment";

    export let url = "";
    let user: UserExtended;
    let room: RoomData;


    onMount(() => {
        store.userStore.subscribe((userData: UserExtended) => {
            user = userData
        })

        store.roomStore.subscribe((roomData: RoomData) => {
            room = roomData
        })

    })
    const formatTime = (date: Date): string => {
        return moment(date).format("D.MM.YYYY, HH:mm")
        //date.toLocaleString('de-DE', {weekday: "long", year: "numeric", month:"numeric", day: "numeric"});
    }

</script>

<div class="container">
    <h1>Welcome to chat room {room?.name}</h1>
    <h2>Your user Name is {user?.user?.name}</h2>
    <p>Room starts at: {formatTime(room?.startTime)}</p>
    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nulla dicta quibusdam, numquam eaque blanditiis nemo ipsa, iste provident qui quisquam sint, aut fugiat molestiae minima reiciendis cupiditate neque facilis repudiandae.</p>

    <Router url="{url}" >
        <Link to="room">
            <button>Start Chatting</button>
        </Link>
    </Router>
</div>

<style lang="scss">
    @import "src/vars";

    .container {
        margin: 1em;
    }
</style>