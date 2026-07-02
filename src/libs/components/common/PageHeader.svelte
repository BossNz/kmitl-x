<script lang="ts">
  import KmitlLogo from "./KmitlLogo.svelte";

  export let title: string;
  export let lines: string[] = [];
</script>

<div
  class="dark:bg-orange-500/10 bg-orange-100/50 text-orange-500 rounded font-prompt px-4 py-4 border dark:border-orange-500/50 border-orange-200"
>
  <div class="flex justify-between items-center gap-4">
    <KmitlLogo class="w-40 my-auto shrink-0" />
    <div class="text-right my-auto">
      <h1 class="text-2xl font-bold">{title}</h1>
      {#each lines as line, i (line + i)}
        {#if line}
          <p class="text-sm">{line}</p>
        {/if}
      {/each}
    </div>
  </div>
</div>
