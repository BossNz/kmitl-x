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

  function changeMonth(direction: number) {
    currentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + direction,
      1
    );
  }
</script>

<main
  class="min-h-screen p-2 flex flex-col justify-between dark:bg-gray-900 bg-white font-prompt"
>
  <!-- Main Container -->
  <div class="p-1">
    <!-- Header -->
    <Head {studentInfo} {type} />

    <!-- Content -->
    <div class="flex w-full h-40 border-2 border-dashed border-gray-400">
      <!-- Calendar -->
      <div
        class="flex flex-col justify-center items-center w-1/2 border border-red-500 p-4"
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
        <div class="p-4 w-full border border-pink-500">
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
          <div></div>
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
