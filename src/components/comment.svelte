<script lang="ts">
    import moment from "moment";
    import type { Comment } from "../../types/message.type"

    export let comment: Comment

    const formatTime = (date: Date): string => {
        return moment(date).format("Do MMMM YY, h:mm")
        //date.toLocaleString('de-DE', {weekday: "long", year: "numeric", month:"numeric", day: "numeric"});
    }
</script>

<div class="comment">
    <div class="profileImage">
        
    </div>
    <div class="userName">{comment.user.name}</div>
    <div class="time">{formatTime(comment?.time)}</div>
    <div class="text">{comment.content}</div>
    <div class="replies">
        
    </div>


</div>

<style lang="scss">
    @import "src/vars";
    
</style>