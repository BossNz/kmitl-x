<script lang="ts">
  import { onMount } from "svelte";
  import { getTheme, setTheme } from "../libs/utils/themeManager";
  import type { ExamTable } from "../libs/types/report-examtable.types";
  import Head from "../libs/components/examtable/Head.svelte";
  import Button from "../libs/components/examtable/Button.svelte";
  import Icon from "@iconify/svelte";

  export let studentInfo: ExamTable["studentInfo"];
  export let exams: ExamTable["exams"];
  export let pdf: ExamTable["pdf"];
  export let type: ExamTable["type"];

  let theme: "light" | "dark" = "dark";

  onMount(() => {
    theme = getTheme();
    setTheme(theme);
    console.log(studentInfo, exams, pdf, type);
  });

  function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
    setTheme(theme);
  }

  // Calendar
  let currentMonth: Date = new Date();
  let calendarDays: CalendarDay[] = [];

  interface CalendarDay {
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    daysUntil: number;
    fullDate: string;
  }

  function changeMonth(direction: number) {
    currentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + direction,
      1
    );
    generateCalendarDays();
  }

  function generateCalendarDays() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Start from Sunday of the week containing the 1st
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // End on Saturday of the week containing the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const days: CalendarDay[] = [];
    const current = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (current <= endDate) {
      const isCurrentMonth = current.getMonth() === month;

      // Check if this is today
      const isToday =
        current.getDate() === today.getDate() &&
        current.getMonth() === today.getMonth() &&
        current.getFullYear() === today.getFullYear();

      const diffTime = current.getTime() - today.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const thaiMonths = [
        "มกราคม",
        "กุมภาพันธ์",
        "มีนาคม",
        "เมษายน",
        "พฤษภาคม",
        "มิถุนายน",
        "กรกฎาคม",
        "สิงหาคม",
        "กันยายน",
        "ตุลาคม",
        "พฤศจิกายน",
        "ธันวาคม",
      ];
      const fullDate = `${current.getDate()} ${thaiMonths[current.getMonth()]} ${current.getFullYear() + 543}`;

      days.push({
        day: current.getDate(),
        isCurrentMonth,
        isToday,
        daysUntil,
        fullDate,
      });

      current.setDate(current.getDate() + 1);
    }

    calendarDays = days;
  }
</script>

<main
  class="h-screen p-2 flex flex-col justify-between dark:bg-gray-900 bg-white font-prompt"
>
  <!-- Main Container -->
  <div class="flex flex-col flex-grow p-1">
    <!-- Header -->
    <Head {studentInfo} {type} />

    <!-- Content -->
    <div class="flex w-full h-full border-2 border-dashed border-gray-400">
      <!-- Calendar -->
      <div
        class="flex flex-col justify-start items-center w-1/2 border border-red-500 p-4 h-full"
      >
        <!-- Calendar Header -->
        <div class="p-4 border-orange-400 border w-full">
          <div
            class="flex items-center justify-between w-full border border-green-500"
          >
            <!-- Previous Month -->
            <button
              on:click={() => changeMonth(-1)}
              class="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
              aria-label="Previous Month"
            >
              <svg
                class="w-4 h-4 text-gray-600 dark:text-orange-300"
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
              <p class="text-xs text-gray-500 dark:text-orange-300">
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
                class="w-4 h-4 text-gray-600 dark:text-orange-300"
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
        <div
          class="flex flex-col h-full w-full p-4 border border-pink-500 overflow-y-auto"
        >
          <!-- Day Headers -->
          <div class="grid grid-cols-7 gap-1.5 mb-2 border border-blue-500">
            {#each ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."] as day}
              <div
                class="text-center text-sm font-semibold text-gray-500 dark:text-orange-300 py-1 border border-green-400"
              >
                {day}
              </div>
            {/each}
          </div>

          <!-- Calendar Days -->
          <div class="grid grid-cols-7 gap-1.5 border border-yellow-500 p-4">
            {#each calendarDays as calDay}
              <button
                class="
                  relative aspect-square rounded-lg p-1.5 transition-all duration-150 flex flex-col
                  {calDay.isCurrentMonth
                  ? 'bg-white/60 dark:bg-gray-800/50'
                  : 'bg-gray-100/40 dark:bg-gray-900/20'}
                  {calDay.isToday
                  ? 'ring-1 ring-blue-400 dark:ring-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                  : ''}
                  {!calDay.isCurrentMonth ? 'opacity-30' : ''}
                  hover:shadow-sm backdrop-blur-sm
                ">{calDay.day}</button
              >
            {/each}
          </div>
        </div>
      </div>

      <!-- Exam List -->
      <div
        class="flex justify-center items-center w-1/2 border border-blue-500 p-4"
      >
        <p>Exam List</p>
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
      <Button on:click>
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
    </div>
  </footer>
</main>

<!-- Modal -->
<div></div>
