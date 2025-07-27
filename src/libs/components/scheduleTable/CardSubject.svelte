<script lang="ts">
  import type { ScheduleI } from "../../utils/ScheduleTableScraping";
  export let subject: ScheduleI;
</script>

<div
  class="relative z-5 dark:bg-orange-500/10 bg-orange-100/50 overflow-hidden border-l-4 border-2 border-orange-400/15
  border-l-orange-400/70 dark:border-l-orange-400 px-3 py-1 h-full flex flex-col justify-between rounded
  hover:border-orange-500 dark:hover:border-orange-600 transition-all dark:text-orange-300 text-black"
>
  <div class="flex justify-between text-xs opacity-65 z-10">
    <p>{subject.time.type}</p>
    <p class="whitespace-nowrap">
      {subject.time.start} -
      {subject.time.end}
    </p>
  </div>
  <h3 class="text-orange-500 text-left text-sm z-10">{subject.name}</h3>
  <div class="flex justify-between text-xs opacity-65">
    <p class="whitespace-nowrap">
      section({subject.time.type == "ทฤษฏี"
        ? subject.theory
        : subject.practice})
    </p>
    <p class="whitespace-nowrap">
      {subject.building}
      {subject.room == "" ? "" : `( ${subject.room} )`}
    </p>
  </div>
</div>
