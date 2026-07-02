<script lang="ts">
  import type { PageStatus } from "../../types/scraper.types";

  export let status: PageStatus = "maintenance";

  const messages: Record<string, { th: string; en: string }> = {
    maintenance: {
      th: "หน้านี้อยู่ระหว่างปรับปรุง",
      en: "This page is under maintenance",
    },
    unused: {
      th: "หน้านี้ไม่ได้ใช้งานแล้ว",
      en: "This page is no longer in use",
    },
  };

  $: message = messages[status] ?? messages.maintenance;
</script>

<div
  class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-prompt"
>
  <div class="text-center px-6">
    <div class="text-2xl font-bold mb-3">
      <span>KMITL</span> <span class="text-orange-500">X</span>
    </div>
    <p class="text-lg font-medium">{message.th}</p>
    <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{message.en}</p>
    <a
      href={location.origin}
      class="inline-block mt-6 px-5 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
    >
      กลับหน้าแรก / Back to home
    </a>
  </div>
</div>
