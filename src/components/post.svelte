<script lang="ts">
    import type { Comment, NewComment } from "../../types/message.type"
    import type { User, UserExtended } from "../../types/user.type";

</script>

<div class="container">
    <div class="imageContainer">
        <img src="https://cdn.unitycms.io/image/ocroped/1200,1200,1000,1000,0,0/sh5JMBwAe88/0L0QWRbyqFLA5IxEP-Hp3R.jpg"/>
    </div>
    <div class="header">
        <h2 class="title">Some post about something</h2>
        <h3 class="lead">Dauerregen hat im Westen Deutschlands Flüsse und Bäche in reissende Fluten verwandelt. Ein Mann sah, wie Häuser in seinem Dorf verschwanden, ein anderer weiss nicht, ob seine Kinder noch am Leben sind.</h3>
    </div>
    <div class="metaDataContainer">
        <div class="time">15.7.2021</div>
        <div class="likes">3 likes</div>
    </div>
    <div class="text">
        Die Wassermassen wälzen sich regelrecht durch die Strassen, ganze Orte versinken in braunen Fluten. Es sind unfassbare Bilder und Szenen, die sich am Donnerstag in der Eifel und in Teilen von Nordrhein-Westfalen abspielen. Das, was die meisten Menschen in Deutschland bislang nur aus weiter Ferne kannten, ist plötzlich ganz nah.

Ein Vater aus Altenburg im Landkreis Ahrweiler ist verzweifelt. Schon gestern, als es stark zu regnen begann, habe er bemerkt, dass der Pegel des sonst seichten Flusses kontinuierlich stieg, wie er der «Bild»-Zeitung erzählt. Am Abend habe er einen Anruf seiner Kinder bekommen, die sagten, es gebe bereits Hochwasser.
    </div>
</div>

<style lang="scss">
    @import "src/vars";
    
    .container {
        border: solid black 2px;
        width: 90%;
        
        display: flex;
        flex-direction: column;

        .imageContainer {
            width: 100%;
            img {
                width: 100%;
            }
        }
        .header {
            margin: 1em;
        }
        .metaDataContainer {
            margin: 1em;
            display: flex;
            flex-direction: row;
            justify-content: space-between;

            .time {
            }
            .likes {
            }
        }
        .text {
            margin: 1em;
        }
    }
</style>