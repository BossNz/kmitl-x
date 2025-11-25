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
      groupExamsByDate();
      generateCalendarDays();
    } catch (err) {
      console.error(err);
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

  interface CalendarDay {
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    daysUntil: number;
    fullDate: string;
    exams?: ExamObject[];
  }
  interface ExamGroup {
    date: string;
    dayName?: string;
    fullDate?: string;
    daysUntil?: number;
    items: ExamObject[];
  }

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

      // Collect exams for this date
      const dayExams = exams.filter((exam) => {
        const examDate = parseExamDateToDate(
          exam.date.day,
          exam.date.month,
          exam.date.year
        );
        if (!examDate) return false;

        return (
          examDate.getDate() === current.getDate() &&
          examDate.getMonth() === current.getMonth() &&
          examDate.getFullYear() === current.getFullYear()
        );
      });

      days.push({
        day: current.getDate(),
        isCurrentMonth,
        isToday,
        daysUntil,
        fullDate,
        exams: dayExams,
      });

      current.setDate(current.getDate() + 1);
    }

    calendarDays = days;
  }

  function parseExamDateToDate(
    day: string,
    month: string,
    year: string
  ): Date | null {
    try {
      const monthMapThai: Record<string, number> = {
        "ม.ค.": 0,
        "ก.พ.": 1,
        "มี.ค.": 2,
        "เม.ย.": 3,
        "พ.ค.": 4,
        "มิ.ย.": 5,
        "ก.ค.": 6,
        "ส.ค.": 7,
        "ก.ย.": 8,
        "ต.ค.": 9,
        "พ.ย.": 10,
        "ธ.ค.": 11,
      };
      const monthMapEng: Record<string, number> = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };
      const monthIndex = monthMapThai[month] ?? monthMapEng[month];
      if (monthIndex === undefined) return null;

      return new Date(parseInt(year), monthIndex, parseInt(day));
    } catch {
      return null;
    }
  }

  function calculateDateDifference(date1: Date, date2: Date): number {
    const diffTime = date2.getTime() - date1.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  function parseDateInfo(
    raw: string,
    today: Date,
    date: Date | null
  ): { fullDate: string; daysUntil: number } {
    if (!date) {
      return { fullDate: "ไม่ระบุวันที่", daysUntil: 999 };
    }

    if (raw === "อื่นๆ" || (raw && raw.includes("จัดสอบเอง"))) {
      return { fullDate: "จัดสอบเอง", daysUntil: 999 };
    }

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

    const fullDate = `${date?.getDate() || ""} ${thaiMonths[date?.getMonth() || 0]} ${date ? date.getFullYear() + 543 : ""}`;

    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    return { fullDate, daysUntil: calculateDateDifference(date, todayStart) };
  }

  function getDayName(date: Date | null): string {
    if (!date) return "";
    return new Intl.DateTimeFormat("th-TH", { weekday: "long" }).format(date);
  }

  function viewExamDetail(exam: ExamObject) {
    selectedExam = exam;
    showExamDetail = true;
  }

  function closeExamDetail() {
    showExamDetail = false;
    setTimeout(() => (selectedExam = null), 300);
  }

  function groupExamsByDate() {
    const groups = new Map<
      string,
      {
        date: {
          day: string;
          month: string;
          year: string;
          raw: string;
        };
        items: ExamObject[];
      }
    >();
    const today = new Date();

    exams.forEach((exam) => {
      const key =
        exam.date.raw && exam.date.raw.trim() !== "" ? exam.date.raw : "อื่นๆ";

      if (!groups.has(key)) {
        groups.set(key, {
          date: {
            day: exam.date.day,
            month: exam.date.month,
            year: exam.date.year,
            raw: exam.date.raw,
          },
          items: [],
        });
      }

      groups.get(key)!.items.push(exam);
    });

    // Convert the grouped map to the array structure used by the UI
    groupedExams = Array.from(groups.entries()).map(([, { date, items }]) => {
      const realDate = parseExamDateToDate(date.day, date.month, date.year);
      const { fullDate, daysUntil } = parseDateInfo(date.raw, today, realDate);

      return {
        date: date.raw,
        dayName: getDayName(realDate),
        fullDate,
        daysUntil,
        items: items.sort((a, b) => (a.order || 0) - (b.order || 0)),
      };
    });

    groupedExams.sort((a, b) => {
      if (a.date === "อื่นๆ") return 1;
      if (b.date === "อื่นๆ") return -1;
      return (a.daysUntil || 0) - (b.daysUntil || 0);
    });
  }

  // Location formatting helpers
  function formatLocation(venue: ExamObject["venue"]) {
    if (!venue) return "-";
    const { building, room, seat, raw } = venue as any;
    if (!building && !room && !seat) return raw || "-";

    const parts: string[] = [];
    if (building) parts.push(`อาคาร ${building}`);
    if (room) parts.push(`ห้อง ${room}`);
    if (seat) parts.push(`ที่นั่ง ${seat}`);
    return parts.length > 0 ? parts.join(" · ") : raw || "-";
  }

  function openSeatMap(url: string) {
    if (url) window.open(url, "_blank");
  }

  function getDaysText(days: number): string {
    if (days >= 999) return "ไม่ระบุวันที่";
    if (days < 0) return "สอบไปแล้ว";
    if (days === 0) return "สอบวันนี้!";
    if (days === 1) return "สอบพรุ่งนี้";
    return `อีก ${days} วัน`;
  }

  function getDaysColor(days: number): string {
    if (days >= 999) return "text-gray-600";
    if (days < 0) return "text-gray-400";
    if (days === 0) return "text-red-500";
    if (days === 1) return "text-orange-500";
    if (days <= 3) return "text-yellow-500";
    if (days <= 7) return "text-blue-500";
    return "text-green-500";
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
      <div>
        <!-- Date & Time -->
        <div></div>

        <!-- Location -->
        <div></div>

        <!-- Seat Map Button -->
        <div></div>
      </div>
    </div>
  </div>
{/if}
