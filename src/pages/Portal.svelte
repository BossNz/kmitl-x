<script lang="ts">
  import { onMount } from "svelte";
  import type { PortalScraperResult } from "../libs/types/portal.types";

  export let meta: PortalScraperResult["meta"] | undefined;
  export let sections: PortalScraperResult["sections"] | undefined;

  onMount(async () => {
    console.log("Portal page mounted with data:", meta);
  });
</script>

<main>
  <h1>Welcome to the Portal Page</h1>
  <p>This is the portal page content.</p>
  <pre>{JSON.stringify({ meta, sections }, null, 2)}</pre>
</main>
