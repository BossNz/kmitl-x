<script lang="ts">
  import type { InformationI, ScheduleI } from "../libs/utils/StudentScraping";

  import Head from "../libs/components/studentTable/Head.svelte";
  import ScheduleTable from "../libs/components/studentTable/ScheduleTable.svelte";

  export let schedule: Array<ScheduleI>;
  export let information: InformationI;
</script>

<main class="min-h-screen p-2 space-y-3">
  <Head {information} />
  <ScheduleTable {schedule} />
</main>
