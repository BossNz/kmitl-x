<script lang="ts">
  import { toBlob } from "html-to-image";
  import type { StudyTable } from "../libs/types/report-studytable.types";
  import Head from "../libs/components/studytable/Head.svelte";
  import ScheduleTable from "../libs/components/studytable/ScheduleTable.svelte";
  import Icon from "@iconify/svelte";
  import Button from "../libs/components/studytable/Button.svelte";
  import { downloadBlob } from "../libs/utils/studytable/exporter";

  export let studentInfo: StudyTable["studentInfo"];
  export let studySchedules: StudyTable["studySchedules"];

  let captureScreen: any;
  let copyPngToggle: boolean = false;

  const exportPng = async () => {
    const blob = await toBlob(captureScreen);
    if (blob)
      downloadBlob(
        blob,
        `schedule_${studentInfo.studentId}_${studentInfo.semester}_${studentInfo.year}.png`
      );
  };
  const copyPng = async () => {
    copyPngToggle = true;
    const blob = await toBlob(captureScreen);
    if (blob) {
      navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setTimeout(() => {
        copyPngToggle = false;
      }, 1000);
    }
  };
</script>

<main
  class="min-h-screen p-2 flex flex-col justify-between dark:bg-gray-900 bg-white"
>
  <!-- Content -->
  <div bind:this={captureScreen} class="p-1 dark:bg-gray-900 bg-white">
    <!-- Header -->
    <Head {studentInfo} />

    <!-- Schedule Table -->
    <div class="mb-auto mt-5">
      <ScheduleTable {studySchedules} />
    </div>
  </div>

  <!-- Footer -->
  <footer class="flex justify-between items-end">
    <!-- Left -->
    <div class="space-x-2">
      <Button on:click={exportPng}>
        <Icon icon="ph:file-png-light" class="my-auto text-2xl inline" />
        <span class="font-semibold">Download PNG</span>
      </Button>
      <Button on:click={copyPng}>
        <Icon icon="akar-icons:clipboard" class="my-auto text-2xl inline" />
        <span class="font-semibold"
          >{copyPngToggle ? "Copied!" : "Copy to Clipboard"}</span
        >
      </Button>
    </div>

    <!-- Right -->
    <div class="mt-auto text-right text-xs text-orange-300">
      <p class="opacity-75">
        Redesign by BossNz <Icon
          icon="fluent-emoji:love-you-gesture"
          class="inline"
        />
      </p>
      <p>Powered by Computer Science, KMITL</p>
    </div>
  </footer>
</main>
