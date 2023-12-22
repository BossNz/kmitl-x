<script lang="ts">
  import type { ScheduleI } from "../../utils/StudentScraping";
  import CardSubject from "./cardSubject.svelte";
  export let schedule: Array<ScheduleI>;
  for (let hour = 8; hour < 20; hour++) {
    const startTime = `${hour.toString().padStart(2, "0")}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;

    const timeRange = `${startTime} - ${endTime}`;
    console.log(timeRange);
  }
  const days = [
    "จันทร์",
    "อังคาร",
    "พุธ",
    "พฤหัสบดี",
    "ศุกร์",
    "เสาร์",
    "อาทิตย์",
  ];

  const formatTime = (hour: number) => `${hour.toString().padStart(2, "0")}:00`;
</script>

<div>
  <table class="w-full rounded-2xl">
    <thead>
      <tr>
        <th>-</th>
        {#each Array.from({ length: 20 - 8 }, (_, i) => i + 8) as hour}
          {#if hour < 20 - 1}
            <th>{`${formatTime(hour)} - ${formatTime(hour + 1)}`}</th>
          {/if}
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each days as day}
        <tr>
          <td class="text-left">{day}</td>
          <td></td>
          <td></td>
          <td colspan="3">
            <CardSubject subject={schedule[3]} />
          </td>
          <td></td>
          <td></td>
          <td colspan="2">
            <CardSubject subject={schedule[6]} />
          </td>
          <td></td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style scoped>
  th {
    @apply font-prompt font-normal border text-center;
  }
  td {
    @apply font-prompt;
  }
</style>
