<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import { getTheme, setTheme } from "../../utils/themeManager";
  import Button from "./Button.svelte";

  let theme: "light" | "dark" = "dark";

  onMount(() => {
    theme = getTheme();
    setTheme(theme);
  });

  function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
    setTheme(theme);
  }
</script>

<main
  class="min-h-screen p-3 flex flex-col dark:bg-gray-900 bg-white font-prompt dark:text-white text-gray-900"
>
  <div class="max-w-5xl w-full mx-auto flex-1">
    <slot />
  </div>

  <footer class="max-w-5xl w-full mx-auto flex justify-between items-end mt-6">
    <div class="space-x-2">
      <slot name="actions" />
      <Button on:click={toggleTheme}>
        <Icon
          icon={theme === "dark" ? "ph:sun-duotone" : "ph:moon-duotone"}
          class="my-auto text-2xl inline"
        />
        <span class="font-semibold">{theme === "dark" ? "Light" : "Dark"}</span>
      </Button>
    </div>
    <div class="mt-auto text-right text-xs text-orange-300">
      <p class="opacity-75">KMITL X</p>
    </div>
  </footer>
</main>
