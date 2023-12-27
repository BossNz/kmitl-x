<script lang="ts">
  import type { InformationI, ScheduleI } from "../libs/utils/StudentScraping";

  import Head from "../libs/components/studentTable/Head.svelte";
  import ScheduleTable from "../libs/components/studentTable/ScheduleTable.svelte";
  import { toBlob } from "html-to-image";

  export let schedule: Array<ScheduleI>;
  export let information: InformationI;

  let captureScreen: any;
  const exportPng = async () => {
    const blob = await toBlob(captureScreen);
    if (blob == null) return;
    var file = new Blob([blob], { type: "image/png" });
    var fileURL = URL.createObjectURL(file);
    window.open(fileURL);
  };
</script>

<main class="min-h-screen p-2 flex flex-col justify-between">
  <div bind:this={captureScreen} class="bg-white">
    <Head {information} />
    <div class="mb-auto mt-5">
      <ScheduleTable {schedule} />
    </div>
  </div>
  <footer class="text-end">
    <button
      on:click={exportPng}
      class="rounded-full px-2 py-1 bg-orange-100 text-orange-500"
    >
      export png
    </button>
    <p class="text-orange-300 text-xs">Powered by Computer Science, Kmitl</p>
  </footer>
</main>
