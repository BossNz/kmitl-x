<script lang="ts">
  import PageShell from "../libs/components/common/PageShell.svelte";
  import PageHeader from "../libs/components/common/PageHeader.svelte";
  import type { OwnersubjwebData } from "../libs/types/ownersubjweb.types";

  export let semester: OwnersubjwebData["semester"] = "";
  export let year: OwnersubjwebData["year"] = "";
  export let headings: OwnersubjwebData["headings"] = [];
  export let subjects: OwnersubjwebData["subjects"] = [];
</script>

<PageShell>
  <PageHeader
    title={`รายวิชาที่เปิดสอน ${semester}/${year}`}
    lines={headings}
  />

  <div class="mt-4 space-y-2">
    {#each subjects as subject (subject.code + subject.name)}
      <a
        href={subject.url}
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-between gap-4 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 px-4 py-3 hover:border-orange-500/50 transition-colors"
      >
        <div class="min-w-0">
          <span class="font-mono font-semibold text-orange-500"
            >{subject.code}</span
          >
          <span class="ml-2 text-sm">{subject.name}</span>
        </div>
        <span
          class="shrink-0 text-xs rounded-full bg-orange-500/10 text-orange-500 px-2.5 py-1"
          >{subject.credit}</span
        >
      </a>
    {/each}
  </div>

  {#if subjects.length === 0}
    <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
      ไม่พบรายวิชา
    </p>
  {/if}
</PageShell>
