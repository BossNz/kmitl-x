<script lang="ts">
  import Icon from "@iconify/svelte";
  import { GRADE_OPTIONS, computeGpa, gradePoint } from "../../utils/gpa";
  import type {
    GradeSummaryTable,
    GradeTableObject,
  } from "../../types/report-gradetable.types";

  export let gradeTable: GradeTableObject[] = [];
  export let gradeSummary: GradeSummaryTable;

  interface Row {
    id: number;
    name: string;
    credit: number;
    grade: string;
    fixed: boolean;
  }

  let nextId = 0;

  // Seed the calculator with the courses that carry a letter grade.
  function initialRows(): Row[] {
    nextId = 0;
    return gradeTable
      .filter((c) => gradePoint(c.grade) !== null)
      .map((c) => ({
        id: nextId++,
        name: c.subjectName,
        credit: c.credit,
        grade: c.grade.trim().toUpperCase(),
        fixed: true,
      }));
  }

  let rows: Row[] = initialRows();

  // Prior cumulative, derived from the previous-semester summary. Deriving
  // credits from gradePoints / gpa avoids guessing which CA/CP/CD column counts.
  $: priorGradePoints = parseFloat(gradeSummary?.preSemester?.gp ?? "") || 0;
  $: priorGpa = parseFloat(gradeSummary?.preSemester?.gpsGpa ?? "") || 0;
  $: priorCredits = priorGpa > 0 ? priorGradePoints / priorGpa : 0;

  $: semester = computeGpa(rows);
  $: totalCredits = priorCredits + semester.credits;
  $: projectedGpax =
    totalCredits > 0
      ? (priorGradePoints + semester.gradePoints) / totalCredits
      : 0;

  $: actualGpax = parseFloat(gradeSummary?.cumulation?.gpsGpa ?? "") || 0;
  $: gpaxDelta = projectedGpax - actualGpax;

  function addCourse() {
    rows = [
      ...rows,
      { id: nextId++, name: "วิชาใหม่", credit: 3, grade: "A", fixed: false },
    ];
  }

  function removeCourse(id: number) {
    rows = rows.filter((r) => r.id !== id);
  }

  function reset() {
    rows = initialRows();
  }

  const fieldClass =
    "rounded-lg border dark:border-white/10 border-slate-200 dark:bg-gray-900 bg-white px-2 py-1 text-sm";
</script>

<div
  class="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 p-5"
>
  <div class="flex items-center justify-between mb-3">
    <h2
      class="text-sm font-semibold text-orange-500 flex items-center gap-2"
    >
      <Icon icon="mdi:calculator-variant-outline" class="text-lg" /> คำนวณเกรด (What-if)
    </h2>
    <button
      on:click={reset}
      class="text-xs text-slate-400 hover:text-orange-500 transition-colors"
    >
      รีเซ็ต
    </button>
  </div>

  <div class="grid grid-cols-2 gap-3 mb-4">
    <div
      class="rounded-xl border dark:border-white/10 border-slate-200 p-3 text-center"
    >
      <p class="text-xs text-slate-400">GPA เทอมนี้</p>
      <p class="text-2xl font-bold text-orange-500">
        {semester.gpa.toFixed(2)}
      </p>
    </div>
    <div
      class="rounded-xl border dark:border-white/10 border-slate-200 p-3 text-center"
    >
      <p class="text-xs text-slate-400">GPAX สะสม (คาดการณ์)</p>
      <p class="text-2xl font-bold text-orange-500">
        {projectedGpax.toFixed(2)}
      </p>
      {#if actualGpax}
        <p
          class="text-xs {gpaxDelta >= 0 ? 'text-green-500' : 'text-red-500'}"
        >
          {gpaxDelta >= 0 ? "+" : ""}{gpaxDelta.toFixed(2)} จาก {actualGpax.toFixed(
            2
          )}
        </p>
      {/if}
    </div>
  </div>

  <div class="space-y-2">
    {#each rows as row, i (row.id)}
      <div class="flex items-center gap-2">
        {#if row.fixed}
          <span class="flex-1 text-sm truncate" title={row.name}
            >{row.name}</span
          >
        {:else}
          <input bind:value={rows[i].name} class="flex-1 {fieldClass}" />
        {/if}
        <input
          type="number"
          bind:value={rows[i].credit}
          min="0"
          step="1"
          aria-label="หน่วยกิต"
          class="w-16 text-center {fieldClass}"
        />
        <select
          bind:value={rows[i].grade}
          aria-label="เกรด"
          class="w-20 {fieldClass}"
        >
          {#each GRADE_OPTIONS as g (g)}
            <option value={g}>{g}</option>
          {/each}
        </select>
        {#if row.fixed}
          <span class="w-6"></span>
        {:else}
          <button
            on:click={() => removeCourse(row.id)}
            aria-label="ลบวิชา"
            class="w-6 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Icon icon="mdi:close" />
          </button>
        {/if}
      </div>
    {/each}
  </div>

  <button
    on:click={addCourse}
    class="mt-3 text-xs text-orange-500 hover:underline flex items-center gap-1"
  >
    <Icon icon="mdi:plus" /> เพิ่มวิชา
  </button>
</div>
