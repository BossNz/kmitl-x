<script lang="ts">
  import Icon from "@iconify/svelte";
  import type { ScheduleTableBlock } from "../../utils/PortalContentMapper";
  import { classes, cn } from '../../styles';
  import { Button } from '../common';

  export let block: ScheduleTableBlock;

  let selectedYear = block.years[0]?.value || "";
  let selectedSemester = block.semesters[0]?.value || "";
  let loading = false;
  let scheduleUrl = "";

  $: if (selectedYear && selectedSemester) {
    updateScheduleUrl();
  }

  function updateScheduleUrl() {
    const baseUrl = block.actionUrl;
    scheduleUrl = `${baseUrl}?year=${selectedYear}&semester=${selectedSemester}`;
  }

  function openInNewTab() {
    if (scheduleUrl) {
      window.open(scheduleUrl, "_blank", "noopener");
    }
  }
</script>

<div class="space-y-6">
  {#if block.title}
    <div class="flex items-center gap-3">
      <div class={classes.button.icon}>
        <Icon icon="ph:calendar-check-duotone" class="text-xl" />
      </div>
      <div>
        <p class={classes.text.labelOrange}>ตารางเรียน</p>
        <h3 class={classes.text.heading3}>{block.title}</h3>
      </div>
    </div>
  {/if}

  <div class={cn(classes.card.base, 'p-6 space-y-5')}>
    <div class="grid gap-4 sm:grid-cols-2">
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
    </div>

    <div class="flex items-center gap-3">
      <Button
        variant="primary"
        icon="ph:calendar-duotone"
        on:click={openInNewTab}
      >
        ดูตารางเรียน
      </Button>
      <p class={classes.text.bodySecondary}>
        เลือกปีและเทอมเพื่อดูตารางเรียนในหน้าต่างใหม่
      </p>
    </div>
  </div>

  {#if scheduleUrl}
    <div class={cn(classes.card.base, 'overflow-hidden')}>
      <div class="border-b border-gray-200/60 dark:border-gray-700/50 bg-orange-50/70 dark:bg-orange-900/20 backdrop-blur-sm px-6 py-4">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <Icon icon="ph:table-duotone" class="text-lg text-orange-600 dark:text-orange-400" />
            <div>
              <p class={cn(classes.text.body, 'font-semibold')}>
                ตารางเรียนปีการศึกษา {selectedYear} ภาคการศึกษา {selectedSemester}
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
              <p class="text-sm text-orange-600/70 dark:text-orange-400/70">กำลังโหลดตารางเรียน...</p>
            </div>
          </div>
        {:else}
          <iframe
            src={scheduleUrl}
            title="ตารางเรียนส่วนบุคคล"
            class="w-full h-full border-0"
            on:load={() => (loading = false)}
            on:loadstart={() => (loading = true)}
          ></iframe>
        {/if}
      </div>
    </div>
  {/if}
</div>
