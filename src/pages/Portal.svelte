<script lang="ts">
  import { onMount } from "svelte";
  import type { PortalScraperResult } from "../libs/types/portal.types";
  import { getTheme, setTheme } from "../libs/utils/themeManager";

  export let meta: PortalScraperResult["meta"];
  export let sections: PortalScraperResult["sections"];

  let theme: "light" | "dark" = "dark";

  onMount(() => {
    theme = getTheme();
    setTheme(theme);
    console.log(meta, sections);
  });

  function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
    setTheme(theme);
  }
</script>

<main
  class="min-h-screen dark:bg-gray-950 bg-white font-prompt text-slate-200 selection:bg-orange-500 selection:text-white"
>
  <!-- Shadow -->
  <!-- <div
    class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none"
  ></div> -->

  <!-- Page Content -->
  <div class="flex h-screen">
    <!-- Sidebar -->
    <aside
      class="w-72 flex-shrink-0 bg-gray-950 border-r border-white/10 flex flex-col z-20"
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
            <span>เมนูใช้บ่อย</span>

            <!-- Edit Button -->
            <button on:click={() => alert("แก้ไขเมนู")}>
              <span
                class="text-xs text-orange-500/50 cursor-pointer hover:text-orange-500"
                >แก้ไข</span
              >
            </button>
          </div>

          <!-- Items -->
          <!-- TODO: Update menu items dynamically -->
          <div class="space-y-1">
            <button
              class="group flex items-center justify-between w-full px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              on:click={() => alert("เมนูใช้บ่อย")}
            >
              <div class="flex items-center gap-3">
                <span
                  class="text-slate-600 text-sm group-hover:text-orange-400 transition-colors"
                  >★</span
                >
                <span class="text-sm">ทดสอบ</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Menu Items -->
        <div>
          <!-- Title -->
          <div
            class="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 mb-3"
          >
            ระบบทั้งหมด
          </div>

          <!-- Items -->
          <!-- TODO: Update menu items dynamically -->
          <div class="space-y-2">
            <div class="space-y-1">
              <!-- Menu Item -->
              <button
                class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 text-white border border-white/5 transition-all cursor-pointer group"
              >
                <!-- Item Content -->
                <div class="flex items-center gap-3">
                  <!-- Item Icon -->
                  <div
                    class="p-1.5 rounded bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      ></path>
                    </svg>
                  </div>

                  <!-- Item Label -->
                  <span class="text-sm font-medium">ข้อมูลนักศึกษา</span>
                </div>

                <!-- Dropdown Icon -->
                <svg
                  class="w-4 h-4 text-slate-500 transform rotate-180 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-white/5 bg-slate-900/30 mt-auto">
        <!-- Mode Switcher -->
        <button
          class="w-full mb-3 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium text-slate-500 hover:text-orange-400 hover:bg-white/5 transition-colors border border-dashed border-white/5"
          on:click={() => alert("สลับไปใช้ Original")}
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
              on:click={() => alert("KMITL X")}
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

            <!-- Version -->
            <button
              class="text-[10px] font-mono text-slate-600 hover:text-white transition-colors"
              on:click={() => alert("Version 2.1.0")}
            >
              <span>2.1.0</span>
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
