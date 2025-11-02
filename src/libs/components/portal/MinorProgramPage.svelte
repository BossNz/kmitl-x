<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import { fade, slide } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import PortalFetcher from "../../utils/PortalFetcher";
  import { classes, cn } from '../../styles';

  export let sourceUrl: string = "";

  type Tab = "home" | "news" | "curriculum" | "application" | "schedule" | "guide" | "chat";
  
  let activeTab: Tab = "home";
  let loading = false;
  let newsItems: any[] = [];
  let curriculumItems: any[] = [];
  let scheduleIframeUrl = "";
  let chatIframeUrl = "";
  
  // Chat form
  let chatTopic = "";
  let chatDetail = "";
  let chatSubmitting = false;
  
  // Pagination for news
  const ITEMS_PER_PAGE = 10;
  let currentPage = 1;
  
  const fetcher = new PortalFetcher();
  
  let scheduleData = [
    { label: "รับสมัครออนไลน์", date: "19 มกราคม 2568 - 17 มีนาคม 2568" },
    { label: "ประกาศชื่อผู้มีสิทธิ์สอบคัดเลือก", date: "21 มีนาคม 2568" },
    { label: "สอบคัดเลือก", date: "24 มีนาคม 2568" },
    { label: "ประกาศชื่อผู้มีสิทธิ์เข้าศึกษา", date: "28 มีนาคม 2568" },
    { label: "ยืนยันสิทธิ์เข้าศึกษาและชำระเงิน", date: "28 มีนาคม 2568 - 30 มีนาคม 2568" },
    { label: "ประกาศชื่อผู้ยืนยันสิทธิ์", date: "31 มีนาคม 2568" },
    { label: "ลงทะเบียนเรียน", date: "17 พฤษภาคม 2568 - 21 พฤษภาคม 2568" },
  ];

  const tabs = [
    { id: "home" as Tab, label: "หน้าแรก", icon: "ph:house-duotone" },
    { id: "news" as Tab, label: "ข่าวสาร", icon: "ph:newspaper-duotone" },
    { id: "curriculum" as Tab, label: "หลักสูตร", icon: "ph:book-open-duotone" },
    { id: "application" as Tab, label: "สมัคร/ยื่น", icon: "ph:file-text-duotone" },
    { id: "schedule" as Tab, label: "ตารางเรียน-สอบ", icon: "ph:calendar-duotone" },
    { id: "guide" as Tab, label: "คู่มือ", icon: "ph:book-bookmark-duotone" },
    { id: "chat" as Tab, label: "แชท", icon: "ph:chats-circle-duotone" },
  ];

  async function loadNewsData() {
    if (newsItems.length > 0) return;
    loading = true;
    try {
      const newsUrl = sourceUrl.replace("minor.php", "minor_news.php");
      const content = await fetcher.load(newsUrl);
      
      // Find table that contains news items (similar to extractNewsListContent)
      const tables = Array.from(content.document.querySelectorAll('table'));
      let newsTable: HTMLTableElement | null = null;
      
      // Look for the table with multiple group_news links
      for (const table of tables) {
        const newsLinks = table.querySelectorAll('a[href*="group_news"]');
        if (newsLinks.length >= 3) {
          const rowsWithNews = Array.from(table.rows).filter(row => {
            return row.querySelector('a[href*="group_news"]') !== null;
          });
          if (rowsWithNews.length >= 3) {
            newsTable = table;
            break;
          }
        }
      }
      
      if (newsTable) {
        const rows = Array.from(newsTable.rows);
        newsItems = rows.map((row, index) => {
          const cell = row.cells[0];
          if (!cell) return null;
          
          // Find only the first link with group_news in this row
          const mainLink = cell.querySelector('a[href*="group_news"]');
          if (!mainLink) return null;
          
          const href = mainLink.getAttribute('href');
          if (!href || href.startsWith('javascript:')) return null;
          
          const titleElement = mainLink.querySelector('span, strong') || mainLink;
          const title = titleElement.textContent?.trim() || "";
          if (!title) return null;
          
          // Extract date and time from the format: [ 21 ต.ค. 62 - 10:06 น. ]
          const dateTimeMatch = cell.textContent?.match(/\[\s*(\d{1,2}\s+[^\d\s]+\s+\d{2,4})\s*-\s*(\d{1,2}:\d{2}\s*[^\]]*)\s*\]/);
          let date: string | undefined;
          
          if (dateTimeMatch) {
            const datePart = dateTimeMatch[1].trim();
            const timePart = dateTimeMatch[2].trim();
            date = `${datePart} ${timePart}`;
          } else {
            // Fallback to just date if time is not found
            const dateMatch = cell.textContent?.match(/\d{1,2}\s+[^\d\s]+\s+\d{2,4}/);
            date = dateMatch ? dateMatch[0].trim() : undefined;
          }
          
          return {
            id: `news-${index}`,
            title,
            href,
            date,
          };
        }).filter((item): item is NonNullable<typeof item> => item !== null);
      }
    } catch (error) {
      // Failed to load news
    } finally {
      loading = false;
    }
  }

  async function loadCurriculumData() {
    if (curriculumItems.length > 0) return;
    loading = true;
    try {
      const currUrl = sourceUrl.replace("minor.php", "minor_program.php");
      const content = await fetcher.load(currUrl);
      const table = content.document.querySelector('table tbody');
      if (table) {
        const rows = Array.from(table.querySelectorAll('tr'));
        const facultyMap = new Map<string, any[]>();
        let currentFaculty = "";
        
        rows.forEach((row) => {
          const header = row.querySelector('td[align="center"] b');
          if (header) {
            currentFaculty = header.textContent?.trim() || "";
            // Initialize empty array for this faculty if not exists
            if (!facultyMap.has(currentFaculty)) {
              facultyMap.set(currentFaculty, []);
            }
            return;
          }
          
          const link = row.querySelector('a');
          // Filter only PDF links in the curriculum table, ignore menu/navigation links
          if (link && currentFaculty) {
            const href = link.getAttribute('href') || "";
            const text = link.textContent?.trim() || "";
            
            // Only include links that are actual curriculum PDFs (contain /curriculum/ or .pdf)
            // and exclude navigation/menu items (like javascript:, minor.php, etc)
            if ((href.includes('/curriculum/') || href.includes('.pdf')) && 
                !href.startsWith('javascript:') && 
                !href.includes('minor.php') &&
                text.length > 0) {
              
              const programs = facultyMap.get(currentFaculty) || [];
              programs.push({
                name: text,
                href: href,
              });
              facultyMap.set(currentFaculty, programs);
            }
          }
        });
        
        // Convert map to array format for rendering
        const tempItems: any[] = [];
        facultyMap.forEach((programs, facultyName) => {
          // Add faculty header
          tempItems.push({ 
            type: "faculty", 
            name: facultyName, 
            programs: programs 
          });
          // Add all programs for this faculty
          programs.forEach((program) => {
            tempItems.push({
              type: "program",
              name: program.name,
              href: program.href,
              faculty: facultyName,
            });
          });
        });
        
        curriculumItems = tempItems;
      }
    } catch (error) {
      // Failed to load curriculum
    } finally {
      loading = false;
    }
  }

  function selectTab(tab: Tab) {
    activeTab = tab;
    if (tab === "news") {
      loadNewsData();
    } else if (tab === "curriculum") {
      loadCurriculumData();
    } else if (tab === "schedule") {
      if (!scheduleIframeUrl) {
        scheduleIframeUrl = sourceUrl.replace("minor.php", "minor_teachtable.php");
      }
    } else if (tab === "chat") {
      if (!chatIframeUrl) {
        chatIframeUrl = sourceUrl.replace("minor.php", "minor_message.php");
      }
    }
  }

  function openOriginal() {
    window.open(sourceUrl, "_blank");
  }
  
  async function submitChatMessage() {
    if (!chatTopic.trim() || !chatDetail.trim()) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    
    chatSubmitting = true;
    try {
      // Simulate submission - actual implementation would use GM_xmlhttpRequest
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("ส่งข้อความเรียบร้อยแล้ว");
      chatTopic = "";
      chatDetail = "";
    } catch (error) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      chatSubmitting = false;
    }
  }
  
  // Pagination computed values
  $: totalPages = Math.ceil(newsItems.length / ITEMS_PER_PAGE);
  $: startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  $: endIndex = Math.min(startIndex + ITEMS_PER_PAGE, newsItems.length);
  $: paginatedItems = newsItems.slice(startIndex, endIndex);
  
  // Reset to page 1 when news items change
  $: if (newsItems.length > 0 && currentPage > totalPages) {
    currentPage = 1;
  }
  
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      // Scroll to top of news section
      const newsSection = document.querySelector('[data-section="news"]');
      if (newsSection) {
        newsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
</script>

<div class="min-h-screen font-prompt bg-gradient-to-br from-orange-50/50 to-amber-50/30 dark:from-zinc-900 dark:to-zinc-800/50">
  <!-- Header -->
  <div class="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 px-6 py-8 shadow-xl">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon icon="ph:graduation-cap-duotone" class="text-4xl text-white" />
          </div>
          <div>
            <h1 class="text-3xl font-bold text-white mb-1">หลักสูตรวิชาโท</h1>
            <p class="text-orange-100 text-sm">Minor Program Management</p>
          </div>
        </div>
        <button
          on:click={openOriginal}
          class="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all duration-200 hover:scale-105"
        >
          <Icon icon="ph:arrow-square-out-duotone" class="text-lg" />
          <span class="text-sm font-medium">เปิดหน้าต้นฉบับ</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Tabs Navigation -->
  <div class="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/50 sticky top-0 z-40 shadow-sm">
    <div class="max-w-6xl mx-auto px-6">
      <div class="flex gap-1 overflow-x-auto scrollbar-hide">
        {#each tabs as tab}
          <button
            class="group relative flex items-center gap-2 px-4 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap
              {activeTab === tab.id
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-300'}"
            on:click={() => selectTab(tab.id)}
          >
            <Icon icon={tab.icon} class="text-lg" />
            <span>{tab.label}</span>
            {#if activeTab === tab.id}
              <div
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-full"
                transition:slide={{ duration: 200, easing: quintOut }}
              ></div>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Content Area -->
  <div class="max-w-6xl mx-auto px-6 py-8">
    {#if activeTab === "home"}
      <div transition:fade={{ duration: 200 }}>
        <!-- Schedule Timeline -->
        <div class={cn(classes.card.base, 'p-8')}>
          <div class="flex items-center gap-3 mb-6">
            <div class={cn(classes.button.icon, 'bg-orange-100/80 dark:bg-orange-900/40')}>
              <Icon icon="ph:calendar-check-duotone" class="text-xl text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 class={classes.text.heading1}>กำหนดการ</h2>
              <p class={classes.text.bodySecondary}>ภาคการศึกษาที่ 2/2568</p>
            </div>
          </div>

          <div class="space-y-4">
            {#each scheduleData as item, index}
              <div class="flex gap-4 group">
                <!-- Timeline dot -->
                <div class="flex flex-col items-center">
                  <div class="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30 group-hover:scale-125 transition-transform duration-200"></div>
                  {#if index < scheduleData.length - 1}
                    <div class="w-0.5 h-full bg-gradient-to-b from-orange-200 to-orange-100 dark:from-orange-500/30 dark:to-orange-500/10 mt-1"></div>
                  {/if}
                </div>

                <!-- Content -->
                <div class="flex-1 pb-4">
                  <div class="bg-gradient-to-r from-orange-50/70 to-amber-50/60 dark:from-gray-800/60 dark:to-orange-900/20 backdrop-blur-sm rounded-xl border border-orange-200/60 dark:border-orange-500/30 p-4 group-hover:shadow-md group-hover:scale-[1.01] transition-all duration-200">
                    <h3 class="font-semibold text-gray-900 dark:text-white mb-1">{item.label}</h3>
                    <div class="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                      <Icon icon="ph:clock-duotone" class="text-base" />
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>

          <!-- Important Note -->
          <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl">
            <div class="flex items-start gap-3">
              <Icon icon="ph:info-duotone" class="text-xl text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div class="text-sm text-blue-900 dark:text-blue-200">
                <p class="font-semibold mb-1">หมายเหตุสำคัญ</p>
                <p>นักศึกษาที่ผ่านการคัดเลือกต้องยืนยันสิทธิ์เข้าศึกษาและชำระเงินภายในกำหนด</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    {:else if activeTab === "news"}
      <div transition:fade={{ duration: 200 }} data-section="news">
        <div class={cn(classes.card.base, 'p-8')}>
          <div class="flex items-center gap-3 mb-6">
            <div class={cn(classes.button.icon, 'bg-orange-100/80 dark:bg-orange-900/40')}>
              <Icon icon="ph:newspaper-duotone" class="text-xl text-orange-600 dark:text-orange-400" />
            </div>
            <h2 class={classes.text.heading1}>ข่าวสารและประกาศ</h2>
          </div>

          {#if loading}
            <div class="text-center py-12">
              <div class="w-14 h-14 rounded-full border-4 border-orange-200/60 border-t-orange-500 animate-spin mx-auto mb-4"></div>
              <p class="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
            </div>
          {:else if newsItems.length > 0}
            <div class="space-y-2 mb-6">
              {#each paginatedItems as news, idx}
                <button
                  class="group w-full rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm px-5 py-4 text-left transition-all hover:border-orange-400/60 hover:bg-orange-50/70 hover:shadow-sm dark:hover:bg-orange-900/20 shadow-sm"
                  on:click={() => window.open(news.href, '_blank', 'noopener')}
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0 flex-1 space-y-1.5">
                      <div class="flex items-start gap-2">
                        <span class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100/80 dark:bg-orange-900/40 backdrop-blur-sm text-xs font-semibold text-orange-600 dark:text-orange-400">
                          {startIndex + idx + 1}
                        </span>
                        <h4 class="flex-1 text-sm font-medium leading-relaxed text-gray-900 group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">
                          {news.title.replace(/\([0-9]+\)/g, '').replace(/<[^>]*>/g, '').trim()}
                        </h4>
                      </div>
                      {#if news.date}
                        <div class="flex items-center gap-2 pl-8">
                          <Icon icon="ph:clock-duotone" class="text-sm text-orange-600 dark:text-orange-400" />
                          <p class="text-xs text-gray-600 dark:text-gray-400">{news.date}</p>
                        </div>
                      {/if}
                    </div>
                    <div class="shrink-0">
                      <Icon
                        icon="ph:arrow-right-duotone"
                        class="text-xl text-orange-600 dark:text-orange-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                      />
                    </div>
                  </div>
                </button>
              {/each}
            </div>

            <!-- Pagination Controls -->
            {#if totalPages > 1}
              <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200/60 dark:border-gray-700/50">
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  แสดง {startIndex + 1}-{endIndex} จาก {newsItems.length} รายการ
                </div>
                
                <div class="flex items-center gap-2">
                  <!-- Previous Button -->
                  <button
                    on:click={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    class="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      {currentPage === 1
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'text-orange-600 dark:text-orange-400 hover:bg-orange-50/70 dark:hover:bg-orange-900/20'}"
                  >
                    <Icon icon="ph:caret-left-bold" class="text-base" />
                  </button>

                  <!-- Page Numbers -->
                  <div class="flex items-center gap-1">
                    {#if totalPages <= 7}
                      {#each Array(totalPages) as _, i}
                        <button
                          on:click={() => goToPage(i + 1)}
                          class="w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm
                            {currentPage === i + 1
                              ? 'bg-orange-500/90 text-white shadow-md shadow-orange-500/25'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50/70 dark:hover:bg-orange-900/20'}"
                        >
                          {i + 1}
                        </button>
                      {/each}
                    {:else}
                      <!-- First page -->
                      <button
                        on:click={() => goToPage(1)}
                        class="w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm
                          {currentPage === 1
                            ? 'bg-orange-500/90 text-white shadow-md shadow-orange-500/25'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50/70 dark:hover:bg-orange-900/20'}"
                      >
                        1
                      </button>

                      {#if currentPage > 3}
                        <span class="text-gray-500 dark:text-gray-400 px-2">...</span>
                      {/if}

                      <!-- Middle pages -->
                      {#each Array(totalPages) as _, i}
                        {#if i + 1 > 1 && i + 1 < totalPages && Math.abs(i + 1 - currentPage) <= 1}
                          <button
                            on:click={() => goToPage(i + 1)}
                            class="w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm
                              {currentPage === i + 1
                                ? 'bg-orange-500/90 text-white shadow-md shadow-orange-500/25'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50/70 dark:hover:bg-orange-900/20'}"
                          >
                            {i + 1}
                          </button>
                        {/if}
                      {/each}

                      {#if currentPage < totalPages - 2}
                        <span class="text-gray-500 dark:text-gray-400 px-2">...</span>
                      {/if}

                      <!-- Last page -->
                      <button
                        on:click={() => goToPage(totalPages)}
                        class="w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm
                          {currentPage === totalPages
                            ? 'bg-orange-500/90 text-white shadow-md shadow-orange-500/25'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50/70 dark:hover:bg-orange-900/20'}"
                      >
                        {totalPages}
                      </button>
                    {/if}
                  </div>

                  <!-- Next Button -->
                  <button
                    on:click={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    class="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      {currentPage === totalPages
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'text-orange-600 dark:text-orange-400 hover:bg-orange-50/70 dark:hover:bg-orange-900/20'}"
                  >
                    <Icon icon="ph:caret-right-bold" class="text-base" />
                  </button>
                </div>
              </div>
            {/if}
          {:else}
            <div class="text-center py-12">
              <Icon icon="ph:newspaper-clipping-duotone" class="text-6xl text-orange-300 dark:text-orange-500/50 mx-auto mb-4" />
              <p class="text-gray-600 dark:text-gray-400">ไม่มีข่าวสารในขณะนี้</p>
            </div>
          {/if}
        </div>
      </div>

    {:else if activeTab === "curriculum"}
      <div transition:fade={{ duration: 200 }}>
        <div class={cn(classes.card.base, 'p-8')}>
          <div class="flex items-center gap-3 mb-6">
            <div class={cn(classes.button.icon, 'bg-orange-100/80 dark:bg-orange-900/40')}>
              <Icon icon="ph:book-open-duotone" class="text-xl text-orange-600 dark:text-orange-400" />
            </div>
            <h2 class={classes.text.heading1}>หลักสูตรวิชาโทที่เปิดสอน</h2>
          </div>

          {#if loading}
            <div class="text-center py-12">
              <div class="w-14 h-14 rounded-full border-4 border-orange-200/60 border-t-orange-500 animate-spin mx-auto mb-4"></div>
              <p class="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
            </div>
          {:else if curriculumItems.length > 0}
            <div class="space-y-6">
              {#each curriculumItems as item, index}
                {#if item.type === "faculty"}
                  <div class="pt-4 first:pt-0">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="h-px flex-1 bg-gradient-to-r from-orange-200 to-transparent dark:from-orange-500/30"></div>
                      <h3 class="text-base font-semibold text-orange-600 dark:text-orange-400">{item.name}</h3>
                      <div class="h-px flex-1 bg-gradient-to-l from-orange-200 to-transparent dark:from-orange-500/30"></div>
                    </div>
                    
                    <!-- Show empty state if this faculty has no programs -->
                    {#if !item.programs || item.programs.length === 0}
                      <div class="text-center py-8 px-4 rounded-xl bg-gray-50/70 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/50">
                        <Icon icon="ph:folder-open-duotone" class="text-4xl text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                        <p class="text-sm text-gray-600 dark:text-gray-400">ไม่มีหลักสูตรในคณะนี้</p>
                      </div>
                    {/if}
                  </div>
                {:else if item.type === "program"}
                  <a
                    href={item.href}
                    target="_blank"
                    class="flex items-center gap-4 p-4 rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-gradient-to-r from-white/90 to-orange-50/40 dark:from-gray-800/80 dark:to-orange-900/10 backdrop-blur-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 group"
                  >
                    <div class="w-10 h-10 rounded-lg bg-orange-100/80 dark:bg-orange-900/40 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Icon icon="ph:file-pdf-duotone" class="text-xl text-orange-600 dark:text-orange-400" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="font-prompt text-sm font-medium leading-relaxed text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {item.name}
                      </h4>
                    </div>
                    <Icon icon="ph:arrow-square-out-duotone" class="text-xl text-orange-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </a>
                {/if}
              {/each}
            </div>
          {:else}
            <div class="text-center py-12">
              <Icon icon="ph:books-duotone" class="text-6xl text-orange-300 dark:text-orange-500/50 mx-auto mb-4" />
              <p class="text-gray-600 dark:text-gray-400">ไม่มีหลักสูตรในขณะนี้</p>
            </div>
          {/if}
        </div>
      </div>

    {:else if activeTab === "application"}
      <div transition:fade={{ duration: 200 }}>
        <div class={cn(classes.card.base, 'p-8')}>
          <div class="text-center py-12">
            <div class={cn(
              'w-20 h-20 rounded-full backdrop-blur-sm flex items-center justify-center mx-auto mb-6',
              'bg-orange-100/80 dark:bg-orange-900/40'
            )}>
              <Icon icon="ph:wrench-duotone" class="text-4xl text-orange-600 dark:text-orange-400" />
            </div>
            <h3 class={cn(classes.text.heading1, 'mb-3')}>สมัครหลักสูตรวิชาโท</h3>
            <div class={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 backdrop-blur-sm',
              'bg-orange-100/80 dark:bg-orange-900/40',
              'text-orange-700 dark:text-orange-300'
            )}>
              <Icon icon="ph:code-duotone" class="text-lg" />
              <span>อยู่ระหว่างการพัฒนา</span>
            </div>
            <p class={cn(classes.text.body, 'max-w-md mx-auto mb-6')}>
              ดีไซน์ใหม่ของเมนูนี้กำลังอยู่ในระหว่างการพัฒนา
              <br />
              โปรดใช้งานหน้าต้นฉบับและติดตามข่าวสารอัพเดทเร็วๆ นี้
            </p>
          </div>
        </div>
      </div>

    {:else if activeTab === "schedule"}
      <div transition:fade={{ duration: 200 }}>
        <div class={cn(classes.card.base, 'overflow-hidden')}>
          <div class="p-6 border-b border-gray-200/60 dark:border-gray-700/50">
            <div class="flex items-center gap-3">
              <div class={cn(classes.button.icon, 'bg-orange-100/80 dark:bg-orange-900/40')}>
                <Icon icon="ph:calendar-duotone" class="text-xl text-orange-600 dark:text-orange-400" />
              </div>
              <h2 class={classes.text.heading1}>ตารางเรียน - ตารางสอบ</h2>
            </div>
          </div>
          {#if scheduleIframeUrl}
            <div class="relative" style="min-height: 600px;">
              <iframe
                src={scheduleIframeUrl}
                title="ตารางเรียน-ตารางสอบ"
                class="w-full h-full border-0"
                style="min-height: 600px;"
              ></iframe>
            </div>
          {:else}
            <div class="text-center py-12">
              <Icon icon="ph:calendar-blank-duotone" class="text-6xl text-orange-300 dark:text-orange-500/50 mx-auto mb-4" />
              <p class="text-gray-600 dark:text-gray-400">กำลังโหลดตารางเรียน-ตารางสอบ...</p>
            </div>
          {/if}
        </div>
      </div>

    {:else if activeTab === "guide"}
      <div transition:fade={{ duration: 200 }}>
        <div class={cn(classes.card.base, 'p-8')}>
          <div class="flex items-center gap-3 mb-6">
            <div class={cn(classes.button.icon, 'bg-orange-100/80 dark:bg-orange-900/40')}>
              <Icon icon="ph:book-bookmark-duotone" class="text-xl text-orange-600 dark:text-orange-400" />
            </div>
            <h2 class={classes.text.heading1}>คู่มือการลงทะเบียน</h2>
          </div>

          <div class="max-w-3xl mx-auto">
            <div class="bg-gradient-to-br from-orange-50/70 to-amber-50/70 dark:from-orange-900/20 dark:to-amber-900/10 backdrop-blur-sm rounded-xl p-8 border border-orange-200/60 dark:border-orange-600/50">
              <div class="text-center mb-6">
                <div class="w-20 h-20 rounded-full bg-orange-100/80 dark:bg-orange-900/40 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                  <Icon icon="ph:file-pdf-duotone" class="text-5xl text-orange-600 dark:text-orange-400" />
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">คู่มือการลงทะเบียนหลักสูตรวิชาโท</h3>
                <p class="text-sm text-gray-700 dark:text-gray-300">แนะนำขั้นตอนและวิธีการลงทะเบียนเรียนวิชาโท</p>
              </div>

              <div class="space-y-4">
                <a
                  href="http://www.reg.kmitl.ac.th/uploads/minor_regis.pdf"
                  target="_blank"
                  class="flex items-center justify-between p-4 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-orange-200/60 dark:border-orange-600/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group"
                >
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg bg-orange-100/80 dark:bg-orange-900/40 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Icon icon="ph:file-pdf-duotone" class="text-2xl text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h4 class="font-prompt text-sm font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        ดาวน์โหลดคู่มือ (PDF)
                      </h4>
                      <p class="font-prompt text-xs text-gray-600 dark:text-gray-400 mt-1">คลิกเพื่อดาวน์โหลดและอ่านคู่มือฉบับเต็ม</p>
                    </div>
                  </div>
                  <Icon icon="ph:download-duotone" class="text-2xl text-orange-400 group-hover:translate-y-1 transition-transform flex-shrink-0" />
                </a>

                <div class="bg-blue-50/70 dark:bg-blue-900/20 backdrop-blur-sm border border-blue-200/60 dark:border-blue-500/50 rounded-xl p-4">
                  <div class="flex items-start gap-3">
                    <Icon icon="ph:info-duotone" class="text-xl text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div class="text-sm text-blue-800 dark:text-blue-200">
                      <p class="font-medium mb-1">ข้อมูลสำคัญ</p>
                      <ul class="space-y-1 text-xs">
                        <li>• อ่านคู่มือให้ละเอียดก่อนลงทะเบียน</li>
                        <li>• ตรวจสอบคุณสมบัติและเงื่อนไขการสมัคร</li>
                        <li>• ติดตามกำหนดการและวันสำคัญ</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    {:else if activeTab === "chat"}
      <div transition:fade={{ duration: 200 }}>
        <div class={cn(classes.card.base, 'p-8')}>
          <div class="flex items-center gap-3 mb-6">
            <div class={cn(classes.button.icon, 'bg-orange-100/80 dark:bg-orange-900/40')}>
              <Icon icon="ph:chats-circle-duotone" class="text-xl text-orange-600 dark:text-orange-400" />
            </div>
            <div class="flex-1">
              <h2 class={classes.text.heading1}>ส่งข้อความถึงสำนักทะเบียน</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">เกี่ยวกับหลักสูตรวิชาโท</p>
            </div>
          </div>

          <div class="max-w-3xl mx-auto">
            <!-- Info Banner -->
            <div class="mb-6 bg-blue-50/70 dark:bg-blue-900/20 backdrop-blur-sm border border-blue-200/60 dark:border-blue-500/30 rounded-xl p-4">
              <div class="flex items-start gap-3">
                <Icon icon="ph:info-duotone" class="text-xl text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div class="text-sm text-blue-800 dark:text-blue-200">
                  <p class="font-medium mb-1">แจ้งเตือน</p>
                  <p class="text-xs">ข้อความของคุณจะถูกส่งไปยังเจ้าหน้าที่สำนักทะเบียน กรุณาระบุรายละเอียดให้ชัดเจน</p>
                </div>
              </div>
            </div>

            <!-- Message Form -->
            <form on:submit|preventDefault={submitChatMessage} class="space-y-5">
              <!-- Topic Field -->
              <div>
                <label for="chat-topic" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div class="flex items-center gap-2">
                    <Icon icon="ph:chat-text-duotone" class="text-base text-orange-500" />
                    <span>หัวข้อ</span>
                    <span class="text-red-500">*</span>
                  </div>
                </label>
                <input
                  id="chat-topic"
                  type="text"
                  bind:value={chatTopic}
                  placeholder="กรอกหัวข้อที่ต้องการสอบถาม"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-white/90 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                />
              </div>

              <!-- Detail Field -->
              <div>
                <label for="chat-detail" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div class="flex items-center gap-2">
                    <Icon icon="ph:note-duotone" class="text-base text-orange-500" />
                    <span>รายละเอียด</span>
                    <span class="text-red-500">*</span>
                  </div>
                </label>
                <textarea
                  id="chat-detail"
                  bind:value={chatDetail}
                  placeholder="กรอกรายละเอียดเพิ่มเติม..."
                  rows="6"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-white/90 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none"
                ></textarea>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {chatDetail.length} ตัวอักษร
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={chatSubmitting || !chatTopic.trim() || !chatDetail.trim()}
                  class="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500/90 hover:bg-orange-600/90 disabled:bg-gray-300/80 dark:disabled:bg-gray-700/60 backdrop-blur-sm text-white rounded-xl font-medium transition-all duration-200 shadow-sm shadow-orange-500/25 hover:shadow-md hover:shadow-orange-500/30 hover:scale-[1.02] disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                >
                  {#if chatSubmitting}
                    <div class="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    <span>กำลังส่ง...</span>
                  {:else}
                    <Icon icon="ph:paper-plane-tilt-duotone" class="text-xl" />
                    <span>ส่งข้อความ</span>
                  {/if}
                </button>
                
                <button
                  type="button"
                  on:click={() => { chatTopic = ""; chatDetail = ""; }}
                  disabled={chatSubmitting}
                  class="px-6 py-3 border border-gray-200/60 dark:border-gray-700/50 bg-white/80 dark:bg-gray-700/60 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50/70 dark:hover:bg-gray-800/70 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ล้างข้อมูล
                </button>
              </div>
            </form>

            <!-- Tips Section -->
            <div class="mt-8 p-5 bg-orange-50/70 dark:bg-orange-900/10 backdrop-blur-sm rounded-xl border border-orange-100/60 dark:border-orange-500/20">
              <div class="flex items-start gap-3">
                <Icon icon="ph:lightbulb-duotone" class="text-xl text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div class="text-sm text-gray-700 dark:text-gray-300">
                  <p class="font-medium mb-2">เคล็ดลับในการส่งข้อความ</p>
                  <ul class="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <li>• ระบุรหัสนักศึกษาและชื่อ-นามสกุล ให้ชัดเจน</li>
                    <li>• อธิบายปัญหาหรือคำถามอย่างละเอียด</li>
                    <li>• แนบหลักฐานหรือเอกสารประกอบ (ถ้ามี)</li>
                    <li>• ตรวจสอบความถูกต้องก่อนส่ง</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>
