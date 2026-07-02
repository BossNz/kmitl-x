<script lang="ts">
  export let title: string;
  export let lines: string[] = [];
</script>

<div
  class="dark:bg-orange-500/10 bg-orange-100/50 text-orange-500 rounded font-prompt px-4 py-4 border dark:border-orange-500/50 border-orange-200"
>
  <div class="flex justify-between items-center gap-4">
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/KMITL_Sublogo.svg/1024px-KMITL_Sublogo.svg.png"
      alt="KMITL logo"
      class="w-40 my-auto"
    />
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
