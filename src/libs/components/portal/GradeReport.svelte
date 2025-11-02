<script lang="ts">
  import { onMount } from "svelte";
  import type {
    ScoreboardHeader,
    ScheduleOption,
    GradeReportCourse,
    GradeReportSummary,
    GradeReportLegendItem,
  } from "../../utils/PortalContentMapper";
  import { mapDocumentToContent } from "../../utils/PortalContentMapper";
  import Icon from "@iconify/svelte";
  import { classes, cn } from '../../styles';
  import { Button, Select, Loading } from '../common';

  export let actionUrl: string;
  export let pdfUrl: string | undefined = undefined;
  export let years: ScheduleOption[];
  export let semesters: ScheduleOption[];
  export let selectedYear: string | undefined;
  export let selectedSemester: string | undefined;
  export let header: ScoreboardHeader | undefined;
  export let courses: GradeReportCourse[];
  export let summaries: GradeReportSummary[];
  export let legend: GradeReportLegendItem[];
  export let note: string | undefined;

  let currentYear = selectedYear || years[0]?.value || "";
  let currentSemester = selectedSemester || semesters[0]?.value || "";
  let isLoading = false;
  let loadError: string | undefined;

  // Auto-fetch on mount if we don't have data yet
  onMount(() => {
    if (courses.length === 0 && currentYear && currentSemester) {
      fetchGradeReport(currentYear, currentSemester);
    }
  });

  async function fetchGradeReport(year: string, semester: string) {
    isLoading = true;
    loadError = undefined;

    try {
      // Build URL with query parameters for GET request
      const url = new URL(actionUrl, window.location.origin);
      url.searchParams.set("year", year);
      url.searchParams.set("semester", semester);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch grade report");

      // Read as ArrayBuffer to handle windows-874 encoding
      const buffer = await response.arrayBuffer();
      
      // Decode as windows-874 (Thai encoding)
      const decoder = new TextDecoder('windows-874');
      const html = decoder.decode(buffer);
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Extract data using PortalContentMapper
      const content = mapDocumentToContent(doc, { sourceUrl: url.toString() });
      
      if (content.blocks.length > 0 && content.blocks[0].type === "gradeReport") {
        const block = content.blocks[0];
        
        // Update all data
        header = block.header;
        courses = block.courses;
        summaries = block.summaries;
        legend = block.legend;
        note = block.note;
        pdfUrl = block.pdfUrl;
      } else {
        loadError = "ไม่สามารถแปลงข้อมูลได้ โปรดลองใหม่อีกครั้ง";
      }
    } catch (error) {
      loadError = "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง";
    } finally {
      isLoading = false;
    }
  }

  function handleSubmit() {
    if (!actionUrl || !currentYear || !currentSemester) return;
    
    // POST form submission - opens in new tab
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

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  function getGradeColor(grade: string): string {
    if (!grade || grade === "-") return "text-muted-foreground";
    
    const gradeUpper = grade.toUpperCase();
    
    // Excellent grades
    if (["A", "A+"].includes(gradeUpper)) return "text-green-600 dark:text-green-400";
    
    // Good grades
    if (["B+", "B"].includes(gradeUpper)) return "text-blue-600 dark:text-blue-400";
    
    // Average grades
    if (["C+", "C"].includes(gradeUpper)) return "text-yellow-600 dark:text-yellow-400";
    
    // Below average grades
    if (["D+", "D"].includes(gradeUpper)) return "text-orange-600 dark:text-orange-400";
    
    // Fail grade
    if (gradeUpper === "F") return "text-red-600 dark:text-red-400";
    
    // Pass/Satisfactory
    if (gradeUpper === "S") return "text-green-600 dark:text-green-400";
    
    // Special grades
    if (["I", "W", "U"].includes(gradeUpper)) return "text-purple-600 dark:text-purple-400";
    
    return "text-foreground";
  }

  function getLegendSymbolColor(item: GradeReportLegendItem): string {
    if (item.symbolColor === "green") return "text-green-600 dark:text-green-400";
    if (item.symbolColor === "red") return "text-red-600 dark:text-red-400";
    return "text-zinc-400 dark:text-zinc-500";
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
              {header.studentThaiName || header.studentEnglishName || "-"}
            </h3>
            {#if header.studentEnglishName && header.studentThaiName}
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
              {#each years as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>
        {/if}

        {#if semesters.length > 0}
          <div>
            <label for="semester-select" class={cn(classes.text.label, 'mb-2')}>
              ภาคเรียน
            </label>
            <select
              id="semester-select"
              bind:value={currentSemester}
              class={classes.input.base}
            >
              {#each semesters as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>
        {/if}
      </div>

      <div class="mt-4 flex flex-wrap gap-3">
        <Button
          variant="primary"
          icon="ph:magnifying-glass-duotone"
          disabled={!currentYear || !currentSemester}
          on:click={handleSubmit}
        >
          ดูผลการเรียน
        </Button>

        {#if pdfUrl}
          <Button
            variant="secondary"
            icon="ph:file-pdf-duotone"
            iconClass="w-5 h-5 text-red-500"
            href={pdfUrl}
            target="_blank"
          >
            PDF
          </Button>
        {/if}
      </div>

      {#if loadError}
        <div class={cn(
          'mt-4 p-4 rounded-lg flex items-start gap-3',
          'bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm',
          'border border-red-200/60 dark:border-red-800/50'
        )}>
          <Icon icon="ph:warning-duotone" class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p class={cn(classes.text.body, 'text-red-700 dark:text-red-300')}>{loadError}</p>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Loading State -->
  {#if isLoading}
    <div class={cn(classes.card.base, 'p-8')}>
      <div class="flex flex-col items-center justify-center gap-4">
        <Icon icon="svg-spinners:ring-resize" class="text-4xl text-orange-500" />
        <p class={classes.text.body}>กำลังโหลดข้อมูลผลการเรียน...</p>
      </div>
    </div>
  {/if}

  <!-- Courses Table -->
  {#if courses.length > 0}
    <div class={classes.table.wrapper}>
      <table class={classes.table.base}>
        <thead class={classes.table.header}>
          <tr>
            <th class={cn(classes.table.th, 'whitespace-nowrap')}>No.</th>
            <th class={cn(classes.table.th, 'whitespace-nowrap')}>Course No.</th>
            <th class={cn(classes.table.th, 'min-w-[200px]')}>Course Title</th>
            <th class={cn(classes.table.th, 'text-center whitespace-nowrap')}>Section</th>
            <th class={cn(classes.table.th, 'text-center whitespace-nowrap')}>Credit</th>
            <th class={cn(classes.table.th, 'text-center whitespace-nowrap')}>Type</th>
            <th class={cn(classes.table.th, 'text-center whitespace-nowrap')}>Grade</th>
          </tr>
        </thead>
        <tbody class={classes.table.body}>
          {#each courses as course, index}
            <tr class={classes.table.row}>
              <td class={cn(classes.table.cell, 'text-center')}>{course.no}</td>
              <td class={cn(classes.table.cell, 'font-medium whitespace-nowrap')}>{course.courseNo}</td>
              <td class={classes.table.cell}>{course.courseTitle}</td>
              <td class={cn(classes.table.cell, 'text-center')}>{course.section}</td>
              <td class={cn(classes.table.cell, 'text-center')}>{course.credit}</td>
              <td class={cn(classes.table.cell, 'text-center text-gray-600 dark:text-gray-400')}>{course.type}</td>
              <td class={cn(classes.table.cell, 'text-center')}>
                <span class={cn('inline-flex items-center justify-center px-2.5 py-1 rounded-md font-semibold text-base', getGradeColor(course.grade))}>
                  {course.grade || "-"}
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  <!-- Summary Table -->
  {#if summaries.length > 0}
    <div class="overflow-x-auto rounded-lg border border-gray-200/60 dark:border-gray-700/50 bg-white/95 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm">
      <table class="min-w-full divide-y divide-gray-200/70 dark:divide-gray-700/60">
        <thead class="bg-gradient-to-br from-orange-500/95 via-orange-600/95 to-orange-700/95 backdrop-blur-sm">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider"></th>
            <th class="px-4 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">CA</th>
            <th class="px-4 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">CP</th>
            <th class="px-4 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">CD</th>
            <th class="px-4 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">GP</th>
            <th class="px-4 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">GPS/GPA</th>
            <th class="px-4 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200/70 dark:divide-gray-700/60 bg-white/95 dark:bg-gray-800/90">
          {#each summaries as summary, index}
            <tr class="hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition-colors">
              <td class="px-4 py-3 text-base font-medium text-gray-900 dark:text-white">{summary.label}</td>
              <td class="px-4 py-3 text-center text-base text-gray-700 dark:text-gray-300">{summary.ca}</td>
              <td class="px-4 py-3 text-center text-base text-gray-700 dark:text-gray-300">{summary.cp}</td>
              <td class="px-4 py-3 text-center text-base text-gray-700 dark:text-gray-300">{summary.cd}</td>
              <td class="px-4 py-3 text-center text-base font-semibold text-gray-900 dark:text-white">{summary.gp}</td>
              <td class="px-4 py-3 text-center text-base font-semibold text-orange-600 dark:text-orange-400">{summary.gpsGpa}</td>
              <td class="px-4 py-3 text-center text-base">
                {#if summary.status.toLowerCase().includes("incomplete")}
                  <span class="text-red-600 dark:text-red-400 font-medium">
                    {summary.status}
                  </span>
                {:else}
                  <span class="text-gray-700 dark:text-gray-300">
                    {summary.status}
                  </span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  <!-- Legend -->
  {#if legend.length > 0}
    <div class="rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-sm">
      <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="ph:info-duotone" class="w-5 h-5 text-orange-600 dark:text-orange-400" />
        สัญลักษณ์และคำอธิบาย
      </h4>
      <div class="grid sm:grid-cols-2 gap-3">
        {#each legend as item}
          <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-50/70 dark:bg-gray-700/40 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/40">
            <span class="flex-shrink-0 font-bold text-lg {getLegendSymbolColor(item)}">
              {item.symbol}
            </span>
            <span class="text-base text-gray-700 dark:text-gray-300">
              {item.description}
            </span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Note -->
  {#if note}
    <div class="flex items-start gap-3 p-4 bg-amber-50/70 dark:bg-amber-900/20 backdrop-blur-sm border border-amber-200/60 dark:border-amber-800/50 rounded-lg">
      <Icon icon="ph:warning-duotone" class="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
      <p class="text-base leading-relaxed text-amber-800 dark:text-amber-200 whitespace-pre-line">
        {note}
      </p>
    </div>
  {/if}
</div>
