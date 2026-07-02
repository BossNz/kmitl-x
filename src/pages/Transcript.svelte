<script lang="ts">
  import PageShell from "../libs/components/common/PageShell.svelte";
  import PageHeader from "../libs/components/common/PageHeader.svelte";
  import Icon from "@iconify/svelte";
  import type { TranscriptData } from "../libs/types/report-transcript.types";

  export let studentInfo: TranscriptData["studentInfo"];
  export let transcriptObject: TranscriptData["transcriptObject"];
  export let pdf: TranscriptData["pdf"] = "";

  $: birth = studentInfo?.dateOfBirth;
  $: issued = transcriptObject?.dateIssued;
</script>

<PageShell>
  <PageHeader
    title="ทรานสคริปต์"
    lines={[
      `${studentInfo.studentId} ${studentInfo.name}`,
      studentInfo.degree,
      studentInfo.major,
    ]}
  />

  <div class="grid gap-4 sm:grid-cols-2 mt-4">
    <div
      class="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 p-6 text-center"
    >
      <p class="text-sm text-slate-500 dark:text-slate-400">หน่วยกิตสะสม</p>
      <p class="text-4xl font-bold text-orange-500 mt-1">
        {transcriptObject.totalCredits}
      </p>
    </div>
    <div
      class="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 p-6 text-center"
    >
      <p class="text-sm text-slate-500 dark:text-slate-400">
        เกรดเฉลี่ยสะสม (GPAX)
      </p>
      <p class="text-4xl font-bold text-orange-500 mt-1">
        {transcriptObject.cumulativeGPA.toFixed(2)}
      </p>
    </div>
  </div>

  <div
    class="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 p-5 mt-4"
  >
    <dl class="space-y-2 text-sm">
      <div class="flex justify-between gap-4">
        <dt class="text-slate-500 dark:text-slate-400">วันเกิด</dt>
        <dd class="font-medium">
          {birth ? `${birth.day} ${birth.month} ${birth.year}` : "-"}
        </dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-slate-500 dark:text-slate-400">วันที่เข้าศึกษา</dt>
        <dd class="font-medium">{studentInfo.dateOfAdmission || "-"}</dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-slate-500 dark:text-slate-400">วันที่สำเร็จการศึกษา</dt>
        <dd class="font-medium">{studentInfo.dateOfGraduation || "-"}</dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-slate-500 dark:text-slate-400">วันที่ออกเอกสาร</dt>
        <dd class="font-medium">
          {issued && issued.month
            ? `${issued.month} ${issued.day}, ${issued.year}`
            : "-"}
        </dd>
      </div>
    </dl>
  </div>

  <svelte:fragment slot="actions">
    {#if pdf}
      <a
        href={pdf}
        target="_blank"
        rel="noopener noreferrer"
        class="rounded-lg py-1 px-3 bg-orange-500/10 text-orange-500 text-xs hover:scale-105 transition-all inline-flex items-center gap-1"
      >
        <Icon icon="ph:file-pdf-light" class="text-2xl inline" />
        <span class="font-semibold">เปิด PDF</span>
      </a>
    {/if}
  </svelte:fragment>
</PageShell>
