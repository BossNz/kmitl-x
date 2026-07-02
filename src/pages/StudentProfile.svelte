<script lang="ts">
  import PageShell from "../libs/components/common/PageShell.svelte";
  import Icon from "@iconify/svelte";
  import type { StudentProfile } from "../libs/types/student.types";

  export let thaiTitle: StudentProfile["thaiTitle"] = "";
  export let thaiFullName: StudentProfile["thaiFullName"] = "";
  export let englishTitle: StudentProfile["englishTitle"] = "";
  export let englishFullName: StudentProfile["englishFullName"] = "";
  export let studentId: StudentProfile["studentId"] = "";
  export let nationalId: StudentProfile["nationalId"] = "";
  export let gender: StudentProfile["gender"] = "";
  export let birthDate: StudentProfile["birthDate"] = "";
  export let status: StudentProfile["status"] = "";
  export let admissionType: StudentProfile["admissionType"] = "";
  export let admissionYear: StudentProfile["admissionYear"] = "";
  export let graduationYear: StudentProfile["graduationYear"] = "";
  export let graduationDate: StudentProfile["graduationDate"] = "";
  export let faculty: StudentProfile["faculty"] = "";
  export let department: StudentProfile["department"] = "";
  export let curriculum: StudentProfile["curriculum"] = "";
  export let bankAccount: StudentProfile["bankAccount"] = "";

  $: infoGroups = [
    {
      title: "ข้อมูลส่วนตัว",
      rows: [
        { label: "เลขประจำตัวประชาชน", value: nationalId },
        { label: "เพศ", value: gender },
        { label: "วันเกิด", value: birthDate },
        { label: "สถานะ", value: status },
      ],
    },
    {
      title: "ข้อมูลการศึกษา",
      rows: [
        { label: "คณะ", value: faculty },
        { label: "ภาควิชา", value: department },
        { label: "หลักสูตร", value: curriculum },
        { label: "ประเภทการรับเข้า", value: admissionType },
        { label: "ปีที่เข้าศึกษา", value: admissionYear },
        { label: "ปีที่สำเร็จการศึกษา", value: graduationYear },
        { label: "วันที่สำเร็จการศึกษา", value: graduationDate },
      ],
    },
    {
      title: "ข้อมูลอื่น ๆ",
      rows: [{ label: "บัญชีธนาคาร", value: bankAccount }],
    },
  ];
</script>

<PageShell>
  <div
    class="dark:bg-orange-500/10 bg-orange-100/50 rounded-2xl border dark:border-orange-500/40 border-orange-200 p-6 flex items-center gap-5"
  >
    <div
      class="w-20 h-20 rounded-full bg-orange-500 text-white flex items-center justify-center text-3xl font-bold shrink-0"
    >
      {thaiFullName ? thaiFullName.charAt(0) : "?"}
    </div>
    <div class="min-w-0">
      <h1 class="text-2xl font-bold text-orange-500 truncate">
        {thaiTitle}
        {thaiFullName}
      </h1>
      <p class="text-sm text-orange-400/80 truncate">
        {englishTitle}
        {englishFullName}
      </p>
      <div
        class="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500 text-white text-sm font-medium"
      >
        <Icon icon="mdi:card-account-details-outline" class="text-base" />
        {studentId}
      </div>
    </div>
  </div>

  <div class="grid gap-4 md:grid-cols-2 mt-4">
    {#each infoGroups as group, gi (group.title + gi)}
      <div
        class="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 p-5"
      >
        <h2 class="text-sm font-semibold text-orange-500 mb-3">{group.title}</h2>
        <dl class="space-y-2">
          {#each group.rows as row, ri (row.label + ri)}
            <div class="flex justify-between gap-4 text-sm">
              <dt class="text-slate-500 dark:text-slate-400">{row.label}</dt>
              <dd class="text-right font-medium break-words">
                {row.value || "-"}
              </dd>
            </div>
          {/each}
        </dl>
      </div>
    {/each}
  </div>
</PageShell>
