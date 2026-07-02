<script lang="ts">
  import PageShell from "../libs/components/common/PageShell.svelte";
  import PageHeader from "../libs/components/common/PageHeader.svelte";
  import type { MidtermScore } from "../libs/types/midterm-score.types";

  export let studentInfo: MidtermScore["studentInfo"];
  export let midtermScores: MidtermScore["midtermScores"] = [];
  export let note: MidtermScore["note"] = "";
  export let scoreSymbols: MidtermScore["scoreSymbols"] = [];
</script>

<PageShell>
  <PageHeader
    title={`คะแนนกลางภาค ${studentInfo.semester}/${studentInfo.year}`}
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
          <th class="px-3 py-2 text-center font-medium">คะแนน 1</th>
          <th class="px-3 py-2 text-center font-medium">คะแนน 2</th>
          <th class="px-3 py-2 text-center font-medium">คะแนน 3</th>
          <th class="px-3 py-2 text-center font-medium">คะแนน 4</th>
        </tr>
      </thead>
      <tbody>
        {#each midtermScores as subject (subject.subjectCode + subject.section)}
          <tr class="border-t dark:border-white/10 border-slate-200">
            <td class="px-3 py-2 font-medium text-orange-500">
              {subject.subjectCode}
            </td>
            <td class="px-3 py-2">{subject.subjectName}</td>
            <td class="px-3 py-2 text-center">{subject.section}</td>
            {#each subject.scores as score, si (si)}
              <td class="px-3 py-2 text-center">{score}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if note}
    <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
      หมายเหตุ: {note}
    </p>
  {/if}

  {#if scoreSymbols.length}
    <div
      class="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 dark:text-slate-400"
    >
      {#each scoreSymbols as sym, i (sym.symbol + i)}
        <span
          ><span class="font-semibold text-orange-500">{sym.symbol}</span> =
          {sym.description}</span
        >
      {/each}
    </div>
  {/if}
</PageShell>
