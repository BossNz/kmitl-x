<script lang="ts">
  import PageShell from "../libs/components/common/PageShell.svelte";
  import Icon from "@iconify/svelte";
  import type { TermSelectors } from "../libs/types/term-selectors.types";

  export let yearOptions: TermSelectors["yearOptions"] = [];
  export let semesterOptions: TermSelectors["semesterOptions"] = [];

  let year = yearOptions[0] ?? "";
  let semester = semesterOptions[0] ?? "";

  // Title for the report this selector leads to.
  const reportTitles: { pattern: RegExp; title: string }[] = [
    { pattern: /report_examtable/, title: "ตารางสอบ" },
    { pattern: /report_studytable/, title: "ตารางเรียน" },
    { pattern: /report_gradetable/, title: "ผลการเรียน" },
    { pattern: /ownersubjweb/, title: "รายวิชาที่เปิดสอน" },
  ];
  $: reportTitle =
    reportTitles.find((r) => r.pattern.test(location.pathname))?.title ??
    "รายงาน";

  // The show page for the current selector, e.g. report_examtable.php ->
  // report_examtable_show.php.
  function showUrl(): string {
    return location.origin + location.pathname.replace(/\.php$/, "_show.php");
  }

  // Mirror the native form: POST year and semester to the show page and let
  // the browser navigate there, where the extension reskins the result.
  function view() {
    if (!year || !semester) return;
    const form = document.createElement("form");
    form.method = "post";
    form.action = showUrl();
    form.enctype = "multipart/form-data";
    const add = (name: string, value: string) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };
    add("command", "");
    add("year", year);
    add("semester", semester);
    document.body.appendChild(form);
    form.submit();
    form.remove();
  }
</script>

<PageShell>
  <div class="min-h-[60vh] flex items-center justify-center">
    <div
      class="w-full max-w-md rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 p-8"
    >
      <div class="text-center mb-6">
        <div
          class="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-3"
        >
          <Icon icon="mdi:calendar-search" class="w-7 h-7" />
        </div>
        <h1 class="text-xl font-bold">{reportTitle}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          เลือกภาคการศึกษาที่ต้องการดู
        </p>
      </div>

      <div class="space-y-4">
        <label class="block">
          <span class="text-sm text-slate-500 dark:text-slate-400"
            >ปีการศึกษา</span
          >
          <select
            bind:value={year}
            class="mt-1 w-full rounded-xl border dark:border-white/10 border-slate-200 dark:bg-gray-900 bg-white px-3 py-2 text-sm"
          >
            {#each yearOptions as y (y)}
              <option value={y}>{y}</option>
            {/each}
          </select>
        </label>

        <label class="block">
          <span class="text-sm text-slate-500 dark:text-slate-400"
            >ภาคการศึกษา</span
          >
          <select
            bind:value={semester}
            class="mt-1 w-full rounded-xl border dark:border-white/10 border-slate-200 dark:bg-gray-900 bg-white px-3 py-2 text-sm"
          >
            {#each semesterOptions as s (s)}
              <option value={s}>{s}</option>
            {/each}
          </select>
        </label>

        <button
          on:click={view}
          disabled={!year || !semester}
          class="w-full rounded-xl bg-orange-500 text-white font-semibold py-2.5 hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ดูข้อมูล
        </button>
      </div>
    </div>
  </div>
</PageShell>
