<script lang="ts">
  import PageShell from "../libs/components/common/PageShell.svelte";
  import PageHeader from "../libs/components/common/PageHeader.svelte";
  import MinorNav from "../libs/components/minor/MinorNav.svelte";
  import type { MinorData } from "../libs/types/minor.types";

  export let studentId: MinorData["studentId"] = "";
  export let name: MinorData["name"] = "";
  export let events: MinorData["events"] = [];
</script>

<PageShell>
  <MinorNav />
  <PageHeader title="หลักสูตรวิชาโท" lines={[`${studentId} ${name}`]} />

  <div
    class="mt-4 overflow-x-auto rounded-2xl border dark:border-white/10 border-slate-200"
  >
    <table class="w-full text-sm">
      <thead
        class="dark:bg-white/5 bg-slate-100 text-slate-500 dark:text-slate-400"
      >
        <tr>
          <th class="px-4 py-2 text-left font-medium">รายละเอียด</th>
          <th class="px-4 py-2 text-left font-medium">กำหนดการ</th>
        </tr>
      </thead>
      <tbody>
        {#each events as event, i (event.description + i)}
          <tr class="border-t dark:border-white/10 border-slate-200">
            <td class="px-4 py-2">{event.description}</td>
            <td class="px-4 py-2">{event.schedule}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if events.length === 0}
    <p class="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
      ไม่พบข้อมูลกำหนดการ
    </p>
  {/if}
</PageShell>
