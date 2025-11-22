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
      .map((exam) => parseExamDateToDate(exam.date?.raw || ""))
      .filter((d) => d !== null) as Date[];

    if (examDates.length > 0) {
      currentMonth = new Date(examDates[0].getFullYear(), examDates[0].getMonth(), 1);
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

      // Collect exams for this date
      const dayExams = exams.filter((exam) => {
        const examDate = parseExamDateToDate(exam.date?.raw || "");
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

  function parseExamDateToDate(dateStr: string): Date | null {
    try {
      const parts = dateStr.trim().split(/\s+/);
      if (parts.length < 3) return null;

      const day = parseInt(parts[1]);
      const monthStr = parts[2];
      const monthMap: Record<string, number> = {
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
      const month = monthMap[monthStr];
      if (month === undefined) return null;

      let fullBuddhistYear: number;
      if (parts.length >= 4 && parts[3]) {
        const yearShort = parseInt(parts[3]);
        const fullGregorianYear = 2000 + yearShort;
        fullBuddhistYear = fullGregorianYear + 543;
      } else {
        fullBuddhistYear = new Date().getFullYear() + 543;
      }

      const gregorianYear = fullBuddhistYear - 543;
      return new Date(gregorianYear, month, day);
    } catch {
      return null;
    }
  }

  function parseDateInfo(dateStr: string, today: Date): { fullDate: string; daysUntil: number } {
    if (!dateStr || dateStr.trim() === "") {
      return { fullDate: "ไม่ระบุวันที่", daysUntil: 999 };
    }

    if (dateStr === "อื่นๆ" || dateStr === "จัดสอบเอง" || dateStr.includes("จัดสอบเอง")) {
      return { fullDate: "จัดสอบเอง", daysUntil: 999 };
    }

    try {
      const parts = dateStr.trim().split(/\s+/);
      if (parts.length < 3) return { fullDate: dateStr, daysUntil: 999 };

      const day = parseInt(parts[1]);
      const monthStr = parts[2];

      let fullBuddhistYear: number;
      if (parts.length >= 4 && parts[3]) {
        const yearShort = parseInt(parts[3]);
        const fullGregorianYear = 2000 + yearShort;
        fullBuddhistYear = fullGregorianYear + 543;
      } else {
        fullBuddhistYear = new Date().getFullYear() + 543;
      }

      const monthMap: Record<string, number> = {
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

      const month = monthMap[monthStr];
      if (month === undefined) return { fullDate: dateStr, daysUntil: 999 };

      const gregorianYear = fullBuddhistYear - 543;
      const examDate = new Date(gregorianYear, month, day);
      examDate.setHours(0, 0, 0, 0);

      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);

      const diffTime = examDate.getTime() - todayStart.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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
      const fullDate = `${day} ${thaiMonths[month]} ${fullBuddhistYear}`;

      return { fullDate, daysUntil: diffDays };
    } catch (err) {
      return { fullDate: dateStr, daysUntil: 999 };
    }
  }

  function getDayName(dateStr: string): string {
    if (!dateStr || dateStr === "อื่นๆ" || dateStr === "จัดสอบเอง" || dateStr.includes("จัดสอบเอง")) return "";

    const dayAbbrev = dateStr.split(" ")[0];
    const dayMap: Record<string, string> = {
      "จ.": "จันทร์",
      "อ.": "อังคาร",
      "พ.": "พุธ",
      "พฤ.": "พฤหัสบดี",
      "ศ.": "ศุกร์",
      "ส.": "เสาร์",
      "อา.": "อาทิตย์",
    };

    return dayMap[dayAbbrev] || "";
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
    const groups = new Map<string, ExamObject[]>();
    const today = new Date();

    exams.forEach((exam) => {
      const key = exam.date?.raw && exam.date.raw.trim() !== "" ? exam.date.raw : "อื่นๆ";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(exam);
    });

    groupedExams = Array.from(groups.entries()).map(([date, items]) => {
      const { fullDate, daysUntil } = parseDateInfo(date, today);
      return {
        date,
        dayName: getDayName(date),
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
    if (days >= 999) return "text-gray-500";
    if (days < 0) return "text-gray-400";
    if (days === 0) return "text-red-500";
    if (days === 1) return "text-orange-500";
    if (days <= 3) return "text-yellow-500";
    if (days <= 7) return "text-blue-500";
    return "text-green-500";
  }
</script>

<main
  class="h-screen p-2 flex flex-col justify-between dark:bg-gray-900 bg-white font-prompt"
>
  <!-- Main Container -->
  <div class="flex flex-col flex-grow p-1 min-h-0">
    <!-- Header -->
    <Head {studentInfo} {type} />

    <!-- Content -->
    <div
      class="flex w-full h-full min-h-0 border-2 border-dashed border-gray-400"
    >
      <!-- Calendar -->
      <div
        class="flex flex-col justify-start items-center w-1/2 border border-red-500 p-4 min-h-0"
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
        <div class="flex-1 flex flex-col w-full border border-pink-500 min-h-0">
          <!-- Day Headers -->
          <div class="grid grid-cols-7 gap-1.5 mb-2 border border-blue-500 p-4">
            {#each ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."] as day}
              <div
                class="text-center text-sm font-semibold text-gray-500 dark:text-orange-300 py-1 border border-green-400"
              >
                {day}
              </div>
            {/each}
          </div>

          <!-- Calendar Days -->
          <div
            class="grid grid-cols-7 gap-1.5 border border-yellow-500 flex-1 overflow-y-auto content-start auto-rows-min p-4"
          >
            {#each calendarDays as calDay}
              <button
                class="
                  relative aspect-square rounded-lg p-2 transition-all duration-150 flex flex-col
                  {calDay.isCurrentMonth
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400'}
                  {calDay.isToday
                  ? 'ring-2 ring-orange-200 dark:ring-orange-500 dark:bg-orange-500/20 bg-orange-200/40 text-orange-600 dark:text-orange-300 font-semibold'
                  : ''}
                  {!calDay.isCurrentMonth ? 'opacity-40' : 'opacity-100'}
                  hover:shadow-md hover:scale-105"
              >
                <!-- Day Number -->
                <div
                  class="text-xs font-medium {calDay.isToday
                    ? 'text-orange-400 dark:text-orange-300'
                    : // TODO: Change condition to highlight exam days
                      0 > 0
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-500 dark:text-gray-500'}"
                >
                  {calDay.day}
                </div>
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
