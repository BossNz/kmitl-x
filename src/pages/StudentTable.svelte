<script lang="ts">
  import type { InformationI, ScheduleI } from "../libs/utils/StudentScraping";

  import Head from "../libs/components/studentTable/Head.svelte";
  import ScheduleTable from "../libs/components/studentTable/ScheduleTable.svelte";
  import { toBlob } from "html-to-image";
  import { downloadBlob } from "../libs/utils/StudentHelper";

  export let schedule: Array<ScheduleI>;
  export let information: InformationI;

  let captureScreen: any;
  const exportPng = async () => {
    const blob = await toBlob(captureScreen);
    if (blob == null) return;
    downloadBlob(blob, `schedule_${information.studentID}.png`);
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
        class="rounded-lg px-3 py-1 bg-orange-100 text-orange-500"
      >
        Export as PNG
      </button>
    </div>
    <div class="mt-auto text-right text-xs text-orange-300">
      <p class="opacity-75">Redesign by BossNz &lt;3 </p>
      <p>Powered by Computer Science, KMITL</p>
    </div>
  </footer>
</main>
