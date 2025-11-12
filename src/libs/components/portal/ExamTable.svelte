<script lang="ts">
  import Icon from "@iconify/svelte";
  import type { ExamTableBlock } from "../../types";
  import { classes, cn } from '../../styles';
  import { Button } from '../common';

  export let block: ExamTableBlock;

  let selectedYear = block.years[0]?.value || "";
  let selectedSemester = block.semesters[0]?.value || "";
  let selectedExamType: "midterm" | "final" = "midterm";
  let loading = false;
  let examUrl = "";

  $: if (selectedYear && selectedSemester && selectedExamType) {
    updateExamUrl();
  }

  function updateExamUrl() {
    const baseUrl = block.actionUrl;
    const examTypeParam = selectedExamType === "midterm" ? "M" : "F";
    examUrl = `${baseUrl}?year=${selectedYear}&semester=${selectedSemester}&mid_or_final=${examTypeParam}`;
  }

  function openInNewTab() {
    if (examUrl) {
      window.open(examUrl, "_blank", "noopener");
    }
  }

  const examTypeOptions = [
    { value: "midterm" as const, label: "กลางภาค", icon: "ph:calendar-check-duotone" },
    { value: "final" as const, label: "ปลายภาค", icon: "ph:calendar-x-duotone" }
  ];
</script>

<div class="space-y-6">
  {#if block.title}
    <div class="flex items-center gap-3">
      <div class={classes.button.icon}>
        <Icon icon="ph:exam-duotone" class="text-xl" />
      </div>
      <div>
        <p class={classes.text.labelOrange}>ตารางสอบ</p>
        <h3 class={classes.text.heading3}>{block.title}</h3>
      </div>
    </div>
  {/if}

  <div class={cn(classes.card.base, 'p-6 space-y-5')}>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div class="space-y-2">
        <label for="year-select" class={classes.text.label}>
          ปีการศึกษา
        </label>
        <select
          id="year-select"
          bind:value={selectedYear}
          class={classes.input.base}
        >
          {#each block.years as year}
            <option value={year.value}>{year.label}</option>
          {/each}
        </select>
      </div>

      <div class="space-y-2">
        <label for="semester-select" class={classes.text.label}>
          ภาคการศึกษา
        </label>
        <select
          id="semester-select"
          bind:value={selectedSemester}
          class={classes.input.base}
        >
          {#each block.semesters as semester}
            <option value={semester.value}>{semester.label}</option>
          {/each}
        </select>
      </div>

      <div class="space-y-2">
        <p class={classes.text.label}>
          ประเภทการสอบ
        </p>
        <div class="flex gap-2">
          {#each examTypeOptions as option}
            <div class="relative flex-1 group">
              <button
                class={cn(
                  'w-full flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all backdrop-blur-sm',
                  selectedExamType === option.value
                    ? 'border-orange-500/60 bg-orange-500/90 dark:bg-orange-600/80 text-white shadow-sm shadow-orange-500/25'
                    : 'border-gray-300/60 dark:border-gray-600/50 bg-white/80 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-gray-700/80'
                )}
                on:click={() => (selectedExamType = option.value)}
              >
                <Icon icon={option.icon} class="w-4 h-4" />
                <span class="hidden sm:inline">{option.label}</span>
              </button>
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800/90 dark:bg-gray-700/90 backdrop-blur-sm text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-10">
                {option.label}
                <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800/90 dark:border-t-gray-700/90"></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3 pt-2">
      <Button
        variant="primary"
        icon="ph:calendar-duotone"
        on:click={openInNewTab}
      >
        ดูตารางสอบ
      </Button>
      <div class="flex items-center gap-2">
        <div class="h-6 w-px bg-gray-300/60 dark:bg-gray-600/50"></div>
        <p class={classes.text.bodySecondary}>
          เลือกปี, ภาค และประเภทการสอบเพื่อดูตาราง
        </p>
      </div>
    </div>
  </div>

  {#if examUrl}
    <div class={cn(classes.card.base, 'overflow-hidden')}>
      <div class="border-b border-gray-200/60 dark:border-gray-700/50 bg-orange-50/70 dark:bg-orange-900/20 backdrop-blur-sm px-6 py-4">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <Icon icon={selectedExamType === "midterm" ? "ph:calendar-check-duotone" : "ph:calendar-x-duotone"} class="text-lg text-orange-600 dark:text-orange-400" />
            <div>
              <p class={cn(classes.text.body, 'font-semibold')}>
                ตารางสอบ{selectedExamType === "midterm" ? "กลางภาค" : "ปลายภาค"} - ปีการศึกษา {selectedYear} ภาคการศึกษา {selectedSemester}
              </p>
              <p class={classes.text.caption}>แสดงตารางจากระบบสำนักทะเบียน</p>
            </div>
          </div>
          <button
            class={cn(classes.button.secondary, 'inline-flex items-center gap-2 px-3 py-1.5')}
            on:click={openInNewTab}
          >
            <Icon icon="ph:arrow-square-out-duotone" class="w-4 h-4" />
            เปิดแยก
          </button>
        </div>
      </div>
      
      <div class="relative bg-white/95 dark:bg-gray-900/90 backdrop-blur-sm" style="height: 600px;">
        {#if loading}
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="flex flex-col items-center gap-3">
              <div class="w-10 h-10 rounded-full border-4 border-orange-200/60 border-t-orange-500 animate-spin"></div>
              <p class="text-sm text-orange-600/70 dark:text-orange-400/70">กำลังโหลดตารางสอบ{selectedExamType === "midterm" ? "กลางภาค" : "ปลายภาค"}...</p>
            </div>
          </div>
        {/if}
        <iframe
          src={examUrl}
          title="ตารางสอบส่วนบุคคล"
          class="w-full h-full border-0"
          on:load={() => (loading = false)}
          on:loadstart={() => (loading = true)}
        ></iframe>
      </div>
    </div>
  {/if}
</div>
