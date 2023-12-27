<script lang="ts">
  import type { InformationI, ScheduleI } from "../libs/utils/StudentScraping";

  import Head from "../libs/components/studentTable/Head.svelte";
  import ScheduleTable from "../libs/components/studentTable/ScheduleTable.svelte";
  import Footer from "../libs/components/studentTable/Footer.svelte";
  import { toBlob } from "html-to-image";

  export let schedule: Array<ScheduleI>;
  export let information: InformationI;

  let captureScreen: any;
  // setTimeout(async ()=>{
  //   const blob = await toBlob(captureScreen)
  //   if(blob == null) return
  //   var file = new Blob([blob], { type: 'image/png' });
  //   var fileURL = URL.createObjectURL(file);
  //   window.open(fileURL);
  // },1000)
</script>

<main class="min-h-screen p-2 flex flex-col justify-between">
  <div bind:this={captureScreen} class="bg-white">
    <Head {information} />
    <div class="mb-auto mt-5">
      <ScheduleTable {schedule} />
    </div>
  </div>
  <Footer/>
</main>
