<script lang="ts">
  import { onMount } from "svelte";
  import type { StudyTable } from "../libs/types/report-studytable.types";
  import Head from "../libs/components/studytable/Head.svelte";
  import ScheduleTable from "../libs/components/studytable/ScheduleTable.svelte";
  import Icon from "@iconify/svelte";
  import Button from "../libs/components/studytable/Button.svelte";

  export let studentInfo: StudyTable["studentInfo"];
  export let studySchedules: StudyTable["studySchedules"];

  onMount(() => {
    console.log("studentInfo:", studentInfo);
    console.log("studySchedules:", studySchedules);
  });
</script>

<main
  class="min-h-screen p-2 flex flex-col justify-between dark:bg-gray-900 bg-white"
>
  <!-- Content -->
  <div class="p-1 dark:bg-gray-900 bg-white">
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
      <Button on:click>
        <Icon icon="ph:file-png-light" class="my-auto text-2xl inline" />
        <span class="font-semibold">Download PNG</span>
      </Button>
      <Button on:click>
        <Icon icon="akar-icons:clipboard" class="my-auto text-2xl inline" />
        <span class="font-semibold">Copy to Clipboard</span>
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
