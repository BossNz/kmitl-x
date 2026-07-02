<script lang="ts">
  import type { StudyTable } from "../../types/report-studytable.types";
  import KmitlLogo from "../common/KmitlLogo.svelte";
  export let studentInfo: StudyTable["studentInfo"];
</script>

<div
  class="dark:bg-orange-500/10 bg-orange-100/50 text-orange-500 rounded font-prompt px-3 py-3 border dark:border-orange-500 border-orange-200"
>
  <div class="flex justify-between">
    <!-- Left (Logo) -->
    <KmitlLogo class="w-40 my-auto shrink-0 transition-all" />

    <!-- Right -->
    <div class="text-right my-auto">
      <h1 class="text-2xl font-bold">
        ตารางเรียน {studentInfo.semester}/{studentInfo.year}
      </h1>

      <p class="text-sm">{studentInfo.studentId} {studentInfo.name}</p>
      <p class="text-sm">
        คณะ{studentInfo.faculty} ภาควิชา{studentInfo.department}
      </p>
      <p class="text-sm">
        สาขา{studentInfo.curriculum}
      </p>
    </div>
  </div>
</div>
