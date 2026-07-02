<script lang="ts">
  import PageShell from "../libs/components/common/PageShell.svelte";
  import PageHeader from "../libs/components/common/PageHeader.svelte";
  import Icon from "@iconify/svelte";
  import type { CheckRegis } from "../libs/types/check-regis.types";

  export let studentId: CheckRegis["studentId"] = "";
  export let name: CheckRegis["name"] = "";
  export let semester: CheckRegis["semester"] = "";
  export let statusMessage: CheckRegis["statusMessage"] = "";
  export let statusColor: CheckRegis["statusColor"] = "";
  export let registerUrl: CheckRegis["registerUrl"] = "";
  export let calendarUrl: CheckRegis["calendarUrl"] = "";
</script>

<PageShell>
  <PageHeader
    title="ตรวจสอบสิทธิ์การลงทะเบียน"
    lines={[`${studentId} ${name}`, `ภาคการศึกษา ${semester}`]}
  />

  <div
    class="mt-4 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 p-8 text-center"
  >
    <Icon
      icon="mdi:clipboard-check-outline"
      class="w-12 h-12 text-orange-500 mx-auto mb-3"
    />
    <p class="text-lg font-semibold" style:color={statusColor || undefined}>
      {statusMessage || "-"}
    </p>
  </div>

  <div class="mt-4 flex flex-wrap gap-3 justify-center">
    {#if registerUrl}
      <a
        href={registerUrl}
        class="rounded-xl bg-orange-500 text-white font-semibold px-5 py-2.5 hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
      >
        <Icon icon="mdi:pencil-plus" /> ไปหน้าลงทะเบียน
      </a>
    {/if}
    {#if calendarUrl}
      <a
        href={calendarUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="rounded-xl border dark:border-white/10 border-slate-200 font-semibold px-5 py-2.5 hover:border-orange-500/50 transition-colors inline-flex items-center gap-2"
      >
        <Icon icon="mdi:calendar-month" /> ปฏิทินการศึกษา
      </a>
    {/if}
  </div>
</PageShell>
