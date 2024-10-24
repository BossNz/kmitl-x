<script lang="ts">
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";
  import Button from "./Button.svelte";

  let theme = "dark";

  onMount(() => {
    theme = localStorage.getItem("theme") || "dark";
    applyTheme(theme);
  });

  function applyTheme(theme: string) {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.add("dark");
    }

    localStorage.setItem("theme", theme);
  }

  function toggleTheme() {
    const newTheme = theme === "light" ? "dark" : "light";
    theme = newTheme;
    applyTheme(newTheme);
  }
</script>

<Button
  on:click={() => {
    toggleTheme();
  }}
>
  {theme == "dark" ? "light" : "dark"} mode
  <Icon
    icon={theme == "dark" ? "tdesign:mode-light" : "tdesign:mode-dark"}
    class="my-auto text-2xl inline"
  />
</Button>
