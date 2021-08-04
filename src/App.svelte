<script lang="ts">
	import { Router, Route } from "svelte-routing";
    import ChatRoom from "./pages/chatRoom/chatRoom.svelte";
    import WelcomePage from "./pages/welcomePage/welcomePage.svelte";
    import Post from "./components/post.svelte";

	export let url = "";
    
</script>
<main>

	<div class="content">
        <Router url="{url}" >
			<Route path="/:accessCode/room"let:params>
                <!-- <span>access code: {params.accessCode} </span> -->
                <Post></Post> 
				 <ChatRoom/>
			</Route>
			<Route path="/:accessCode" let:params>
                <!-- <span>access code: {params.accessCode} </span> -->
				<WelcomePage/>
			</Route>
		</Router>

    </div>

    <footer class="footer">
        <span>Chat Room &copy; 2021 </span>
    </footer>
   
</main>

<style lang="scss">

    @import "vars";

    :global(a) {
        text-decoration: none;
    }
    :global(body) { 
        margin: 0;
        padding: 0;
    }

    footer {
        margin: 1rem;
    }
</style>