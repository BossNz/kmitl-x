<script lang="ts">
  import { createTimeSlot } from "../../utils/StudentHelper";
  import type { ScheduleI } from "../../types";
  import CardSubject from "./CardSubject.svelte";

  export let schedule: Array<ScheduleI>
  export let startHourProp: number | null = null;
  export let endHourProp: number | null = null;

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

  const timeInterval = 15;
  const deriveRange = (data: Array<ScheduleI>) => {
    const defaultStart = 8;
    const defaultEnd = 19;
    if (!data || data.length === 0) return { startHour: defaultStart, endHour: defaultEnd };
    let min = Infinity;
    let max = -Infinity;
    for (const s of data) {
      const [sh, sm] = s.time.start.split(":").map(Number);
      const [eh, em] = s.time.end.split(":").map(Number);
      const startMinutes = sh * 60 + (sm || 0);
      const endMinutes = eh * 60 + (em || 0);
      if (startMinutes < min) min = startMinutes;
      if (endMinutes > max) max = endMinutes;
    }
    
    const startHour = Math.min(defaultStart, Math.floor(min / 60));
    const endHour = Math.max(defaultEnd, Math.ceil(max / 60));
    return { startHour, endHour };
  };

  let startHour = 8;
  let endHour = 20;
  
  $: {
    const range = deriveRange(schedule ?? []);
    startHour = startHourProp ?? range.startHour;
    endHour = endHourProp ?? range.endHour;
  }

  const colsPerHour = Math.round(60 / timeInterval);
</script>

<div>
  <table class="w-full rounded-2xl border-collapse table-fixed">
    <thead>
      <tr>
  <th class="w-12 pr-2"></th>
        {#each Array.from({ length: endHour - startHour }, (_, i) => i + startHour) as hour}
          {#if hour < endHour}
            <th class="border-x dark:border-orange-100/10 border-orange-100" colspan={colsPerHour}>
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
            class="text-right font-semibold text-sm dark:text-orange-400 text-orange-300 whitespace-nowrap group-hover:scale-125 group-hover:text-orange-400 dark:group-hover:text-orange-600 transition-all pl-0 pr-2"
          >
            {day.name}
          </td>
          {#each createTimeSlot(schedule, day.code, startHour, endHour, timeInterval) as slot}
            {#if slot == undefined}
              <td class="border-x dark:border-orange-100/10 border-orange-100 min-w-0"></td>
            {:else}
              <td class="min-w-0" colspan={slot.colSpan}>
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
    @apply font-prompt p-1 h-28;
  }
</style>
