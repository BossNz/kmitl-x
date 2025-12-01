<script lang="ts">
  import { onMount } from "svelte";
  import type { PortalScraperResult } from "../libs/types/portal.types";
  import { getTheme, setTheme } from "../libs/utils/themeManager";

  export let meta: PortalScraperResult["meta"];
  export let sections: PortalScraperResult["sections"];

  let theme: "light" | "dark" = "dark";

  onMount(() => {
    theme = getTheme();
    setTheme(theme);
    console.log(meta, sections);
  });

  function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
    setTheme(theme);
  }
</script>

<main>
  <!-- Page Content -->
  <div>
    <!-- Sidebar -->
    <aside>
      <!-- Header with Logo -->
      <div></div>

      <!-- Navigation -->
      <div>
        <!-- Home Button -->
        <div></div>

        <!-- Highlights Items -->
        <div></div>

        <!-- Menu Items -->
        <div></div>
      </div>

      <!-- Sidebar Footer -->
      <div>
        <!-- Mode Switcher -->
        <div></div>

        <!-- Credit & Version -->
        <div>
          <!-- Credit -->
          <div></div>

          <!-- Version -->
          <div></div>
        </div>
      </div>
    </aside>

    <!-- Main Section -->
    <section>
      <!-- Container -->
      <div>
        <!-- Header -->
        <div>
          <!-- Breadcrumb and Title -->
          <div>
            <!-- Breadcrumb -->
            <div></div>

            <!-- Title -->
            <div></div>
          </div>

          <!-- Buttons and Profile -->
          <div>
            <!-- Server Time -->
            <div></div>

            <!-- Buttons -->
            <div></div>

            <!-- Profile -->
            <div>
              <!-- On Screen -->
              <div></div>

              <!-- Hover -->
              <div></div>
            </div>
          </div>
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
