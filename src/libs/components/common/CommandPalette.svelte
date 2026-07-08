<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Icon from "@iconify/svelte";
  import { loadMenu, type MenuLink } from "../../utils/menu";

  let open = false;
  let query = "";
  let items: MenuLink[] = [];
  let activeIndex = 0;
  let inputEl: HTMLInputElement | undefined;

  $: filtered = query.trim()
    ? items.filter((it) =>
        it.label.toLowerCase().includes(query.trim().toLowerCase())
      )
    : items;

  // Keep the highlight in range as the filter narrows.
  $: if (activeIndex > filtered.length - 1) activeIndex = 0;

  function openPalette() {
    items = loadMenu();
    query = "";
    activeIndex = 0;
    open = true;
    setTimeout(() => inputEl?.focus(), 0);
  }

  function closePalette() {
    open = false;
  }

  function go(item: MenuLink | undefined) {
    if (!item) return;
    closePalette();
    window.location.href = item.url;
  }

  function onKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (open) closePalette();
      else openPalette();
      return;
    }
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(filtered[activeIndex]);
    }
  }

  onMount(() => window.addEventListener("keydown", onKeydown));
  onDestroy(() => window.removeEventListener("keydown", onKeydown));
</script>

{#if open}
  <div
    class="fixed inset-0 z-[2147483000] flex items-start justify-center pt-24 bg-black/40 font-prompt"
    role="presentation"
    on:click={closePalette}
  >
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ค้นหาเมนู"
      tabindex="-1"
      class="w-full max-w-lg mx-4 rounded-2xl bg-white dark:bg-gray-900 border dark:border-white/10 border-slate-200 shadow-2xl overflow-hidden"
      on:click|stopPropagation
    >
      <div
        class="flex items-center gap-2 px-4 border-b dark:border-white/10 border-slate-200"
      >
        <Icon icon="mdi:magnify" class="text-slate-400 text-lg" />
        <input
          bind:this={inputEl}
          bind:value={query}
          placeholder="ค้นหาเมนู..."
          class="flex-1 py-3 bg-transparent outline-none text-sm dark:text-white text-gray-900"
        />
        <kbd class="text-xs text-slate-400">Esc</kbd>
      </div>

      <div class="max-h-80 overflow-y-auto py-1">
        {#each filtered as item, i (item.url + "-" + i)}
          <button
            class="w-full text-left px-4 py-2 text-sm flex items-center gap-2 {i ===
            activeIndex
              ? 'bg-orange-500/10 text-orange-500'
              : 'text-gray-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}"
            on:click={() => go(item)}
            on:mouseenter={() => (activeIndex = i)}
          >
            <Icon icon="mdi:chevron-right" class="text-slate-400 shrink-0" />
            <span class="truncate">{item.label}</span>
          </button>
        {/each}

        {#if filtered.length === 0}
          <p class="px-4 py-6 text-center text-sm text-slate-400">
            {items.length === 0 ? "เปิดหน้าแรกพอร์ทัลเพื่อโหลดเมนู" : "ไม่พบเมนู"}
          </p>
        {/if}
      </div>
    </div>
  </div>
{/if}
