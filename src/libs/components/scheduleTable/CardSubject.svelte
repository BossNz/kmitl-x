<script lang="ts">
  import type { ScheduleI } from "../../types";
  export let subject: ScheduleI;
</script>

  <div
  class="min-w-0 dark:bg-orange-500/10 bg-orange-100/50 border-l-2 dark:border-orange-400 border-orange-200 px-3 py-1 h-full flex flex-col justify-between rounded
  hover:border-orange-500 dark:hover:border-orange-600 transition-all dark:text-orange-300 text-black overflow-hidden"
>
  <div class="flex justify-between text-xs opacity-65 z-10">
    <p class="truncate">{subject.time.type}</p>
    <p class="whitespace-nowrap truncate">
      {subject.time.start} -
      {subject.time.end}
    </p>
  </div>
  <h3 class="text-orange-400 text-left text-sm truncate">{subject.name}</h3>
  <div class="flex justify-between text-xs opacity-65">
    <p class="whitespace-nowrap truncate">
      section({subject.time.type == "ทฤษฏี"
        ? subject.theory
        : subject.practice})
    </p>
    <p class="whitespace-nowrap truncate">
      {subject.building}
      {subject.room == "" ? "" : `( ${subject.room} )`}
    </p>
  </div>
</div>
