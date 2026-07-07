<script lang="ts">
  import PageShell from "../libs/components/common/PageShell.svelte";
  import PageHeader from "../libs/components/common/PageHeader.svelte";
  import { submitForm } from "../libs/utils/formSubmit";
  import type { BugReportData } from "../libs/types/bug-report.types";

  export let studentId: BugReportData["studentId"] = "";
  export let name: BugReportData["name"] = "";
  export let semester: BugReportData["semester"] = "";
  export let typeOptions: BugReportData["typeOptions"] = [];
  export let ssid: BugReportData["ssid"] = "";
  export let action: BugReportData["action"] = "";

  let type = typeOptions[0]?.value ?? "0";
  let topic = "";
  let detail = "";
  let saving = false;

  $: canSubmit = !!(topic.trim() && detail.trim() && ssid && !saving);

  const fieldClass =
    "mt-1 w-full rounded-xl border dark:border-white/10 border-slate-200 dark:bg-gray-900 bg-white px-3 py-2 text-sm";

  // Mirror the native form: url-encoded POST to bug/save.php.
  function submit() {
    if (!canSubmit) return;
    saving = true;
    submitForm(
      action,
      { type, topic, detail, ssid, button: "[บันทึก]" },
      "application/x-www-form-urlencoded"
    );
  }
</script>

<PageShell>
  <PageHeader
    title="แจ้งปัญหา / เสนอแนะ"
    lines={[`${studentId} ${name}`, `ภาคการศึกษา ${semester}`]}
  />

  <div
    class="mt-4 max-w-2xl mx-auto rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 p-6"
  >
    <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
      โปรดใส่รายละเอียดของปัญหาที่พบให้มากที่สุด
      เพื่อให้ผู้พัฒนาตรวจสอบและแก้ไขได้รวดเร็ว
    </p>

    <div class="space-y-4">
      <label class="block">
        <span class="text-sm text-slate-500 dark:text-slate-400">ประเภท</span>
        <select bind:value={type} class={fieldClass}>
          {#each typeOptions as opt (opt.value)}
            <option value={opt.value}>{opt.label}</option>
          {/each}
        </select>
      </label>

      <label class="block">
        <span class="text-sm text-slate-500 dark:text-slate-400">หัวข้อ</span>
        <input
          bind:value={topic}
          type="text"
          maxlength="200"
          class={fieldClass}
        />
      </label>

      <label class="block">
        <span class="text-sm text-slate-500 dark:text-slate-400"
          >รายละเอียด</span
        >
        <textarea bind:value={detail} rows="8" class={fieldClass}></textarea>
      </label>

      <button
        on:click={submit}
        disabled={!canSubmit}
        class="w-full rounded-xl bg-orange-500 text-white font-semibold py-2.5 hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        บันทึก
      </button>
    </div>
  </div>
</PageShell>
