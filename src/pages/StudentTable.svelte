<script lang="ts">
  import "../assets/css/tailwind.css";
  import type {
    InformationI,
    ScheduleI,
  } from "../libs/utils/ScheduleTableScraping";
  import Icon from "@iconify/svelte";
  import { toBlob } from "html-to-image";
  import { downloadBlob } from "../libs/utils/StudentHelper";
  import Head from "../libs/components/scheduleTable/Head.svelte";
  import ScheduleTable from "../libs/components/scheduleTable/ScheduleTable.svelte";
  import ToggleTheme from "../libs/components/scheduleTable/ToggleTheme.svelte";
  import Button from "../libs/components/scheduleTable/Button.svelte";
  import { originalTable } from "../stores/ScheduleTable";
  import { classes, cn } from "../libs/styles";

  export let schedule: Array<ScheduleI>;
  export let information: InformationI;
  let captureScreen: any;

  let originalTableToggle: boolean = true;
  let copyPngToggle: boolean = false;

  let originalTableRawHTML: string;

  originalTable.subscribe((value) => {
    originalTableRawHTML = value;
  });

  const exportPng = async () => {
    const blob = await toBlob(captureScreen);
    if (blob)
      downloadBlob(
        blob,
        `schedule_${information.studentID}_${information.Semester}_${information.year}.png`
      );
  };
  const copyPng = async () => {
    copyPngToggle = true;
    const blob = await toBlob(captureScreen);
    if (blob) {
      navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setTimeout(() => {
        copyPngToggle = false;
      }, 2000);
    }
  };
</script>

{#if originalTableToggle}
  <main
    class="min-h-screen p-2 flex flex-col justify-between dark:bg-gray-900 bg-white"
  >
    <div bind:this={captureScreen} class="p-1 dark:bg-gray-900 bg-white">
      <Head {information} />
      <div class="mb-auto mt-5">
        <ScheduleTable {schedule} />
      </div>
    </div>
    <footer class="flex justify-between items-end">
      <div class="space-x-2">
        <Button on:click={() => (originalTableToggle = !originalTableToggle)}>
          original version
          <Icon icon="hugeicons:raw-02" class="my-auto text-2xl inline" />
        </Button>
        <ToggleTheme />
        <Button on:click={exportPng}>
          download
          <Icon icon="ph:file-png-light" class="my-auto text-2xl inline" />
        </Button>
        <Button on:click={copyPng}>
          {copyPngToggle ? "copied to clipboard" : "copy to clipboard"}
          <Icon icon="akar-icons:clipboard" class="my-auto text-2xl inline" />
        </Button>
      </div>
      <div class="mt-auto text-right text-xs text-orange-300">
        <p class="opacity-75">
          Redesign by BossNz <Icon
            icon="fluent-emoji:love-you-gesture"
            class="inline"
          />
        </p>
        <p>Powered by Computer Science, KMITL</p>
        <div class="flex gap-2 mt-2">
          <Button
            on:click={() =>
              (window.location.href = "https://github.com/BossNz/kmitl-x")}
          >
            contribute
            <Icon icon="mdi:github" class="my-auto text-2xl inline" />
          </Button>
          <Button
            on:click={() =>
              (window.location.href = "https://www.instagram.com/_bossnz")}
          >
            _bossnz
            <Icon icon="mdi:instagram" class="my-auto text-2xl inline" />
          </Button>
        </div>
      </div>
    </footer>
  </main>
{:else}
  <main class="flex flex-col min-h-screen justify-between items-start p-2">
    <div class="w-full mx-auto">
      {@html originalTableRawHTML}
    </div>
    <Button on:click={() => (originalTableToggle = !originalTableToggle)}>
      new version
      <Icon icon="clarity:new-line" class="my-auto text-2xl inline" />
    </Button>
  </main>
{/if}
