<script lang="ts">
  import Icon from "@iconify/svelte";
  import type { 
    ScoreboardHeader, 
    ScoreCourse, 
    ScoreLegendItem,
    ScheduleOption 
  } from "../../utils/PortalContentMapper";
  import { classes, cn } from '../../styles';
  import { Button, Loading } from '../common';

  export let actionUrl: string = "";
  export let years: ScheduleOption[] = [];
  export let semesters: ScheduleOption[] = [];
  export let selectedYear: string = "";
  export let selectedSemester: string = "";
  export let header: ScoreboardHeader | undefined = undefined;
  export let assessments: string[] = [];
  export let courses: ScoreCourse[] = [];
  export let legend: ScoreLegendItem[] = [];
  export let note: string = "";

  let currentYear = selectedYear || years[0]?.value || "";
  let currentSemester = selectedSemester || semesters[0]?.value || "";

  function getStatusIcon(status: string): string {
    switch (status) {
      case "score":
        return ""; // ไม่แสดงไอคอน แสดงตัวเลข
      case "processing":
        return "ph:spinner-duotone";
      case "notAnnounced":
        return "ph:x-circle-duotone";
      case "notEntered":
        return "ph:minus-duotone";
      default:
        return "";
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case "score":
        return "text-green-600 dark:text-green-400";
      case "processing":
        return "text-blue-500 dark:text-blue-400";
      case "notAnnounced":
        return "text-red-500 dark:text-red-400";
      case "notEntered":
        return "text-zinc-400 dark:text-zinc-500";
      default:
        return "text-zinc-600 dark:text-zinc-300";
    }
  }

  function getLegendIcon(status: string): string {
    switch (status) {
      case "score":
        return "ph:number-square-one-duotone";
      case "processing":
        return "ph:spinner-duotone";
      case "notAnnounced":
        return "ph:x-circle-duotone";
      case "notEntered":
        return "ph:minus-duotone";
      default:
        return "ph:question-duotone";
    }
  }

  function getLegendColor(status: string): string {
    switch (status) {
      case "score":
        return "text-green-600 dark:text-green-400";
      case "processing":
        return "text-blue-500 dark:text-blue-400";
      case "notAnnounced":
        return "text-red-500 dark:text-red-400";
      case "notEntered":
        return "text-zinc-400 dark:text-zinc-500";
      default:
        return "text-zinc-600 dark:text-zinc-300";
    }
  }

  function handleSubmit() {
    if (!actionUrl) return;
    
    const form = document.createElement("form");
    form.method = "POST";
    form.action = actionUrl;
    form.target = "_blank";

    const yearInput = document.createElement("input");
    yearInput.type = "hidden";
    yearInput.name = "year";
    yearInput.value = currentYear;
    form.appendChild(yearInput);

    const semesterInput = document.createElement("input");
    semesterInput.type = "hidden";
    semesterInput.name = "semester";
    semesterInput.value = currentSemester;
    form.appendChild(semesterInput);

    const watchInput = document.createElement("input");
    watchInput.type = "hidden";
    watchInput.name = "watch";
    watchInput.value = "ดูผลคะแนนเก็บ";
    form.appendChild(watchInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }
</script>

<div class="space-y-6">
  <!-- Header Card -->
  {#if header}
    <div class={cn(
      'rounded-xl border border-orange-100/60 dark:border-orange-500/20',
      'bg-gradient-to-br from-orange-50/80 to-white/90 dark:from-orange-950/40 dark:to-gray-900/60',
      'backdrop-blur-sm p-6 shadow-sm'
    )}>
      <div class="flex items-start gap-4">
        <div class={classes.button.icon}>
          <Icon icon="ph:student-duotone" class="text-2xl text-orange-600 dark:text-orange-400" />
        </div>
        <div class="flex-1 min-w-0 space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class={classes.text.heading2}>
              {header.studentThaiName || "-"}
            </h3>
            {#if header.studentEnglishName}
              <span class={classes.text.bodySecondary}>
                ({header.studentEnglishName})
              </span>
            {/if}
          </div>
          <div class={cn('flex flex-wrap gap-x-4 gap-y-1', classes.text.body)}>
            {#if header.studentId}
              <div class="flex items-center gap-1.5">
                <Icon icon="ph:identification-badge-duotone" class="text-orange-600 dark:text-orange-400" />
                <span>{header.studentId}</span>
              </div>
            {/if}
            {#if header.faculty}
              <div class="flex items-center gap-1.5">
                <Icon icon="ph:buildings-duotone" class="text-orange-600 dark:text-orange-400" />
                <span>{header.faculty}</span>
              </div>
            {/if}
            {#if header.major}
              <div class="flex items-center gap-1.5">
                <Icon icon="ph:graduation-cap-duotone" class="text-orange-600 dark:text-orange-400" />
                <span>{header.major}</span>
              </div>
            {/if}
            {#if header.semester}
              <div class="flex items-center gap-1.5">
                <Icon icon="ph:calendar-duotone" class="text-orange-600 dark:text-orange-400" />
                <span>ภาคการศึกษา {header.semester}</span>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Year/Semester Selector -->
  {#if years.length > 0 || semesters.length > 0}
    <div class={cn(classes.card.base, 'p-6')}>
      <div class="flex items-center gap-3 mb-4">
        <Icon icon="ph:funnel-duotone" class="text-xl text-orange-600 dark:text-orange-400" />
        <h4 class={classes.text.heading3}>เลือกภาคการศึกษา</h4>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        {#if years.length > 0}
          <div>
            <label for="year-select" class={cn(classes.text.label, 'mb-2')}>
              ปีการศึกษา
            </label>
            <select
              id="year-select"
              bind:value={currentYear}
              class={classes.input.base}
            >
              {#each years as year}
                <option value={year.value}>{year.label}</option>
              {/each}
            </select>
          </div>
        {/if}
        {#if semesters.length > 0}
          <div>
            <label for="semester-select" class={cn(classes.text.label, 'mb-2')}>
              ภาคการศึกษา
            </label>
            <select
              id="semester-select"
              bind:value={currentSemester}
              class={classes.input.base}
            >
              {#each semesters as semester}
                <option value={semester.value}>{semester.label}</option>
              {/each}
            </select>
          </div>
        {/if}
      </div>
      <div class="mt-4">
        <Button
          variant="primary"
          icon="ph:magnifying-glass-duotone"
          on:click={handleSubmit}
        >
          ดูผลคะแนนเก็บ
        </Button>
      </div>
    </div>
  {/if}

  <!-- Scores Table -->
  {#if courses.length > 0}
    <div class={classes.table.wrapper}>
      <table class={classes.table.base}>
        <thead class={classes.table.header}>
          <tr>
            <th class={cn(classes.table.th, 'whitespace-nowrap')}>
              ลำดับ
            </th>
            <th class={cn(classes.table.th, 'whitespace-nowrap')}>
              รหัสวิชา
            </th>
            <th class={cn(classes.table.th, 'min-w-[200px]')}>
              ชื่อวิชา
            </th>
            <th class={cn(classes.table.th, 'text-center whitespace-nowrap')}>
              Section
            </th>
            {#each assessments as assessment}
              <th class={cn(classes.table.th, 'text-center whitespace-nowrap')}>
                {assessment}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody class={classes.table.body}>
          {#each courses as course, idx}
            <tr class={classes.table.row}>
              <td class={cn(classes.table.cell, 'text-center')}>
                {course.order}
              </td>
              <td class={cn(classes.table.cell, 'font-medium whitespace-nowrap')}>
                {course.courseNumber}
              </td>
              <td class={classes.table.cell}>
                {course.courseTitle}
              </td>
              <td class={cn(classes.table.cell, 'text-center')}>
                {course.section}
              </td>
              {#each course.assessments as assessment}
                <td class={cn(classes.table.cell, 'text-center')}>
                  {#if assessment.status === "score"}
                    <span class={cn('inline-flex items-center justify-center font-semibold text-base', getStatusColor(assessment.status))}>
                      {assessment.display}
                    </span>
                  {:else if getStatusIcon(assessment.status)}
                    <Icon 
                      icon={getStatusIcon(assessment.status)} 
                      class={cn('text-xl mx-auto', getStatusColor(assessment.status), assessment.status === 'processing' ? 'animate-spin' : '')}
                    />
                  {:else}
                    <span class={cn('text-base', getStatusColor(assessment.status))}>
                      {assessment.display}
                    </span>
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  <!-- Legend -->
  {#if legend.length > 0}
    <div class={cn(classes.card.base, 'p-6')}>
      <div class="flex items-center gap-3 mb-4">
        <Icon icon="ph:info-duotone" class="text-xl text-orange-600 dark:text-orange-400" />
        <h4 class={classes.text.heading3}>สัญลักษณ์</h4>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {#each legend as item}
          <div class={cn(
            'flex items-center gap-3 p-3 rounded-lg backdrop-blur-sm',
            'bg-gray-50/70 dark:bg-gray-700/40',
            'border border-gray-200/50 dark:border-gray-600/40'
          )}>
            <Icon 
              icon={getLegendIcon(item.status)} 
              class={cn('text-2xl flex-shrink-0', getLegendColor(item.status))}
            />
            <div class="min-w-0">
              <p class={cn(classes.text.body, 'font-medium')}>
                {item.label}
              </p>
              <p class={cn(classes.text.caption, 'leading-relaxed')}>
                {item.description}
              </p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Note -->
  {#if note}
    <div class="flex items-start gap-3 p-4 bg-amber-50/70 dark:bg-amber-900/20 backdrop-blur-sm border border-amber-200/60 dark:border-amber-800/50 rounded-lg">
      <Icon icon="ph:warning-duotone" class="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
      <p class="text-base leading-relaxed text-amber-800 dark:text-amber-200">
        {note}
      </p>
    </div>
  {/if}
</div>
