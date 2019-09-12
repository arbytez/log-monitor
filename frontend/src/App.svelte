<script>
  import "bulma/css/bulma.css";
  import { Router, Route } from "svero";

  import index from "./pages/index.svelte";
</script>

<Router>
  <Route path="/" component={index} />
  <!-- <Route path="*" component={index} /> -->
</Router>
