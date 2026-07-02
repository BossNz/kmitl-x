<script lang="ts">
  import PageShell from "../libs/components/common/PageShell.svelte";
  import PageHeader from "../libs/components/common/PageHeader.svelte";
  import { submitForm } from "../libs/utils/formSubmit";
  import type { EmailConfigData } from "../libs/types/email-config.types";

  export let question: EmailConfigData["question"] = "";
  export let options: EmailConfigData["options"] = [];
  export let selected: EmailConfigData["selected"] = "";
  export let ssid: EmailConfigData["ssid"] = "";

  let choice = selected;
  let saving = false;

  // Mirror the native form: POST the choice and session token, then the page
  // reloads with the saved state.
  function save() {
    saving = true;
    submitForm(location.origin + location.pathname, {
      group0: choice,
      ssid,
      Submit: "บันทึก",
    });
  }
</script>

<PageShell>
  <PageHeader title="ตั้งค่าการรับอีเมล" lines={[]} />

  <div
    class="mt-4 max-w-lg mx-auto rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50 p-6"
  >
    {#if question}
      <p class="text-sm text-slate-600 dark:text-slate-300 mb-3">{question}</p>
    {/if}

    <div class="space-y-2">
      {#each options as opt (opt.value)}
        <label
          class="flex items-center gap-3 rounded-xl border dark:border-white/10 border-slate-200 px-4 py-2.5 cursor-pointer hover:border-orange-500/50 transition-colors"
        >
          <input
            type="radio"
            bind:group={choice}
            value={opt.value}
            class="accent-orange-500"
          />
          <span class="text-sm">{opt.label}</span>
        </label>
      {/each}
    </div>

    <button
      on:click={save}
      disabled={saving || !ssid}
      class="mt-4 w-full rounded-xl bg-orange-500 text-white font-semibold py-2.5 hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      บันทึก
    </button>
  </div>
</PageShell>
