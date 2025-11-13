<script lang="ts">
  import { onMount } from "svelte";

  export let data: any;

  onMount(async () => {
    console.log("Portal page mounted");
  });
</script>
<main>
  <h1>Welcome to the Portal Page</h1>
  <p>This is the portal page content.</p>
  <pre>{JSON.stringify(data, null, 2)}</pre>
</main>