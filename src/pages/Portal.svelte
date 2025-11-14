<script lang="ts">
  import { onMount } from "svelte";
  import type { PortalScraperResult } from "../libs/types/portal.types";

  export let meta: PortalScraperResult["meta"] | undefined;
  export let sections: PortalScraperResult["sections"] | undefined;
  onMount(() => {
    console.log("meta:", meta);
    console.log("sections:", sections);
  });
</script>

<main>
  <pre>{JSON.stringify({ meta, sections }, null, 2)}</pre>
</main>
