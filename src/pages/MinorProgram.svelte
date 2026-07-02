<script lang="ts">
  import PageShell from "../libs/components/common/PageShell.svelte";
  import PageHeader from "../libs/components/common/PageHeader.svelte";
  import MinorNav from "../libs/components/minor/MinorNav.svelte";
  import Icon from "@iconify/svelte";
  import type { MinorProgramData } from "../libs/types/minor-program.types";

  export let studentId: MinorProgramData["studentId"] = "";
  export let name: MinorProgramData["name"] = "";
  export let categories: MinorProgramData["categories"] = [];
</script>

<PageShell>
  <MinorNav />
  <PageHeader title="หลักสูตรวิชาโท" lines={[`${studentId} ${name}`]} />

  <div class="mt-4 space-y-4">
    {#each categories as cat, ci (cat.category + ci)}
      <div>
        {#if cat.category}
          <h2 class="text-sm font-semibold text-orange-500 mb-2">
            {cat.category}
          </h2>
        {/if}
        <div class="grid gap-2 sm:grid-cols-2">
          {#each cat.items as item, ii (item.url + ii)}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-3 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 px-4 py-3 hover:border-orange-500/50 transition-colors"
            >
              <Icon
                icon="ph:file-pdf-light"
                class="text-2xl text-orange-500 shrink-0"
              />
              <span class="text-sm">{item.name}</span>
            </a>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  {#if categories.length === 0}
    <p class="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
      ไม่พบหลักสูตร
    </p>
  {/if}
</PageShell>
