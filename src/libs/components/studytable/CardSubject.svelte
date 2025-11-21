<script lang="ts">
  import type { StudySchedule } from "../../types/report-studytable.types";
  export let subject: StudySchedule;
</script>

<div
  class="min-w-0 dark:bg-orange-500/10 bg-orange-100/50 border-l-2 dark:border-orange-400 border-orange-200 px-3 py-1 h-full flex flex-col justify-between rounded
  hover:border-orange-500 dark:hover:border-orange-600 transition-all dark:text-orange-300 text-black"
>
  <!-- Top -->
  <div class="flex justify-between text-xs opacity-65 z-10">
    <!-- Type -->
    <p class="truncate">
      {subject.time[0]?.type === "lecture" ? "Lecture" : "Practical"}
    </p>

    <!-- Time -->
    <p class="truncate">
      {subject.time[0]?.startTime} - {subject.time[0]?.endTime}
    </p>
  </div>

  <!-- Subject -->
  <h3 class="text-orange-400 text-left text-sm truncate">
    {subject.subjectName}
  </h3>
  <!-- Bottom -->
  <div class="flex justify-between text-xs opacity-65">
    <!-- Section -->
    <p class="truncate">
      section({subject.time[0]?.type === "lecture"
        ? subject.lectureSection
        : subject.practiceSection})
    </p>

    <!-- Location -->
    <p class="truncate">
      {subject.building}
      {subject.room === "" ? "" : ` ( ${subject.room} )`}
    </p>
  </div>
</div>
