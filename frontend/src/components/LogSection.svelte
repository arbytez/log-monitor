<script>
  export let watchedLog;

  let logEntryElem = null;
  function scrollDown() {
    logEntryElem.scrollTop = logEntryElem.scrollHeight;
  }
</script>

<div class="notification">
  <h1 class="title">{watchedLog.name}</h1>
  <h2 class="subtitle">{watchedLog.path}</h2>
  <span class="log-counter">
    received rows:
    <span id={`log-counter-${watchedLog.name}`}>0</span>
    <div class="log-scroll-down" on:click={scrollDown}>scroll down</div>
  </span>
  <div
    id={`log-entry-${watchedLog.name}`}
    class="log-entry"
    bind:this={logEntryElem} />
</div>
