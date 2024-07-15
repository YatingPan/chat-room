<script lang="ts">
	import { Router, Route } from "svelte-routing";
    import ChatRoom from "./pages/chatRoom/chatRoom.svelte";
    import WelcomePage from "./pages/welcomePage/welcomePage.svelte";
    import Post from "./components/post.svelte";
    import CheckoutPage from "./pages/checkoutPage/checkoutPage.svelte";
    import CheckoutOnRefresh from "./pages/checkoutPage/checkoutOnRefresh.svelte"

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
			<Route path="/:accessCode/checkout" let:params>
                <!-- <span>access code: {params.accessCode} </span> -->
				<CheckoutPage/>
			</Route>
            <Route path="/:accessCode/checkoutOnRefresh" let:params>
                <!-- <span>access code: {params.accessCode} </span> -->
                <CheckoutOnRefresh/>
            </Route>
        </Router>

    </div>

    <footer class="footer">
        <span>Discussion Room 2024; &copy; University of Zürich </span>
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
