<script lang="ts">
  import { createTimeSlot } from "../../utils/StudentHelper";
  import type { ScheduleI } from "../../types";
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
            <th class="border-x dark:border-orange-100/10 border-orange-100 w-[8.33%]" colspan="4">
              {`${formatTime(hour)} - ${formatTime(hour + 1)}`}
            </th>
          {/if}
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each days as day}
        <tr class="hover:bg-orange-100/20 dark:hover:bg-orange-100/5 group">
          <td
            class="text-right font-semibold text-sm dark:text-orange-400 text-orange-300 whitespace-nowrap group-hover:scale-125 group-hover:text-orange-400 dark:group-hover:text-orange-600 transition-all"
          >
            {day.name}
          </td>
          {#each createTimeSlot(schedule, day.code) as slot}
            {#if slot == undefined}
              <td class="border-x dark:border-orange-100/10 border-orange-100"></td>
            {:else}
              <td colspan={slot.colSpan}>
                <CardSubject subject={slot} />
              </td>
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style lang="postcss">
  th {
    @apply font-prompt font-normal whitespace-nowrap text-orange-400;
  }
  td {
    @apply font-prompt w-[2.22%] p-1 h-28;
  }
</style>
