<script lang="ts">
  import type { InformationI, ScheduleI } from "../libs/utils/StudentScraping";

  import Head from "../libs/components/studentTable/Head.svelte";
  import ScheduleTable from "../libs/components/studentTable/ScheduleTable.svelte";
  import Footer from "../libs/components/studentTable/Footer.svelte";

  export let schedule: Array<ScheduleI>;
  export let information: InformationI;
</script>

<main class="min-h-screen p-2 flex flex-col justify-between">
  <Head {information} />
  <main class="mb-auto mt-5">
    <ScheduleTable {schedule} />
  </main>
  <Footer/>
</main>
