<script lang="ts">
  import type { InformationI, ScheduleI } from "../libs/utils/StudentScraping";
  import Icon from "@iconify/svelte";
  import { toBlob } from "html-to-image";
  import { downloadBlob } from "../libs/utils/StudentHelper";
  import Head from "../libs/components/scheduleTable/Head.svelte";
  import ScheduleTable from "../libs/components/scheduleTable/ScheduleTable.svelte";

  export let schedule: Array<ScheduleI>;
  export let information: InformationI;

  let captureScreen: any;
  const exportPng = async () => {
    const blob = await toBlob(captureScreen);
    if (blob == null) return;
    downloadBlob(
      blob,
      `schedule_${information.studentID}_${information.Semester}_${information.year}.png`
    );
  };
</script>

<main class="min-h-screen p-2 flex flex-col justify-between">
  <div bind:this={captureScreen} class="bg-white p-1">
    <Head {information} />
    <div class="mb-auto mt-5">
      <ScheduleTable {schedule} />
    </div>
  </div>
  <footer class="flex justify-between">
    <div class="space-x-2">
      <button
        on:click={exportPng}
        class="rounded-lg py-1 px-3 bg-orange-100 text-orange-500 text-xs hover:scale-105 transition-all"
      >
        export
        <Icon icon="ph:file-png-light" class="my-auto text-2xl inline" />
      </button>
      <button
        on:click={() =>
          (window.location.href = "https://github.com/BossNz/kmitl-x")}
        class="rounded-lg py-1 px-3 bg-orange-100 text-orange-500 text-xs hover:scale-105 transition-all"
      >
        contribute
        <Icon icon="mdi:github" class="my-auto text-2xl inline" />
      </button>
    </div>
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
