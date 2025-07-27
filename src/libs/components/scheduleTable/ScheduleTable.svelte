<script lang="ts">
  import { createTimeSlot } from "../../utils/StudentHelper";
  import type { ScheduleI } from "../../utils/ScheduleTableScraping";
  import CardSubject from "./CardSubject.svelte";

  export let schedule: Array<ScheduleI>;

  const days = [
    { name: "Mon", code: "จ." },
    { name: "Tue", code: "อ." },
    { name: "Wed", code: "พ." },
    { name: "Thu", code: "พฤ." },
    { name: "Fri", code: "ศ." },
    { name: "Sat", code: "ส." },
    { name: "Sun", code: "อา." },
  ];

  const formatTime = (hour: number) => `${hour.toString().padStart(2, "0")}:00`;
</script>

<div>
  <table class="w-full rounded-2xl" cellspacing={44}>
    <thead>
      <tr>
        <th></th>
        {#each Array.from({ length: 20 - 8 }, (_, i) => i + 8) as hour}
          {#if hour < 20 - 1}
            <th class="border-x dark:border-orange-100/10 border-zinc-400/50 w-[8.33%]" colspan="4">
              {`${formatTime(hour)} - ${formatTime(hour + 1)}`}
            </th>
          {/if}
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each days as day}
        <tr class="group">
          <td
            class="td-day text-right font-semibold text-sm dark:text-orange-400 text-orange-500 whitespace-nowrap
            group-hover:scale-125 group-hover:text-orange-400 dark:group-hover:text-orange-600 transition-all"
          >
            {day.name}
          </td>
          {#each createTimeSlot(schedule, day.code) as slot}
            {#if slot == undefined}
              <td class="row-hover-overlay border-x dark:border-orange-100/10 border-zinc-400/50"></td>
            {:else}
              <td class="row-hover-overlay" colspan={slot.colSpan}>
                <CardSubject subject={slot} />
              </td>
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style scoped>
  /* table rows hover effects */
  tr.group > td.row-hover-overlay {
    position: relative;
  }
  tr.group > td.row-hover-overlay::before {
    @apply absolute inset-0 bg-black/10 dark:bg-white/5 opacity-0 pointer-events-none transition;
    content: "";
  }
  tr.group:hover > td.row-hover-overlay::before {
    @apply opacity-100;
  }

  th {
    @apply font-prompt font-normal whitespace-nowrap text-orange-500;
  }
  td {
    @apply font-prompt w-[2.22%] p-1 h-28;
  }

  .td-day {
    @apply px-2 py-0 w-auto;
  }
</style>
