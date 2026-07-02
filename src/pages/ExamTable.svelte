<script lang="ts">
  import { onMount } from "svelte";
  import { getTheme, setTheme } from "../libs/utils/themeManager";
  import type {
    ExamObject,
    ExamTable,
  } from "../libs/types/report-examtable.types";
  import Head from "../libs/components/examtable/Head.svelte";
  import Button from "../libs/components/examtable/Button.svelte";
  import Icon from "@iconify/svelte";
  import { fade, slide } from "svelte/transition";
  import {
    parseExamDateToDate,
    getCalendarDays,
    groupExams,
    getDaysText,
    getDaysColor,
    type CalendarDay,
    type ExamGroup,
  } from "../libs/utils/examtable";
  import { logger } from "../libs/utils/logger";

  export let studentInfo: ExamTable["studentInfo"];
  export let exams: ExamTable["exams"] = [];
  export let pdf: ExamTable["pdf"];
  export let type: ExamTable["type"];

  let theme: "light" | "dark" = "dark";

  // UI state
  let loading = false;
  let error = "";
  let selectedExam: ExamObject | null = null;
  let showExamDetail = false;

  onMount(() => {
    theme = getTheme();
    setTheme(theme);

    // Initialize calendar and groups from passed exams
    try {
      buildCalendarFromExams();
      groupedExams = groupExams(exams);
      generateCalendarDays();
    } catch (err) {
      logger.error(err);
    }
  });

  function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
    setTheme(theme);
  }

  // Calendar
  let currentMonth: Date = new Date();
  let calendarDays: CalendarDay[] = [];
  let groupedExams: ExamGroup[] = [];

  function changeMonth(direction: number) {
    currentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + direction,
      1
    );
    generateCalendarDays();
  }

  function buildCalendarFromExams() {
    // Find first exam date and set currentMonth accordingly
    const examDates = exams
      .map((exam) =>
        parseExamDateToDate(exam.date.day, exam.date.month, exam.date.year)
      )
      .filter((d) => d !== null) as Date[];

    if (examDates.length > 0) {
      currentMonth = new Date(
        examDates[0].getFullYear(),
        examDates[0].getMonth(),
        1
      );
    }
  }

  function generateCalendarDays() {
    calendarDays = getCalendarDays(currentMonth, exams);
  }

  function viewExamDetail(exam: ExamObject) {
    selectedExam = exam;
    showExamDetail = true;
  }

  function closeExamDetail() {
    showExamDetail = false;
    setTimeout(() => (selectedExam = null), 300);
  }

  function openSeatMap(url: string) {
    if (url) window.open(url, "_blank");
  }

  function toggleExamType() {
    const newType = type === "M" ? "F" : "M";

    const form = document.createElement("form");
    form.method = "post";
    form.action = "report_examtable_show.php";

    // Add hidden inputs
    const yearInput = document.createElement("input");
    yearInput.type = "hidden";
    yearInput.name = "year";
    yearInput.value = studentInfo.year;
    form.appendChild(yearInput);

    const semesterInput = document.createElement("input");
    semesterInput.type = "hidden";
    semesterInput.name = "semester";
    semesterInput.value = studentInfo.semester;
    form.appendChild(semesterInput);

    const examTypeInput = document.createElement("input");
    examTypeInput.type = "hidden";
    examTypeInput.name = "mid_or_final";
    examTypeInput.value = newType;
    form.appendChild(examTypeInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }
</script>

<main
  class="h-screen p-2 flex flex-col justify-between dark:bg-gray-900 bg-white font-prompt text-gray-800 dark:text-white"
>
  <!-- Main Container -->
  <div class="flex flex-col flex-grow p-1 min-h-0">
    <!-- Header -->
    <Head {studentInfo} {type} />

    <!-- Content -->
    <div class="flex w-full h-full min-h-0">
      <!-- Calendar -->
      <div class="flex flex-col justify-start items-center w-1/2 p-4 min-h-0">
        <!-- Calendar Header -->
        <div class="p-4 w-full">
          <div class="flex items-center justify-between w-full">
            <!-- Previous Month -->
            <button
              on:click={() => changeMonth(-1)}
              class="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
              aria-label="Previous Month"
            >
              <svg
                class="w-4 h-4 text-orange-500 dark:text-orange-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <!-- Title -->
            <div class="text-center w-full">
              <!-- Month -->
              <h2 class="text-lg font-bold text-orange-400">
                {new Intl.DateTimeFormat("th-TH", {
                  month: "long",
                  year: "numeric",
                }).format(currentMonth)}
              </h2>
              <!-- Number of Subjects -->
              <p class="text-xs text-orange-500 dark:text-orange-300">
                {exams.length} วิชา
              </p>
            </div>

            <!-- Next Month -->
            <button
              on:click={() => changeMonth(1)}
              class="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
              aria-label="Next Month"
            >
              <svg
                class="w-4 h-4 text-orange-500 dark:text-orange-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="flex-1 flex flex-col w-full min-h-0">
          <!-- Day Headers -->
          <div class="grid grid-cols-7 gap-1.5 mb-2 p-4">
            {#each ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."] as day}
              <div
                class="text-center text-sm font-semibold text-orange-500 dark:text-orange-300 py-1"
              >
                {day}
              </div>
            {/each}
          </div>

          <!-- Calendar Days -->
          <div
            class="grid grid-cols-7 gap-1.5 flex-1 overflow-y-auto content-start auto-rows-min p-4"
          >
            {#each calendarDays as calDay}
              <button
                class="
                  relative aspect-square rounded-lg p-2 transition-all duration-150 flex flex-col
                  {calDay.isCurrentMonth
                  ? 'bg-gray-100/50 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-400'}
                  {calDay.isToday
                  ? 'ring-2 ring-orange-200 dark:ring-orange-500 dark:bg-orange-500/20 bg-orange-200/40 text-orange-600 dark:text-orange-300 font-semibold'
                  : ''}
                  {calDay.exams && calDay.exams.length > 0
                  ? 'ring-1 ring-orange-400 dark:ring-orange-500'
                  : ''}
                  {!calDay.isCurrentMonth ? 'opacity-40' : 'opacity-100'}
                  hover:shadow-md hover:scale-105"
                on:click={() =>
                  calDay.exams &&
                  calDay.exams.length > 0 &&
                  viewExamDetail(calDay.exams[0])}
                disabled={(calDay.exams?.length ?? 0) === 0}
              >
                <!-- Today Indicator - Minimal dot -->
                {#if calDay.isToday}
                  <div
                    class="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-400 dark:bg-orange-300"
                  ></div>
                {/if}

                <!-- Day Number -->
                <div
                  class="text-xs font-medium {calDay.isToday
                    ? 'text-orange-400 dark:text-orange-300'
                    : (calDay.exams?.length ?? 0) > 0
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-700 dark:text-gray-500'}"
                >
                  {calDay.day}
                </div>

                {#if calDay.exams && calDay.exams.length > 0}
                  <!-- Countdown Badge -->
                  {#if calDay.daysUntil > 0}
                    <div
                      class="text-[10px] font-semibold {getDaysColor(
                        calDay.daysUntil
                      )}"
                    >
                      อีก {calDay.daysUntil} วัน
                    </div>
                  {/if}

                  <!-- Exam Info -->
                  <div
                    class="space-y-0.5 flex-1 flex flex-col {calDay.daysUntil >
                    0
                      ? 'justify-start mt-1'
                      : 'justify-center'}"
                  >
                    <!-- remove extra subject -->
                    {#each calDay.exams.slice(0, 1) as exam}
                      <div
                        class="text-xs leading-tight text-gray-800 dark:text-gray-300 font-medium line-clamp-3"
                      >
                        {exam.subjectName}
                      </div>
                    {/each}
                    {#if calDay.exams.length > 1}
                      <div
                        class="text-xs text-orange-600 dark:text-orange-400 font-medium"
                      >
                        และอีก {calDay.exams.length - 1} วิชา
                      </div>
                    {/if}
                  </div>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      </div>

      <!-- Exam List -->
      <div class="flex flex-col w-1/2 p-4 overflow-y-auto space-y-4">
        <div class="mt-2 space-y-6">
          {#each groupedExams as group}
            <div
              class="relative {(group.daysUntil ?? 999) < 0
                ? 'opacity-60 grayscale'
                : ''}"
            >
              <!-- Date Header -->
              <div
                class="sticky top-0 z-10 flex items-center gap-3 mb-3 bg-white/95 dark:bg-gray-900/95 py-2 backdrop-blur-sm"
              >
                <div class="flex items-baseline gap-2">
                  <h3
                    class="text-xl font-bold text-orange-600 dark:text-orange-400 tracking-tight"
                  >
                    {group.fullDate}
                  </h3>
                  {#if group.dayName}
                    <span
                      class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      ({group.dayName})
                    </span>
                  {/if}
                </div>
                <div class="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
                <span
                  class="{getDaysColor(
                    group.daysUntil ?? 999
                  )} text-xs font-bold px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800"
                >
                  {group.date === "จัดสอบเอง"
                    ? "จัดสอบเอง"
                    : getDaysText(group.daysUntil ?? 999)}
                </span>
              </div>

              <div class="space-y-3 pl-2">
                {#each group.items as exam}
                  <button
                    on:click={() => viewExamDetail(exam)}
                    class="group w-full text-left relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-200"
                  >
                    <div class="p-4">
                      <div class="flex items-start gap-4">
                        <!-- Time Column -->
                        <div
                          class="flex-shrink-0 w-24 flex flex-col items-center justify-center p-3 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/20 transition-colors"
                        >
                          <span
                            class="text-lg font-bold text-orange-600 dark:text-orange-400 leading-none"
                          >
                            {exam.date.time.start}
                          </span>
                          <div
                            class="w-8 h-px bg-orange-200 dark:bg-orange-700 my-1"
                          ></div>
                          <span
                            class="text-sm font-medium text-orange-600/80 dark:text-orange-400/80 leading-none"
                          >
                            {exam.date.time.end}
                          </span>
                        </div>

                        <!-- Info Column -->
                        <div class="flex-1 min-w-0 py-0.5">
                          <div
                            class="flex items-start justify-between gap-2 mb-2"
                          >
                            <div>
                              <div class="flex items-center gap-2 mb-1">
                                <span
                                  class="text-xs font-bold px-1.5 py-0.5 rounded text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-700/50"
                                >
                                  {exam.subjectCode}
                                </span>
                                {#if exam.section}
                                  <span
                                    class="text-[10px] font-medium text-gray-500"
                                    >Sec {exam.section}</span
                                  >
                                {/if}
                              </div>
                              <h4
                                class="text-base font-bold text-gray-900 dark:text-white leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors"
                              >
                                {exam.subjectName}
                              </h4>
                            </div>
                          </div>

                          <!-- Footer Info -->
                          <div class="flex items-center justify-between mt-3">
                            <!-- Location -->
                            <div
                              class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"
                            >
                              <svg
                                class="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                /><path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                /></svg
                              >
                              {#if exam.venue.building || exam.venue.room || exam.venue.seat}
                                <span
                                  class="font-medium truncate max-w-[200px]"
                                >
                                  {#if exam.venue.building}{exam.venue
                                      .building}{/if}
                                  {#if exam.venue.room}
                                    / {exam.venue.room}{/if}
                                  {#if exam.venue.seat}
                                    <span
                                      class="text-orange-600 dark:text-orange-400 font-bold ml-1"
                                      >ที่นั่ง {exam.venue.seat}</span
                                    >{/if}
                                </span>
                              {:else if exam.venue.raw && (exam.venue.raw.includes("ปลายภาค") || exam.venue.raw.includes("final exam") || exam.venue.raw.includes("ในห้องสอบ") || exam.venue.raw.includes("examination room"))}
                                <span class="text-amber-600 dark:text-amber-400"
                                  >ไม่ระบุห้องสอบ</span
                                >
                              {:else}
                                <span>{exam.venue.raw || "-"}</span>
                              {/if}
                            </div>

                            <!-- Badges -->
                            <div class="flex items-center gap-2">
                              <span
                                class="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                              >
                                {exam.credit} หน่วยกิต
                              </span>
                              <span
                                class="text-[10px] px-2 py-0.5 rounded-full {exam.type ===
                                'lecture'
                                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300'
                                  : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300'}"
                              >
                                {exam.type === "lecture" ? "ทฤษฎี" : "ปฏิบัติ"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="flex justify-between items-end">
    <!-- Left -->
    <div class="space-x-2">
      <!-- Export PNG -->
      <!-- <Button on:click={exportPng}>
        <Icon icon="ph:file-png-light" class="my-auto text-2xl inline" />
        <span class="font-semibold">Download PNG</span>
      </Button> -->

      <!-- PDF Download -->
      <Button on:click={() => window.open(pdf, "_blank")}>
        <Icon icon="ph:file-pdf" class="my-auto text-2xl inline" />
        <span class="font-semibold">Download PDF</span>
      </Button>

      <!-- Theme Toggle -->
      <Button on:click={toggleTheme}>
        <Icon
          icon={theme === "dark" ? "ph:sun-duotone" : "ph:moon-duotone"}
          class="my-auto text-2xl inline"
        />
        <span class="font-semibold">{theme === "dark" ? "Light" : "Dark"}</span>
      </Button>

      <!-- Exam Type Toggle -->
      <Button on:click={toggleExamType}>
        <Icon icon="ph:calendar-light" class="my-auto text-2xl inline" />
        <span class="font-semibold"
          >{type === "M" ? "ดูปลายภาค" : "ดูกลางภาค"}</span
        >
      </Button>
    </div>
  </footer>
</main>

<!-- Modal -->
{#if showExamDetail && selectedExam}
  <!-- Blur Background -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    transition:fade={{ duration: 200 }}
    on:click={closeExamDetail}
    role="dialog"
    aria-modal="true"
    aria-labelledby="exam-detail-title"
    tabindex="-1"
  >
    <!-- Modal Container -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div
      class="bg-white/95 dark:bg-gray-800/95 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl backdrop-blur-md border border-gray-200/60 dark:border-gray-700/50 font-prompt"
      transition:slide={{ duration: 300 }}
      on:click|stopPropagation
      role="document"
    >
      <!-- Modal Header -->
      <div
        class="sticky top-0 bg-orange-500/95 dark:bg-orange-600/95 border-orange-400/60 dark:border-orange-700/50 p-6 rounded-t-2xl shadow-lg"
      >
        <!-- Modal Header Container -->
        <div class="flex items-start justify-between gap-4">
          <!-- Modal Header Content -->
          <div class="flex-1 min-w-0">
            <!-- Subject Code -->
            <div
              class="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold text-white mb-2"
            >
              {selectedExam.subjectCode}
            </div>

            <!-- Subject Name -->
            <h2
              id="exam-detail-title"
              class="text-2xl font-bold text-white mb-1"
            >
              {selectedExam.subjectName}
            </h2>

            <!-- Subject Detail -->
            <p class="text-white/90 text-sm">
              {selectedExam.type.toUpperCase()} · Section {selectedExam.section}
              · {selectedExam.credit} หน่วยกิต
            </p>
          </div>

          <!-- Close Button -->
          <button
            on:click={closeExamDetail}
            class="flex-shrink-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close Modal"
          >
            <svg
              class="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal Content -->
      <div class="p-6 space-y-6">
        {#if selectedExam.date.day}
          <!-- Date & Time -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Date -->
            <div
              class="bg-white/60 dark:bg-gray-800/40 rounded-xl p-4 border border-gray-200/40 dark:border-gray-700/40 backdrop-blur-sm"
            >
              <!-- Title -->
              <div
                class="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span class="text-sm font-medium">วันที่สอบ</span>
              </div>

              <!-- Date Value-->
              <p class="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedExam.date.raw}
              </p>
            </div>

            <!-- Time -->
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <!-- Title -->
              <div
                class="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span class="text-sm font-medium">เวลาสอบ</span>
              </div>

              <!-- Time Value -->
              <p class="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedExam.date.time.start} - {selectedExam.date.time.end} น.
              </p>
            </div>
          </div>
        {:else}
          <p class="text-lg font-semibold text-gray-900 dark:text-white">
            ไม่ระบุวันที่และเวลา
          </p>
        {/if}

        <!-- Location -->
        {#if selectedExam.venue.room && selectedExam.venue.seat}
          <!-- Case: Structured location data (building:room:seat format) -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <!-- Title -->
            <div
              class="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span class="text-sm font-medium">สถานที่สอบ</span>
            </div>

            <!-- Location Details -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <!-- Building -->
              {#if selectedExam.venue.building}
                <div class="bg-white dark:bg-gray-800/50 rounded-lg p-3">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    อาคาร
                  </div>
                  <div
                    class="text-lg font-bold text-orange-600 dark:text-orange-400"
                  >
                    {selectedExam.venue.building}
                  </div>
                </div>
              {/if}

              <!-- Room -->
              {#if selectedExam.venue.room}
                <div class="bg-white dark:bg-gray-800/50 rounded-lg p-3">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    ห้อง
                  </div>
                  <div
                    class="text-lg font-bold text-orange-600 dark:text-orange-400"
                  >
                    {selectedExam.venue.room}
                  </div>
                </div>
              {/if}

              <!-- Seat -->
              {#if selectedExam.venue.seat}
                <div class="bg-white dark:bg-gray-800/50 rounded-lg p-3">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    ที่นั่ง
                  </div>
                  <div
                    class="text-lg font-bold text-orange-600 dark:text-orange-400"
                  >
                    {selectedExam.venue.seat}
                  </div>
                </div>
              {:else}
                <!-- Show placeholder if no seat number -->
                <div
                  class="bg-white dark:bg-gray-800/50 rounded-lg p-3 opacity-50"
                >
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    ที่นั่ง
                  </div>
                  <div
                    class="text-lg font-bold text-gray-400 dark:text-gray-500"
                  >
                    -
                  </div>
                </div>
              {/if}
            </div>
          </div>
        {:else if selectedExam.venue.raw && (selectedExam.venue.raw.includes("ปลายภาค") || selectedExam.venue.raw.includes("final exam") || selectedExam.venue.raw.includes("ในห้องสอบ") || selectedExam.venue.raw.includes("examination room"))}
          <!-- Case: Exam during final period without specific location -->
          <div
            class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4"
          >
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0">
                <svg
                  class="w-6 h-6 text-amber-600 dark:text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div class="flex-1">
                <h3
                  class="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1"
                >
                  ไม่ระบุสถานที่สอบ
                </h3>
                <p class="text-sm text-amber-700 dark:text-amber-300">
                  วิชานี้จะจัดสอบในช่วงปลายภาค
                  กรุณาตรวจสอบสถานที่สอบอีกครั้งก่อนวันสอบ
                </p>
              </div>
            </div>
          </div>
        {:else if selectedExam.venue.raw}
          <!-- Case: Other location format (raw text) -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div
              class="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span class="text-sm font-medium">สถานที่สอบ</span>
            </div>
            <p class="text-base text-gray-900 dark:text-white">
              {selectedExam.venue.raw}
            </p>
          </div>
        {:else}
          <!-- Case: No location data at all -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div
              class="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span class="text-sm font-medium">สถานที่สอบ</span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              ยังไม่ได้ระบุสถานที่สอบ
            </p>
          </div>
        {/if}

        <!-- Seat Map Button -->
        {#if selectedExam?.venue?.url}
          <Button
            variant="primary"
            class="w-full justify-center"
            on:click={() => openSeatMap(selectedExam?.venue.url || "")}
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            ดูแผนผังที่นั่งสอบ
          </Button>
        {/if}
      </div>
    </div>
  </div>
{/if}
