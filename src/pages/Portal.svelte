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
  <div>
    <!-- Sidebar -->
    <aside>
      <div>
        <!-- Header with Logo -->
        <div></div>

        <!-- Sidebar Content -->
        <div>
          <!-- Highlights Items -->
          <div></div>

          <!-- Menu Items -->
          <div></div>
        </div>

        <!-- Home Button -->
        <div></div>
      </div>
    </aside>

    <!-- Main Section -->
    <section>
      <div>
        <!-- Header -->
        <div>
          <!-- Title -->
          <div></div>

          <!-- Buttons -->
          <div></div>
        </div>

        <!-- Container -->
        <div>
          <!-- Header -->
          <div>
            <!-- Title -->
            <div></div>

            <!-- Button -->
            <div></div>
          </div>

          <!-- Content -->
          <div></div>
        </div>
      </div>
    </section>
  </div>
</main>
