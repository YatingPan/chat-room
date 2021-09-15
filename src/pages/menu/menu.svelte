<script>
	import { Router, Link, Route } from "svelte-routing";

    // xport let url = "";
    export let seiten;
    const items = Object.keys(seiten).map(key => [seiten[key]["slug"], seiten[key]["hauptTitel"], seiten[key]["unterTitel"]])

</script>

<div id="content" lang="ts">
    <div id="static-menu">
        <Router url="{url}">
            <ul>
                {#each items as [slug, title, subTitle], i}
                    <li>
                        <Link to="portfolio/{slug}">
                            <span class="menlobold20pt">{title} </span>
                            <span class="happytimes20pt">– {subTitle}</span>
                        </Link>
                    </li>
                {/each}
            </ul>
        </Router>
    </div>
    <div id="mooving-menu">
        <Router url="{url}">
            {#each items as [slug, title, subTitle], i}
                <div class="text-marquee">
                    <div class="marquee">
                        <div class="marquee__inner" aria-hidden="true">
                            
                            {#each Array(Math.ceil(100/(title.length + subTitle.length))) as _ }
                                <div>
                                    <Link to="portfolio/{slug}">
                                        <span class="menlobold20pt">{title} </span>
                                        <span class="happytimes20pt">– {subTitle}</span>
                                    </Link>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            {/each}
        </Router>
    </div>
</div>

<style lang="scss">
    @import "src/vars";
    #static-menu {
        display: none;
        @media only screen and (max-width: $mid-bp) {
            display: none
        }
        ul{
            list-style: none;
            padding-left: 4em;
            margin-top: 2em; 

            li {
                margin:0mm;
                padding-left: 4px;
                span {
                    cursor: $cursor;
                }
            }
        }
    }

    #mooving-menu {
        // @media only screen and (min-width: $mid-bp) {
        //     display: none
        // }    
        
        overflow: hidden;
        width: 100vw;
        margin-top: 2em;

        .marquee {
            position: relative;
            overflow: hidden;
            --offset: 0vw;
            --move-initial: calc(-25% + var(--offset));
            --move-final: calc(-50% + var(--offset));

            .marquee__inner {
                width: fit-content;
                display: flex;
                position: relative;
                transform: translate3d(var(--move-initial), 0, 0);
                animation: marquee 10s linear infinite;
                
                div {
                    display: flex;
                    align-items: center;
                    white-space: nowrap;
                    font-family: Cousine;
                    padding: 0 0.5em;
                    color: $haupt-farbe;
                    span {
                        font-size: 50px;
                        cursor: $cursor;
                    }
                }
            }
            .marquee__inner:hover {
                animation-play-state: paused;
            }
        }
    }
    .menlobold20pt{
        font-size: 5.5vw;
        color: $haupt-farbe;
        font-family: Cousine;
        font-weight: 1000;
    }

    .happytimes20pt{
        font-size: 5vw;
        color: $haupt-farbe;
        font-family: happytimes;
    }
</style>