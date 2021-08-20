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
    <h1>Thank you for participating in this part of the study.</h1>
    <h2>Your user name is {user?.user?.name}. Your exit-code is ...</h2>
    <p>When clicking 'Continue', you will be redirected to a questionnaire which forms the next part of this study. If prompted, please provide your exit-code in the next part. </p>

    <Router url="{url}" >
        <Link to="/checkout">
            <button>Continue</button>
        </Link>
    </Router>
</div>

<style lang="scss">
    @import "src/vars";

    .container {
        margin: 1em;
    }
</style>