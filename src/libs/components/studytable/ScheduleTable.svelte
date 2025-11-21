<script lang="ts">
  import type { StudySchedule } from "../../types/report-studytable.types";
  import { createTimeSlot } from "../../utils/studytable/calculator";
  import CardSubject from "./CardSubject.svelte";

  export let studySchedules: StudySchedule[];
  const days = [
    { name: "Sun", code: "อา" },
    { name: "Mon", code: "จ" },
    { name: "Tue", code: "อ" },
    { name: "Wed", code: "พ" },
    { name: "Thu", code: "พฤ" },
    { name: "Fri", code: "ศ" },
    { name: "Sat", code: "ส" },
  ];

  const startHour = 8;
  const endHour = 20;

  const formatTime = (hour: number) => `${hour.toString().padStart(2, "0")}:00`;
</script>

<div>
  <table class="w-full rounded-2xl" cellspacing={4 * (endHour - startHour)}>
    <!-- Time Slots -->
    <thead>
      <tr>
        <th class="w-12 pr-2"></th>
        {#each Array.from({ length: endHour - startHour }, (_, i) => i + startHour) as hour}
          <th
            class="border-x dark:border-orange-100/10 border-orange-100 font-prompt font-normal whitespace-nowrap text-orange-400"
            colspan="4"
          >
            {`${formatTime(hour)} - ${formatTime(hour + 1)}`}
          </th>
        {/each}
      </tr>
    </thead>

    <!-- Days -->
    <tbody>
      {#each days as day}
        <tr class="hover:bg-orange-100/20 dark:hover:bg-orange-100/5 group">
          <!-- Week Day -->
          <td
            class="text-right font-semibold text-sm dark:text-orange-400 text-orange-300 whitespace-nowrap group-hover:scale-125 group-hover:text-orange-400 dark:group-hover:text-orange-600 transition-all pl-0 pr-2 font-prompt p-1 h-28"
          >
            {day.name}
          </td>

          <!-- Subject Card -->
          {#each createTimeSlot(studySchedules, day, startHour, endHour) as slot}
            {#if slot == undefined}
              <td
                class="border-x dark:border-orange-100/10 border-orange-100 min-w-0"
              ></td>
            {:else}
              <td class="min-w-0 font-prompt p-1 h-28" colspan={slot.colSpan}>
                <CardSubject subject={slot} />
              </td>
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
