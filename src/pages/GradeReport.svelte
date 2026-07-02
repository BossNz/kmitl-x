<script lang="ts">
  import PageShell from "../libs/components/common/PageShell.svelte";
  import PageHeader from "../libs/components/common/PageHeader.svelte";
  import Icon from "@iconify/svelte";
  import type { ReportGradeTable } from "../libs/types/report-gradetable.types";

  export let studentInfo: ReportGradeTable["studentInfo"];
  export let gradeTable: ReportGradeTable["gradeTable"] = [];
  export let gradeSummary: ReportGradeTable["gradeSummary"];
  export let gradeSymbol: ReportGradeTable["gradeSymbol"];
  export let pdf: ReportGradeTable["pdf"] = "";

  $: summaryRows = gradeSummary
    ? [
        { label: "ภาคเรียนนี้", data: gradeSummary.semesterSummary },
        { label: "ภาคเรียนก่อน", data: gradeSummary.preSemester },
        { label: "สะสม", data: gradeSummary.cumulation },
      ]
    : [];
</script>

<PageShell>
  <PageHeader
    title={`ผลการเรียน ${studentInfo.semester}/${studentInfo.year}`}
    lines={[
      `${studentInfo.studentId} ${studentInfo.thaiName}`,
      `คณะ${studentInfo.faculty}`,
      studentInfo.curriculum,
    ]}
  />

  <div
    class="mt-4 overflow-x-auto rounded-2xl border dark:border-white/10 border-slate-200"
  >
    <table class="w-full text-sm">
      <thead
        class="dark:bg-white/5 bg-slate-100 text-slate-500 dark:text-slate-400"
      >
        <tr>
          <th class="px-3 py-2 text-left font-medium">รหัสวิชา</th>
          <th class="px-3 py-2 text-left font-medium">ชื่อวิชา</th>
          <th class="px-3 py-2 text-center font-medium">กลุ่ม</th>
          <th class="px-3 py-2 text-center font-medium">หน่วยกิต</th>
          <th class="px-3 py-2 text-center font-medium">เกรด</th>
        </tr>
      </thead>
      <tbody>
        {#each gradeTable as row, i (row.subjectCode + "-" + i)}
          <tr class="border-t dark:border-white/10 border-slate-200">
            <td class="px-3 py-2 font-medium text-orange-500">
              {row.subjectCode}
            </td>
            <td class="px-3 py-2">{row.subjectName}</td>
            <td class="px-3 py-2 text-center">{row.section}</td>
            <td class="px-3 py-2 text-center">{row.credit}</td>
            <td
              class="px-3 py-2 text-center font-semibold"
              style:color={row.gradeColor || undefined}
            >
              {row.grade}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if summaryRows.length}
    <div
      class="mt-4 overflow-x-auto rounded-2xl border dark:border-white/10 border-slate-200"
    >
      <table class="w-full text-sm">
        <thead
          class="dark:bg-white/5 bg-slate-100 text-slate-500 dark:text-slate-400"
        >
          <tr>
            <th class="px-3 py-2 text-left font-medium"></th>
            <th class="px-3 py-2 text-center font-medium">CA</th>
            <th class="px-3 py-2 text-center font-medium">CP</th>
            <th class="px-3 py-2 text-center font-medium">CD</th>
            <th class="px-3 py-2 text-center font-medium">GP</th>
            <th class="px-3 py-2 text-center font-medium">GPA</th>
            <th class="px-3 py-2 text-center font-medium">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {#each summaryRows as s, i (s.label + i)}
            <tr class="border-t dark:border-white/10 border-slate-200">
              <td class="px-3 py-2 font-medium">{s.label}</td>
              <td class="px-3 py-2 text-center">{s.data.ca || "-"}</td>
              <td class="px-3 py-2 text-center">{s.data.cp || "-"}</td>
              <td class="px-3 py-2 text-center">{s.data.cd || "-"}</td>
              <td class="px-3 py-2 text-center">{s.data.gp || "-"}</td>
              <td class="px-3 py-2 text-center font-semibold text-orange-500">
                {s.data.gpsGpa || "-"}
              </td>
              <td class="px-3 py-2 text-center">{s.data.status || "-"}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  {#if gradeSymbol && gradeSymbol.symbols.length}
    <div
      class="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 dark:text-slate-400"
    >
      {#each gradeSymbol.symbols as sym, i (sym.symbol + i)}
        <span
          ><span class="font-semibold" style:color={sym.color || undefined}
            >{sym.symbol}</span
          > = {sym.description}</span
        >
      {/each}
    </div>
  {/if}

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
