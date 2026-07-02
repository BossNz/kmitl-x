<script lang="ts">
  import PageShell from "../libs/components/common/PageShell.svelte";
  import PageHeader from "../libs/components/common/PageHeader.svelte";
  import MinorNav from "../libs/components/minor/MinorNav.svelte";
  import Icon from "@iconify/svelte";
  import type { MinorNewsData } from "../libs/types/minor-news.types";

  export let studentId: MinorNewsData["studentId"] = "";
  export let name: MinorNewsData["name"] = "";
  export let news: MinorNewsData["news"] = [];
</script>

<PageShell>
  <MinorNav />
  <PageHeader title="ประกาศหลักสูตรวิชาโท" lines={[`${studentId} ${name}`]} />

  <div class="mt-4 space-y-2">
    {#each news as item, i (item.url + i)}
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-between gap-4 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 px-4 py-3 hover:border-orange-500/50 transition-colors"
      >
        <div class="min-w-0">
          <p class="text-sm font-medium truncate">{item.title}</p>
          {#if item.date}
            <p class="text-xs text-slate-400 mt-0.5">{item.date}</p>
          {/if}
        </div>
        <span
          class="shrink-0 inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"
        >
          <Icon icon="mdi:eye-outline" />
          {item.count}
        </span>
      </a>
    {/each}
  </div>

  {#if news.length === 0}
    <p class="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
      ไม่พบประกาศ
    </p>
  {/if}
</PageShell>
