<script lang="ts">
  import { onMount } from "svelte";
  import { getTheme, setTheme } from "../libs/utils/themeManager";
  import type { ExamTable } from "../libs/types/report-examtable.types";
  import Head from "../libs/components/examtable/Head.svelte";
  import Button from "../libs/components/examtable/Button.svelte";
  import Icon from "@iconify/svelte";

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
    <Head {studentInfo} {type} />

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
  <footer class="flex justify-between items-end">
    <!-- Left -->
    <div class="space-x-2">
      <!-- Export PNG -->
      <!-- <Button on:click={exportPng}>
        <Icon icon="ph:file-png-light" class="my-auto text-2xl inline" />
        <span class="font-semibold">Download PNG</span>
      </Button> -->

      <!-- PDF Download -->
      <Button on:click>
        <Icon icon="ph:file-pdf" class="my-auto text-2xl inline" />
        <span class="font-semibold">Download PDF</span>
      </Button>

      <!-- Theme Toggle -->
      <Button on:click={toggleTheme}>
        <Icon
          icon={theme === "dark" ? "ph:sun-duotone" : "ph:moon-duotone"}
          class="my-auto text-2xl inline"
        />
        <span class="font-semibold">{theme === "dark" ? "Light" : "Dark"}</span>
      </Button>
    </div>
  </footer>
</main>

<!-- Modal -->
<div></div>

<!-- TODO: ทำ header กับ footer ก่อน -->
<!-- TODO: สร้างปฏิทินและรายการสอบ -->
