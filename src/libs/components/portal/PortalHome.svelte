<script lang="ts">
  import { onMount } from "svelte";
  import type {
    PortalMeta,
    PortalSection,
    PortalStudentData,
  } from "../../types/portal.types";
  import Icon from "@iconify/svelte";
  import TodaySchedule from "./TodaySchedule.svelte";
  import { getCurrentYearSemester, type YearSemester } from "../../data";

  export let meta: PortalMeta;
  export let sections: PortalSection[];
  export let studentData: PortalStudentData | null;
  export let handleItemClick: (itemId: string) => void;

  let semester: YearSemester | null = null;
  let semesterLoading = true;

  $: semesterLabel = semester ? `${semester.SEMESTER}/${semester.YEAR}` : null;
  $: studentFirstName = studentData ? studentData.name.split(" ")[0] : null;

  // Curated quick-access links from scraped sections
  const quickLinkDefs = [
    { keyword: "ตารางเรียน", icon: "mdi:calendar-clock", color: "blue" },
    { keyword: "ตารางสอบ", icon: "mdi:clipboard-text-clock", color: "purple" },
    { keyword: "ผลการเรียน", icon: "mdi:chart-bar", color: "green" },
    {
      keyword: "ทรานสคริปต์",
      icon: "mdi:file-document-outline",
      color: "amber",
    },
    { keyword: "คะแนนกลางภาค", icon: "mdi:file-chart-outline", color: "rose" },
    { keyword: "ระเบียนประวัติ", icon: "mdi:account-circle", color: "cyan" },
  ] as const;

  type QuickLink = {
    id: string;
    label: string;
    icon: string;
    color: string;
  };

  let quickLinks: QuickLink[] = [];

  function buildQuickLinks() {
    const results: QuickLink[] = [];
    for (const def of quickLinkDefs) {
      for (const section of sections) {
        const item = section.items.find((i) => i.label.includes(def.keyword));
        if (item) {
          results.push({
            id: item.id,
            label: item.label,
            icon: def.icon,
            color: def.color,
          });
          break;
        }
      }
    }
    quickLinks = results;
  }

  const colorMap: Record<
    string,
    { bg: string; text: string; border: string; hoverBorder: string }
  > = {
    blue: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/10",
      hoverBorder: "hover:border-blue-500/30",
    },
    purple: {
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      border: "border-purple-500/10",
      hoverBorder: "hover:border-purple-500/30",
    },
    green: {
      bg: "bg-green-500/10",
      text: "text-green-400",
      border: "border-green-500/10",
      hoverBorder: "hover:border-green-500/30",
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/10",
      hoverBorder: "hover:border-amber-500/30",
    },
    rose: {
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      border: "border-rose-500/10",
      hoverBorder: "hover:border-rose-500/30",
    },
    cyan: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
      border: "border-cyan-500/10",
      hoverBorder: "hover:border-cyan-500/30",
    },
  };

  onMount(async () => {
    buildQuickLinks();

    try {
      semester = await getCurrentYearSemester();
    } catch {
      semester = null;
    } finally {
      semesterLoading = false;
    }
  });
</script>

<div class="max-w-7xl mx-auto space-y-6">
  <!-- Row 1: Welcome + Semester Info -->
  <div class="grid grid-cols-12 gap-6">
    <!-- Welcome Card -->
    <div
      class="col-span-12 lg:col-span-8 bg-white dark:bg-[#1e293b66] border border-slate-200 dark:border-white/10 dark:hover:bg-slate-800/60 rounded-3xl p-8 relative overflow-hidden group transition-colors"
    >
      <!-- Gradient Overlay -->
      <div
        class="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-orange-600/10 via-transparent to-transparent pointer-events-none"
      ></div>
      <div
        class="absolute -right-10 -top-10 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl group-hover:bg-orange-500/30 transition-all duration-700"
      ></div>

      <div class="relative z-10 h-full flex flex-col justify-center">
        <!-- Status Badge -->
        {#if semesterLabel}
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 w-fit mb-4"
          >
            <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"
            ></span>
            <span class="text-xs font-medium text-orange-400"
              >ภาคการศึกษาที่ {semesterLabel}</span
            >
          </div>
        {:else if semesterLoading}
          <div
            class="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse mb-4"
          ></div>
        {/if}

        <!-- Welcome Message -->
        <h1 class="text-4xl font-bold mb-2 dark:text-white">
          {#if studentFirstName}
            สวัสดี, {studentFirstName}
          {:else}
            ยินดีต้อนรับ
          {/if}
        </h1>

        <p class="text-slate-500 dark:text-slate-400 max-w-lg mb-8 text-lg">
          ระบบสารสนเทศนักศึกษา
          <br />
          สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง
        </p>

        <!-- CTA Buttons -->
        <div class="flex gap-4 flex-wrap">
          <button
            class="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold shadow-lg shadow-orange-600/20 transition-all transform hover:-translate-y-0.5"
            on:click={() =>
              handleItemClick(
                "student-7-https-www-reg-kmitl-ac-th-u-officer-student-php-close-header-1",
              )}
          >
            ดูข้อมูลส่วนตัว
          </button>
          <button
            class="px-6 py-3 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all dark:bg-white/5 dark:text-white dark:border-white/10 dark:hover:bg-white/10 font-semibold"
            on:click={() => window.open(window.location.origin, "_self")}
          >
            หน้าแรกสำนักทะเบียน
          </button>
        </div>
      </div>
    </div>

    <!-- Info Cards Column -->
    <div class="col-span-12 lg:col-span-4 grid grid-rows-2 gap-6">
      <!-- Semester Card -->
      <div
        class="bg-white dark:bg-[#1e293b66] border border-slate-200 dark:border-white/10 rounded-3xl p-6 flex items-center justify-between hover:border-orange-500/30 transition-colors group"
      >
        <div>
          <p
            class="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1"
          >
            ภาคการศึกษาปัจจุบัน
          </p>
          {#if semesterLabel}
            <p
              class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-orange-500 transition-colors"
            >
              {semesterLabel}
            </p>
          {:else if semesterLoading}
            <div
              class="h-9 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
            ></div>
          {:else}
            <p class="text-sm text-slate-400">ไม่สามารถโหลดข้อมูลได้</p>
          {/if}
        </div>
        <div
          class="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform"
        >
          <Icon class="w-7 h-7" icon="mdi:calendar-month" />
        </div>
      </div>

      <!-- Student ID Card -->
      <div
        class="bg-white dark:bg-[#1e293b66] border border-slate-200 dark:border-white/10 rounded-3xl p-6 flex items-center justify-between hover:border-blue-500/30 transition-colors group"
      >
        <div class="min-w-0 flex-1">
          <p
            class="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1"
          >
            รหัสนักศึกษา
          </p>
          {#if studentData}
            <p
              class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-blue-400 transition-colors"
            >
              {studentData.studentId}
            </p>
            <p class="text-xs text-slate-400 mt-1 truncate">
              {studentData.department}
            </p>
          {:else}
            <div class="space-y-2">
              <div
                class="h-7 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
              ></div>
              <div
                class="h-3 w-36 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
              ></div>
            </div>
          {/if}
        </div>
        <div
          class="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform flex-shrink-0"
        >
          <Icon class="w-7 h-7" icon="mdi:card-account-details-outline" />
        </div>
      </div>
    </div>
  </div>

  <!-- Row 2: Quick Links -->
  {#if quickLinks.length > 0}
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3
          class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"
        >
          <span class="w-1.5 h-6 bg-orange-500 rounded-full"></span>
          เข้าถึงด่วน
        </h3>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {#each quickLinks as link}
          {@const colors = colorMap[link.color] || colorMap.blue}
          <button
            class="bg-white dark:bg-[#1e293b66] border border-slate-200 dark:border-white/10 {colors.hoverBorder} rounded-2xl p-5 flex flex-col items-center gap-3 transition-all group hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 cursor-pointer"
            on:click={() => handleItemClick(link.id)}
          >
            <div
              class="w-12 h-12 rounded-xl {colors.bg} flex items-center justify-center {colors.text} group-hover:scale-110 transition-transform"
            >
              <Icon class="w-6 h-6" icon={link.icon} />
            </div>
            <span
              class="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white text-center leading-tight"
              >{link.label}</span
            >
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Row 3: Today's Schedule -->
  {#if semester}
    <TodaySchedule year={semester.YEAR} semester={semester.SEMESTER} />
  {:else if !semesterLoading}
    <!-- Cannot show schedule without semester info -->
    <div>
      <div class="flex items-center mb-4">
        <h3
          class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"
        >
          <span class="w-1.5 h-6 bg-orange-500 rounded-full"></span>
          ตารางเรียนวันนี้
        </h3>
      </div>
      <div
        class="bg-white dark:bg-[#1e293b66] border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center"
      >
        <Icon
          class="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3"
          icon="mdi:calendar-alert"
        />
        <p class="text-sm text-slate-400">ไม่สามารถโหลดข้อมูลภาคเรียนได้</p>
      </div>
    </div>
  {/if}
</div>
