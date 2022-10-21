<svelte:head>
    <title>CheckoutRefresh</title>
</svelte:head>


<div class="container">
    <h1>Experiment ended because you refreshed the page</h1>
    <p>You were instructed to not refresh the page. Since you refreshed, the survey has been terminated. You will not be compensated</p>
    <p>You can close the window</p>
</div>

<style lang="scss">
  @import "src/vars";

  .container {
    margin: 1em;
    min-height: 90vh;
  }
</style>
