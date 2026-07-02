<script lang="ts">
  import PageShell from "../libs/components/common/PageShell.svelte";
  import PageHeader from "../libs/components/common/PageHeader.svelte";
  import Icon from "@iconify/svelte";
  import { submitForm } from "../libs/utils/formSubmit";
  import type { PaymentReceiptData } from "../libs/types/payment-receipt.types";

  export let yearOptions: PaymentReceiptData["yearOptions"] = [];
  export let semesterOptions: PaymentReceiptData["semesterOptions"] = [];
  export let selectedYear: PaymentReceiptData["selectedYear"] = "";
  export let selectedSemester: PaymentReceiptData["selectedSemester"] = "";
  export let records: PaymentReceiptData["records"] = [];
  export let documents: PaymentReceiptData["documents"] = [];

  let year = selectedYear || yearOptions[0] || "";
  let semester = selectedSemester || semesterOptions[0] || "";

  const selectClass =
    "rounded-xl border dark:border-white/10 border-slate-200 dark:bg-gray-900 bg-white px-3 py-2 text-sm";

  // Changing the term reloads this same page with the new selection.
  function reload() {
    submitForm(location.origin + location.pathname, { year, semester });
  }
</script>

<PageShell>
  <PageHeader title="พิมพ์ใบเสร็จ / เอกสารการเงิน" lines={[]} />

  <div class="mt-4 flex flex-wrap items-center gap-3">
    <span class="text-sm text-slate-500 dark:text-slate-400">ปีการศึกษา</span>
    <select
      bind:value={year}
      on:change={reload}
      class={selectClass}
      aria-label="ปีการศึกษา"
    >
      {#each yearOptions as y (y)}<option value={y}>{y}</option>{/each}
    </select>
    <span class="text-sm text-slate-500 dark:text-slate-400">ภาคการศึกษา</span>
    <select
      bind:value={semester}
      on:change={reload}
      class={selectClass}
      aria-label="ภาคการศึกษา"
    >
      {#each semesterOptions as s (s)}<option value={s}>{s}</option>{/each}
    </select>
  </div>

  <div
    class="mt-4 overflow-x-auto rounded-2xl border dark:border-white/10 border-slate-200"
  >
    <table class="w-full text-sm">
      <thead
        class="dark:bg-white/5 bg-slate-100 text-slate-500 dark:text-slate-400"
      >
        <tr>
          <th class="px-3 py-2 text-left font-medium">รหัสนักศึกษา</th>
          <th class="px-3 py-2 text-left font-medium">ชื่อ-สกุล</th>
          <th class="px-3 py-2 text-left font-medium">วันที่ขอ</th>
          <th class="px-3 py-2 text-left font-medium">วันที่อนุมัติ</th>
          <th class="px-3 py-2 text-left font-medium">สถานะ</th>
        </tr>
      </thead>
      <tbody>
        {#each records as row, i (row.studentId + i)}
          <tr class="border-t dark:border-white/10 border-slate-200">
            <td class="px-3 py-2">{row.studentId}</td>
            <td class="px-3 py-2">{row.name}</td>
            <td class="px-3 py-2">{row.requestedDate}</td>
            <td class="px-3 py-2">{row.approvedDate}</td>
            <td class="px-3 py-2">
              {#if row.receiptUrl}
                <a
                  href={row.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-orange-500 hover:underline"
                >
                  <Icon icon="ph:file-pdf-light" class="text-lg" />
                  พิมพ์ใบเสร็จ
                </a>
              {:else}
                {row.status}
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if records.length === 0}
    <p class="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
      ไม่พบรายการคำขอในภาคการศึกษานี้
    </p>
  {/if}

  {#if documents.length}
    <h2 class="mt-6 mb-2 text-sm font-semibold text-orange-500">
      เอกสารประกอบการเบิก
    </h2>
    <div class="grid gap-2 sm:grid-cols-2">
      {#each documents as doc, i (doc.url + "-" + i)}
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-3 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 px-4 py-3 hover:border-orange-500/50 transition-colors"
        >
          <Icon
            icon="ph:file-pdf-light"
            class="text-2xl text-orange-500 shrink-0"
          />
          <span class="text-sm">{doc.name}</span>
        </a>
      {/each}
    </div>
  {/if}
</PageShell>
