<script lang="ts">
  import { onMount } from "svelte";
  import type { PortalScraperResult } from "../libs/types/portal.types";
  import { getTheme, setTheme } from "../libs/utils/themeManager";
  import Icon from "@iconify/svelte";

  export let meta: PortalScraperResult["meta"];
  export let sections: PortalScraperResult["sections"];

  let theme: "light" | "dark" = "dark";
  const KMITLX_MODE_KEY = "kmitlx:view";
  const FAVORITES_KEY = "kmitlx:favorites";

  // Get version from Vite define
  const appVersion = __APP_VERSION__ || "dev";

  // State management for menu
  let openSections: Record<string, boolean> = {};
  let activeItem: string | null = null;
  let favorites: string[] = [];
  let isEditMode = false;
  let hoveredItemId: string | null = null;

  // Initialize open sections state and load favorites
  onMount(() => {
    theme = getTheme();
    setTheme(theme);
    console.log(meta, sections);

    // Initialize all sections as closed
    sections.forEach((section) => {
      openSections[section.title] = false;
    });

    // Load favorites from localStorage
    loadFavorites();
  });

  function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
    setTheme(theme);
  }

  // Switch to Original mode
  function switchToOriginal() {
    sessionStorage.setItem(KMITLX_MODE_KEY, "original");
    window.location.reload();
  }

  // Toggle section open/close (accordion behavior - only one open at a time)
  function toggleSection(sectionId: string) {
    const isCurrentlyOpen = openSections[sectionId];

    // Close all sections first
    Object.keys(openSections).forEach((key) => {
      openSections[key] = false;
    });

    // Toggle the clicked section (if it was closed, open it)
    openSections[sectionId] = !isCurrentlyOpen;
  }

  // Handle item click
  function handleItemClick(itemId: string) {
    activeItem = itemId;
    console.log(`Clicked on item with ID: ${itemId}`);
  }

  // Load favorites from localStorage
  function loadFavorites() {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        favorites = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
      favorites = [];
    }
  }

  // Save favorites to localStorage
  function saveFavorites() {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  }

  // Toggle favorite status
  function toggleFavorite(itemId: string, event: Event) {
    event.stopPropagation();

    const index = favorites.indexOf(itemId);
    if (index > -1) {
      favorites = favorites.filter((id) => id !== itemId);
    } else {
      favorites = [...favorites, itemId];
    }

    saveFavorites();
  }

  // Remove from favorites (in edit mode)
  function removeFavorite(itemId: string, event: Event) {
    event.stopPropagation();
    favorites = favorites.filter((id) => id !== itemId);
    saveFavorites();
  }

  // Toggle edit mode
  function toggleEditMode() {
    isEditMode = !isEditMode;
  }

  // Get favorite items - reactive based on favorites array
  $: favoriteItems = (() => {
    const items: Array<{
      id: string;
      label: string;
      sectionTitle: string;
    }> = [];

    sections.forEach((section) => {
      section.items.forEach((item) => {
        if (favorites.includes(item.id)) {
          items.push({
            id: item.id,
            label: item.label,
            sectionTitle: section.title,
          });
        }
      });
    });

    return items;
  })();
</script>

<main
  class="min-h-screen dark:bg-slate-950 bg-white font-prompt text-slate-200 selection:bg-orange-500 selection:text-white"
>
  <!-- Shadow -->
  <!-- <div
    class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none"
  ></div> -->

  <!-- Page Content -->
  <div class="flex h-screen">
    <!-- Sidebar -->
    <aside
      class="w-72 flex-shrink-0 bg-slate-950 border-r border-white/10 flex flex-col z-20"
    >
      <!-- Header with Logo -->
      <div
        class="h-20 flex items-center px-6 gap-3 border-b border-white/5 bg-slate-900/50 backdrop-blur-md"
      >
        <!-- Logo -->
        <div
          class="w-12 h-auto rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20"
        >
          <img
            src="https://www.reg.kmitl.ac.th/index/new_index_assets/img/logo/main.png"
            alt="kmitl logo"
            class="w-40 my-auto transition-all"
          />
        </div>

        <!-- Title -->
        <div>
          <h1 class="font-bold text-lg tracking-tight text-white leading-none">
            KMITL <span class="text-orange-500">REG</span>
          </h1>
          <p class="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
            Student Infomation
          </p>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex-1 overflow-y-auto py-6 px-4 space-y-6">
        <!-- Home Button -->
        <div class="space-y-1">
          <button
            class="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl bg-orange-500 text-white font-medium shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-all"
            on:click={() => alert("หน้าหลัก")}
            ><svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              ></path>
            </svg>
            <span class="text-sm">หน้าหลัก</span>
          </button>
        </div>

        <!-- Highlights Items -->
        <div>
          <!-- Header -->
          <div
            class="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 mb-2 flex items-center justify-between"
          >
            <!-- Title -->
            <span>รายการโปรด</span>

            <!-- Edit Button -->
            <button on:click={toggleEditMode}>
              <span
                class="text-xs cursor-pointer transition-colors {isEditMode
                  ? 'text-orange-500 hover:text-orange-400'
                  : 'text-orange-500/50 hover:text-orange-500'}"
                >{isEditMode ? "ตกลง" : "แก้ไข"}</span
              >
            </button>
          </div>
          <!-- Items -->
          <div class="space-y-1">
            {#if favoriteItems.length === 0 && !isEditMode}
              <div class="px-4 py-3 text-xs text-slate-500 text-center">
                ยังไม่มีรายการโปรด<br />
                <span class="text-[10px]">กดดาวที่เมนูเพื่อเพิ่ม</span>
              </div>
            {:else}
              {#each favoriteItems as item}
                <div
                  class="group flex items-center justify-between w-full px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  on:click={() => handleItemClick(item.id)}
                  role="button"
                  tabindex="0"
                  on:keydown={(e) =>
                    e.key === "Enter" && handleItemClick(item.id)}
                >
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <Icon
                      class="w-4 h-auto text-orange-400 flex-shrink-0"
                      icon="mdi:star"
                    />
                    <div class="flex flex-col items-start min-w-0 flex-1">
                      <span class="text-sm truncate w-full">{item.label}</span>
                      <span class="text-[10px] text-slate-600"
                        >{item.sectionTitle}</span
                      >
                    </div>
                  </div>

                  {#if isEditMode}
                    <div
                      class="flex-shrink-0 p-1 rounded hover:bg-red-500/20 transition-colors"
                      on:click={(e) => removeFavorite(item.id, e)}
                      role="button"
                      tabindex="0"
                      on:keydown={(e) =>
                        e.key === "Enter" && removeFavorite(item.id, e)}
                    >
                      <Icon
                        class="w-4 h-4 text-red-400 hover:text-red-300"
                        icon="mdi:close-circle"
                      />
                    </div>
                  {/if}
                </div>
              {/each}
            {/if}
          </div>
        </div>
        <!-- Menu Items -->
        <div>
          <!-- Title -->
          <div
            class="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 mb-3"
          >
            เมนูทั้งหมด
          </div>

          <!-- Items -->
          <div class="space-y-2">
            {#each sections as section}
              {@const isOpen = openSections[section.id]}
              {@const iconClasses = isOpen
                ? `${section.color.open.bg} ${section.color.open.text} ${section.color.hover.bg} ${section.color.hover.text}`
                : `${section.color.closed.bg} ${section.color.closed.text} ${section.color.hover.bg} ${section.color.hover.text}`}
              <div class="space-y-1">
                <!-- Menu Item -->
                <button
                  class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all cursor-pointer group {openSections[
                    section.id
                  ]
                    ? 'bg-white/5 text-white border border-white/5'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'}"
                  on:click={() => toggleSection(section.id)}
                >
                  <!-- Item Content -->
                  <div class="flex items-center gap-3">
                    <!-- Item Icon with dynamic color -->
                    <div class="p-1.5 rounded transition-colors {iconClasses}">
                      <Icon class="w-5 h-5" icon={section.icon} />
                    </div>

                    <!-- Item Label -->
                    <span class="text-sm font-medium truncate"
                      >{section.title}</span
                    >
                  </div>

                  <!-- Item Badge and Icon -->
                  <div class="flex items-center gap-2">
                    {#if section.items.length > 0 && !openSections[section.id]}
                      <span
                        class="w-5 h-5 rounded-full text-[10px] flex items-center justify-center transition-all bg-slate-800 text-slate-400 border border-slate-700 group-hover:bg-orange-500/20 group-hover:text-orange-400 group-hover:border-orange-500/30"
                      >
                        {section.items.length}
                      </span>
                    {/if}

                    <!-- Dropdown Icon -->
                    <Icon
                      class="w-4 h-4 transition-all {openSections[section.id]
                        ? 'text-white rotate-90'
                        : 'text-slate-600 group-hover:text-slate-400'}"
                      icon="mdi:chevron-right"
                    />
                  </div>
                </button>

                <!-- Sub Menu Items -->
                {#if openSections[section.id] && section.items.length > 0}
                  <div
                    class="relative pl-6 ml-3 space-y-1 border-l border-white/10 animate-slide-in"
                  >
                    {#each section.items as item}
                      <!-- Sub Menu Item -->
                      <button
                        class="w-full flex items-center justify-between gap-2 px-4 py-2 rounded-lg text-sm transition-all relative group/item {activeItem ===
                        item.id
                          ? 'text-orange-400 bg-orange-500/5 border border-orange-500/10'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'}"
                        on:click={() => handleItemClick(item.id)}
                        on:mouseenter={() => (hoveredItemId = item.id)}
                        on:mouseleave={() => (hoveredItemId = null)}
                      >
                        <span
                          class="text-sm truncate {activeItem === item.id
                            ? 'font-medium'
                            : ''}">{item.label}</span
                        >

                        <div class="flex items-center gap-1 flex-shrink-0">
                          <!-- Star Icon (visible on hover or when favorited) -->
                          {#if hoveredItemId === item.id || favorites.includes(item.id)}
                            <div
                              class="p-1 rounded hover:bg-orange-500/10 transition-all"
                              on:click={(e) => toggleFavorite(item.id, e)}
                              role="button"
                              tabindex="0"
                              on:keydown={(e) =>
                                e.key === "Enter" && toggleFavorite(item.id, e)}
                            >
                              <Icon
                                class="w-3 h-auto transition-colors {favorites.includes(
                                  item.id
                                )
                                  ? 'text-orange-400'
                                  : 'text-slate-600 group-hover/item:text-orange-400'}"
                                icon={favorites.includes(item.id)
                                  ? "mdi:star"
                                  : "mdi:star-outline"}
                              />
                            </div>
                          {/if}

                          <!-- Open in New Tab Icon -->
                          {#if item.openInNewTab}
                            <span
                              class="text-[10px] px-1.5 py-0.5 rounded text-orange-400"
                            >
                              <Icon
                                class="w-3.5 h-auto"
                                icon="mdi:open-in-new"
                              />
                            </span>
                          {/if}
                        </div>
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </div>
      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-white/5 bg-slate-900/30 mt-auto">
        <!-- Mode Switcher -->
        <button
          class="w-full mb-3 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium text-slate-500 hover:text-orange-400 hover:bg-white/5 transition-colors border border-dashed border-white/5"
          on:click={switchToOriginal}
        >
          <svg
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
              clip-rule="evenodd"
            />
          </svg>
          <span>สลับไปใช้ Original</span>
        </button>

        <!-- Credit & Version -->
        <div class="flex items-center justify-between px-2">
          <!-- Credit -->
          <div class="text-xs font-medium text-slate-300">
            <span class="opacity-60">Powered by</span>
            <button
              class="text-orange-500 hover:text-orange-300 transition-colors"
              on:click={() =>
                window.open(
                  "https://chromewebstore.google.com/detail/lnhfadikffnjjhmoimkeinbbhcnkkcln",
                  "_blank"
                )}
            >
              <span> KMITL X </span>
            </button>
          </div>

          <!-- Version -->
          <div class="flex items-center gap-1">
            <!-- Green Circle -->
            <div
              class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"
            ></div>

            <button
              class="text-[10px] font-mono text-slate-600 hover:text-white transition-colors"
              on:click={() =>
                window.open(
                  "https://github.com/BossNz/kmitl-x/releases",
                  "_blank"
                )}
            >
              <span>{appVersion}</span>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Section -->
    <section>
      <!-- Container -->
      <div>
        <!-- Header -->
        <div>
          <!-- Breadcrumb and Title -->
          <div>
            <!-- Breadcrumb -->
            <div></div>

            <!-- Title -->
            <div></div>
          </div>

          <!-- Buttons and Profile -->
          <div>
            <!-- Server Time -->
            <div></div>

            <!-- Buttons -->
            <div></div>

            <!-- Profile -->
            <div>
              <!-- On Screen -->
              <div></div>

              <!-- Hover -->
              <div></div>
            </div>
          </div>
        </div>

        <!-- Container -->
        <div>
          <!-- Header -->
          <div>
            <!-- Title -->
            <div></div>

            <!-- Button -->
            <div></div>
          </div>

          <!-- Content -->
          <div></div>
        </div>
      </div>
    </section>
  </div>
</main>
