<script lang="ts">
  import { onMount } from "svelte";
  import { getTheme, setTheme } from "../libs/utils/themeManager";
  import type { ExamTable } from "../libs/types/report-examtable.types";

  export let studentInfo: ExamTable["studentInfo"];
  export let exams: ExamTable["exams"];
  export let pdf: ExamTable["pdf"];
  export let type: ExamTable["type"];

  let theme: "light" | "dark" = "dark";

  onMount(() => {
    theme = getTheme();
    setTheme(theme);
    console.log(studentInfo, exams, pdf, type);
  });

  function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
    setTheme(theme);
  }
</script>

<main
  class="min-h-screen p-2 flex flex-col justify-between dark:bg-gray-900 bg-white"
>
  <!-- Main Container -->
  <div>
    <!-- Header -->
    <div></div>

    <!-- Content -->
    <div>
      <!-- Calendar -->
      <div>
        <!-- Calendar Header -->
        <div></div>

        <!-- Calendar Grid -->
        <div>
          <!-- Day Headers -->
          <div></div>

          <!-- Calendar Days -->
          <div></div>
        </div>
      </div>

      <!-- Exam List -->
      <div></div>
    </div>
  </div>

  <!-- Footer -->
  <footer></footer>
</main>

<!-- Modal -->
<div></div>
