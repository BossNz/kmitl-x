<script lang="ts">
  import { onMount } from "svelte";
  import type { StudySchedule } from "../../types/report-studytable.types";
  import { runScraper } from "../../handler/scraperHandler";
  import Icon from "@iconify/svelte";

  export let year: string;
  export let semester: string;

  type TodayClass = {
    subjectCode: string;
    subjectName: string;
    startTime: string;
    endTime: string;
    type: "lecture" | "practice";
    room: string;
    building: string;
  };

  let todayClasses: TodayClass[] = [];
  let loading = true;
  let error = false;

  // Day-of-week maps (JS getDay() => scraper day values)
  // Scraper regex captures `([ก-ฮ]{1,2}|อา)` WITHOUT the trailing dot
  const dayIndexToThai: Record<number, string[]> = {
    0: ["อา"],
    1: ["จ"],
    2: ["อ"],
    3: ["พ"],
    4: ["พฤ"],
    5: ["ศ"],
    6: ["ส"],
  };
  const dayIndexToEng: Record<number, string> = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };

  const thaiMonths = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  const thaiDaysShort = [
    "อาทิตย์",
    "จันทร์",
    "อังคาร",
    "พุธ",
    "พฤหัสบดี",
    "ศุกร์",
    "เสาร์",
  ];

  $: todayInfo = (() => {
    const now = new Date();
    return {
      day: now.getDate(),
      month: thaiMonths[now.getMonth()],
      weekday: thaiDaysShort[now.getDay()],
      year: now.getFullYear(),
    };
  })();

  onMount(async () => {
    try {
      const url =
        window.location.origin +
        `/u_student/report_studytable_show.php?year=${year}&semester=${semester}&close_header=1`;
      const data = (await runScraper(url)) as {
        studySchedules?: StudySchedule[];
      };
      if (!data?.studySchedules) {
        error = true;
        return;
      }

      const today = new Date().getDay();
      const thaiDays = dayIndexToThai[today] || [];
      const engDay = dayIndexToEng[today] || "";

      const classes: TodayClass[] = [];
      for (const schedule of data.studySchedules) {
        for (const t of schedule.time) {
          const isToday =
            thaiDays.includes(t.day) ||
            t.day.toLowerCase() === engDay.toLowerCase();
          if (isToday) {
            classes.push({
              subjectCode: schedule.subjectCode,
              subjectName: schedule.subjectName,
              startTime: t.startTime,
              endTime: t.endTime,
              type: t.type,
              room: schedule.room,
              building: schedule.building,
            });
          }
        }
      }

      classes.sort((a, b) => a.startTime.localeCompare(b.startTime));
      todayClasses = classes;
    } catch {
      error = true;
    } finally {
      loading = false;
    }
  });
</script>

<div>
  <div class="flex items-center justify-between mb-4">
    <h3
      class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"
    >
      <span class="w-1.5 h-6 bg-orange-500 rounded-full"></span>
      ตารางเรียนวันนี้
    </h3>
    <span class="text-sm text-slate-400 font-medium">
      วัน{todayInfo.weekday}
      {todayInfo.day}
      {todayInfo.month}
      {todayInfo.year}
    </span>
  </div>

  {#if loading}
    <!-- Loading skeleton -->
    <div
      class="bg-white dark:bg-[#1e293b66] border border-slate-200 dark:border-white/10 rounded-2xl p-6"
    >
      <div class="space-y-4">
        {#each [1, 2, 3] as _}
          <div class="flex items-center gap-4">
            <div
              class="h-12 w-16 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"
            ></div>
            <div class="flex-1 space-y-2">
              <div
                class="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
              ></div>
              <div
                class="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
              ></div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else if error}
    <!-- Error state -->
    <div
      class="bg-white dark:bg-[#1e293b66] border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center"
    >
      <Icon
        class="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3"
        icon="mdi:calendar-alert"
      />
      <p class="text-sm text-slate-400">ไม่สามารถโหลดตารางเรียนได้</p>
      <p class="text-xs text-slate-500 mt-1">
        โปรดเข้าหน้าตารางเรียนผ่านเมนูด้านซ้าย
      </p>
    </div>
  {:else if todayClasses.length === 0}
    <!-- No classes today -->
    <div
      class="bg-white dark:bg-[#1e293b66] border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center"
    >
      <Icon
        class="w-10 h-10 text-green-400 mx-auto mb-3"
        icon="mdi:calendar-check"
      />
      <p class="text-base font-semibold text-slate-900 dark:text-white">
        ไม่มีการเรียนการสอนวันนี้
      </p>
      <p class="text-sm text-slate-400 mt-1">พักผ่อนให้เต็มที่</p>
    </div>
  {:else}
    <!-- Classes list -->
    <div
      class="bg-white dark:bg-[#1e293b66] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-white/5"
    >
      {#each todayClasses as cls}
        <div
          class="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          <!-- Time block -->
          <div
            class="flex-shrink-0 w-[72px] bg-slate-100 dark:bg-slate-800 rounded-xl p-2 text-center border border-slate-200 dark:border-slate-700"
          >
            <div class="text-xs font-bold text-orange-500">
              {cls.startTime}
            </div>
            <div class="text-[10px] text-slate-400 my-0.5">ถึง</div>
            <div class="text-xs font-medium text-slate-600 dark:text-slate-300">
              {cls.endTime}
            </div>
          </div>

          <!-- Subject info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <span
                class="text-[10px] font-bold px-1.5 py-0.5 rounded {cls.type ===
                'lecture'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}"
              >
                {cls.type === "lecture" ? "ทฤษฎี" : "ปฏิบัติ"}
              </span>
              <span class="text-xs text-slate-400 font-mono">
                {cls.subjectCode}
              </span>
            </div>
            <p
              class="text-sm font-semibold text-slate-900 dark:text-white truncate"
            >
              {cls.subjectName}
            </p>
            {#if cls.room || cls.building}
              <p class="text-xs text-slate-400 mt-0.5 truncate">
                {[cls.room, cls.building].filter(Boolean).join(" · ")}
              </p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
