<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte";
  import { slide, fade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import Icon from "@iconify/svelte";
  import { classes, cn } from "../libs/styles";
  import { Button, ConfirmModal } from "../libs/components/common";
  import PortalFetcher, {
    type PortalContent,
    type PortalScript,
  } from "../libs/utils/PortalFetcher";
  import StudentProfileScraping, {
    type StudentProfile,
    type StudentProfileAnnouncement,
  } from "../libs/utils/StudentProfileScraping";
  import type {
    PortalSection,
    PortalMenuItem,
    PortalMeta,
  } from "../libs/utils/PortalScraping";
  import ContentRenderer from "../libs/components/portal/ContentRenderer.svelte";
  import MinorProgramPage from "../libs/components/portal/MinorProgramPage.svelte";
  import {
    mapDocumentToContent,
    type PortalContentModel,
  } from "../libs/utils/PortalContentMapper";

  export let sections: PortalSection[];
  export let portalMeta: PortalMeta;
  export let originalModeKey: string;

  const fetcher = new PortalFetcher();

  let activeSection: PortalSection | null = null;
  let activeItem: PortalMenuItem | null = null;
  let contentModel: PortalContentModel | null = null;
  let contentHtml = "";
  let loading = false;
  let error: string | null = null;
  let profile: StudentProfile | null = null;
  let contentHost: HTMLDivElement | null = null;
  let viewerNotice: string | null = null;
  let showNationalId = false;
  const menuAnnouncementItems = selectAnnouncementItems();
  let expandedSectionId: string | null = null;
  let profileActiveItemId: string | null;
  
  // Modal state
  let showConfirmModal = false;
  let pendingItem: PortalMenuItem | null = null;
  let pendingSection: PortalSection | null = null;

  const POPULAR_KEYWORDS = [
    "ข้อมูลนักศึกษา",
    "ตารางเรียนส่วนบุคคล",
    "ตารางสอบส่วนบุคคล",
    "ข้อมูลคะแนนเก็บ",
    "ข้อมูลผลการเรียน",
    "ลงทะเบียน", // เปลี่ยนจาก "ลงทะเบียนเรียน" เป็น "ลงทะเบียน" เพื่อให้ค้นหาได้กว้างขึ้น
  ];

  const flattenedItems = sections
    .map((section) => section.items.map((item) => ({ section, item })))
    .flat();

  const popularItems = buildPopularList();

  let clock = buildInitialClock();
  let timer: ReturnType<typeof setInterval> | null = null;

  let theme = "dark";

  type ProfileSectionSummary = {
    title: string;
    items: Array<{ label: string; value: string }>;
  };

  type HomeAnnouncementEntry =
    | { kind: "menu"; section: PortalSection; item: PortalMenuItem }
    | { kind: "profile"; announcement: StudentProfileAnnouncement };

  let profileSections: ProfileSectionSummary[] = [];
  let profileAnnouncements: StudentProfileAnnouncement[] = [];
  let homeAnnouncementEntries: HomeAnnouncementEntry[] = [];
  const personalInfoItem = findPersonalInfoItem();

  function buildInitialClock(): Date {
    if (portalMeta.initialServerTime) {
      const parsed = portalMeta.initialServerTime.replace(/-/g, "/");
      const seed = new Date(parsed);
      if (!Number.isNaN(seed.getTime())) return seed;
    }
    return new Date();
  }

  function buildPopularList() {
    const result: Array<{ section: PortalSection; item: PortalMenuItem }> = [];
    
    // Find items matching each keyword in order
    POPULAR_KEYWORDS.forEach(keyword => {
      // Try exact match first, then partial match
      let found = flattenedItems.find(({ item }) => item.label === keyword);
      if (!found) {
        found = flattenedItems.find(({ item }) => item.label.includes(keyword));
      }
      
      if (found && !result.some(r => r.item.id === found.item.id)) {
        result.push(found);
      }
    });
    
    // Return exactly 6 items (or less if not enough matches)
    return result.slice(0, 6);
  }

  function selectAnnouncementItems() {
    const preferredSection =
      sections.find((section) => section.id === "news") ||
      sections.find((section) => /ข่าว|ประกาศ/.test(section.title));

    const pool = preferredSection
      ? preferredSection.items.map((item) => ({ section: preferredSection, item }))
      : flattenedItems;

    const announcementKeywords = ["ประกาศ", "ข่าว", "แจ้ง", "ข่าวสาร", "ข่าวประชาสัมพันธ์"];

    const prioritized = pool.filter(({ item }) =>
      announcementKeywords.some((keyword) => item.label.includes(keyword))
    );

    const merged = prioritized.length > 0 ? prioritized : pool;

    return merged.slice(0, 6);
  }

  function findPersonalInfoItem() {
    return (
      flattenedItems.find(({ item }) =>
        /ข้อมูลนักศึกษา|ข้อมูลส่วนบุคคล|Student/i.test(item.label)
      ) || null
    );
  }

  $: homeAnnouncementEntries = buildHomeAnnouncementEntries();

  function buildHomeAnnouncementEntries(): HomeAnnouncementEntry[] {
    const combined: HomeAnnouncementEntry[] = [];
    const seen = new Set<string>();

    const pushEntry = (entry: HomeAnnouncementEntry) => {
      const key =
        entry.kind === "menu"
          ? `menu-${entry.item.id}`
          : `profile-${entry.announcement.id}`;
      if (seen.has(key)) return;
      seen.add(key);
      combined.push(entry);
    };

    profileAnnouncements.forEach((announcement) => {
      if (!announcement?.title) return;
      pushEntry({ kind: "profile", announcement });
    });

    menuAnnouncementItems.forEach(({ section, item }) => {
      pushEntry({ kind: "menu", section, item });
    });

    return combined.slice(0, 6);
  }

  function resolveProfileAnnouncementSource(
    source: StudentProfileAnnouncement["source"]
  ): string {
    switch (source) {
      case "registrar-highlight":
        return "ข่าวจากสำนักทะเบียน";
      default:
        return "ข้อมูลส่วนบุคคล";
    }
  }

  function getProfileAnnouncementClasses(
    variant: StudentProfileAnnouncement["variant"]
  ): string {
    if (variant === "empty") {
      return "rounded-2xl border border-dashed border-orange-200 dark:border-orange-500/30 bg-orange-50/70 dark:bg-orange-500/10 p-6 flex flex-col gap-3 justify-center text-center";
    }
    return "rounded-2xl border border-orange-100/70 dark:border-orange-500/20 bg-white/70 dark:bg-orange-500/10 p-5 flex flex-col gap-3 shadow-sm";
  }

  async function prefetchPersonalInfoAnnouncements() {
    if (!personalInfoItem?.item?.supportsEmbed) return;
    try {
      const content = await fetcher.load(personalInfoItem.item.absoluteUrl);
      hydrateProfileIfPossible(personalInfoItem.item, content);
    } catch (error) {
      // Ignore background preload failures.
    }
  }

  onMount(async () => {
    const storedTheme = localStorage.getItem("theme") || "dark";
    theme = storedTheme;
    applyTheme(theme);

    timer = setInterval(() => {
      clock = new Date(clock.getTime() + 1000);
    }, 1000);

    void prefetchPersonalInfoAnnouncements();
  });

  onDestroy(() => {
    if (timer) clearInterval(timer);
  });

  async function selectItem(section: PortalSection, item: PortalMenuItem) {
    activeSection = section;
    // Auto-expand the section when an item is selected
    if (expandedSectionId !== section.id) {
      expandedSectionId = section.id;
    }
    profileActiveItemId = null;
    
    // Show confirmation modal for external links
    if (!item.supportsEmbed) {
      pendingSection = section;
      pendingItem = item;
      showConfirmModal = true;
      return;
    }
    
    await loadItem(item);
  }

  function handleSelectItem(section: PortalSection | null, item: PortalMenuItem) {
    if (!section) return;
    void selectItem(section, item);
  }
  
  function handleConfirmModal() {
    if (pendingItem?.absoluteUrl) {
      window.open(pendingItem.absoluteUrl, "_blank");
    }
    showConfirmModal = false;
    pendingItem = null;
    pendingSection = null;
  }
  
  function handleCancelModal() {
    showConfirmModal = false;
    pendingItem = null;
    pendingSection = null;
  }

  async function loadItem(item: PortalMenuItem) {
    activeItem = item;
    error = null;
    viewerNotice = null;
    contentModel = null;
    contentHtml = "";
    profileActiveItemId = null;

    if (!item.supportsEmbed) {
      loading = false;
      viewerNotice =
        "เมนูนี้จะเปิดในหน้าต่างใหม่ กรุณากดปุ่ม \"เปิดหน้าต้นฉบับ\" เพื่อดูรายละเอียด";
      return;
    }

    loading = true;

    try {
      const content = await fetcher.load(item.absoluteUrl);
      loading = false;
      const handledInternally = hydrateProfileIfPossible(item, content);
      if (handledInternally) {
        return;
      }

      const mapped = mapDocumentToContent(content.document, {
        sourceUrl: item.absoluteUrl,
      });
      if (mapped.blocks.length > 0) {
        contentModel = mapped;
      } else {
        // Legacy content detected - switch to original mode with hard redirect
        sessionStorage.setItem(originalModeKey, "original");
        // Use location.replace to force complete page reload without back history
        window.location.replace(item.absoluteUrl);
        return;
      }
    } catch (err) {
      loading = false;
      contentHtml = "";
      contentModel = null;
      error =
        err instanceof Error
          ? err.message
          : "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง";
    }
  }

  function hydrateProfileIfPossible(
    item: PortalMenuItem,
    content: PortalContent
  ): boolean {
    if (!item.absoluteUrl.includes("student.php")) return false;
    const scraper = new StudentProfileScraping(content.document);
    const extracted = scraper.extract();
    if (extracted.studentId) {
      profile = extracted;
      profileSections = buildProfileSections(extracted);
      profileAnnouncements = extracted.announcements ?? [];
      showNationalId = false;
      profileActiveItemId = item.id;
      viewerNotice = null;
      return true;
    }
    return false;
  }

  function injectScripts(scripts: PortalScript[]) {
    const host = contentHost;
    if (!host) return;
    scripts.forEach((script) => {
      if (script.src) {
        if (fetcher.hasExecutedScript(script.src)) return;
        const external = document.createElement("script");
        external.src = script.src;
        external.async = false;
        external.defer = false;
        external.crossOrigin = "anonymous";
        external.addEventListener("load", () => {
          fetcher.markScriptExecuted(script.src!);
          setTimeout(() => external.remove(), 0);
        });
        host.appendChild(external);
      } else if (script.content) {
        const inline = document.createElement("script");
        inline.textContent = script.content;
        host.appendChild(inline);
        setTimeout(() => inline.remove(), 0);
      }
    });
  }

  function openOriginal() {
    if (!activeItem) return;
    window.open(activeItem.absoluteUrl, "_blank", "noopener");
  }

  function switchToOriginal() {
    sessionStorage.setItem(originalModeKey, "original");
    window.location.reload();
  }

  function applyTheme(nextTheme: string) {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(nextTheme === "light" ? "light" : "dark");
    localStorage.setItem("theme", nextTheme);
  }

  function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
    applyTheme(theme);
  }

  function goToHome() {
    activeItem = null;
    activeSection = null;
    profileActiveItemId = null;
    contentModel = null;
    contentHtml = "";
    error = null;
    viewerNotice = null;
    profile = null;
  }

  function buildProfileSections(data: StudentProfile): ProfileSectionSummary[] {
    const groups: ProfileSectionSummary[] = [
      {
        title: "ข้อมูลส่วนตัว",
        items: [
          { label: "ชื่อ-สกุล (TH)", value: data.thaiFullName },
          { label: "ชื่อ-สกุล (EN)", value: data.englishFullName },
          { label: "วันเกิด", value: data.birthDate },
          { label: "เพศ", value: data.gender },
        ],
      },
      {
        title: "ข้อมูลการศึกษา",
        items: [
          { label: "รหัสนักศึกษา", value: data.studentId },
          { label: "สถานะการศึกษา", value: data.status },
          { label: "คณะ", value: data.faculty },
          { label: "หลักสูตร", value: data.curriculum },
        ],
      },
      {
        title: "ข้อมูลการรับเข้า",
        items: [
          { label: "ประเภทการรับ", value: data.admissionType },
          { label: "ปีที่เข้า", value: data.admissionYear },
          { label: "กำหนดจบ (ปี)", value: data.expectedGraduationYear },
          { label: "กำหนดจบ (วันที่)", value: data.expectedGraduationDate },
        ],
      },
    ];

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.value && item.value !== "-"),
      }))
      .filter((group) => group.items.length > 0);
  }

  $: profileSections = profile ? buildProfileSections(profile) : [];

  function hasValue(value: string | null | undefined): boolean {
    return Boolean(value && value !== "-");
  }

  function resolvePreferredValue(...values: Array<string | null | undefined>): string {
    for (const value of values) {
      if (value && value !== "-") return value;
    }
    return "";
  }

  function isMinorProgramOnly(model: any): boolean {
    return (
      model?.blocks?.length === 1 && 
      model.blocks[0]?.type === "minorProgram"
    );
  }

  function getMinorProgramSourceUrl(model: any): string {
    return model?.blocks?.[0]?.sourceUrl || "";
  }

  let profileStatusValue = "";
  let profileCurriculumValue = "";
  let profileExpectedGradValue = "";

  $: profileStatusValue = profile && hasValue(profile.status) ? profile.status : "";
  $: profileCurriculumValue = profile && hasValue(profile.curriculum) ? profile.curriculum : "";
  $: profileExpectedGradValue = profile
    ? resolvePreferredValue(profile.expectedGraduationYear, profile.expectedGraduationDate)
    : "";
  $: profileExpectedGradValue = hasValue(profileExpectedGradValue) ? profileExpectedGradValue : "";

  function formatDate(date: Date): string {
    return date.toLocaleDateString("th-TH", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }

  function toggleSection(sectionId: string) {
    // Toggle: if already expanded, collapse it; otherwise expand it
    expandedSectionId = expandedSectionId === sectionId ? null : sectionId;
  }

</script>

<main class="min-h-screen font-prompt bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 text-gray-900 dark:text-white">
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <aside class="hidden lg:flex lg:w-64 xl:w-72 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div class="sticky top-0 flex flex-col h-screen">
        <!-- Header Section with Logo -->
        <div class="flex-shrink-0 px-4 py-6 border-b border-gray-200 dark:border-gray-800">
          <div class="flex flex-col items-center gap-2">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/KMITL_Sublogo.svg/1024px-KMITL_Sublogo.svg.png"
              alt="KMITL"
              class="h-16 object-contain"
            />
            <div class="text-center">
              <p class="text-xs font-semibold text-orange-500 dark:text-orange-400">
                ระบบสารสนเทศนักศึกษา
              </p>
              <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                Student Information System
              </p>
            </div>
          </div>
        </div>

        <!-- Scrollable Content Area -->
        <div class="flex-1 overflow-y-auto px-3 py-3 space-y-3 sidebar-scroll">
          <!-- Popular Items Section -->
          <div>
            <p class={cn(classes.text.labelOrange, 'mb-2')}>แนะนำยอดนิยม</p>
            <div class="space-y-2">
              {#each popularItems as popular}
                <button
                  class={cn(
                    'group w-full text-left rounded-xl p-3 transition-all',
                    'bg-gradient-to-br from-orange-500/10 to-orange-600/5',
                    'hover:from-orange-500/20 hover:to-orange-600/10',
                    'border border-orange-500/20 hover:border-orange-500/30',
                    'flex items-start gap-3'
                  )}
                  on:click={() => selectItem(popular.section, popular.item)}
                >
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Icon icon="ph:star-duotone" class="text-xl text-orange-500 dark:text-orange-400" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class={cn(classes.text.body, 'font-semibold text-orange-600 dark:text-orange-400 truncate')}>
                      {popular.item.label}
                    </p>
                    <p class={cn(classes.text.caption, 'truncate opacity-80')}>
                      {popular.section.title}
                    </p>
                  </div>
                </button>
              {/each}
            </div>
          </div>

          <!-- All Menu Sections -->
          <div>
            <p class={cn(classes.text.labelOrange, 'mb-2')}>เมนูทั้งหมด</p>
            <div class="space-y-2">
              {#each sections as section}
                <div class={cn(
                  'rounded-xl overflow-hidden transition-all',
                  'bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-gray-800/60 dark:to-gray-900/40',
                  'border border-orange-200/50 dark:border-gray-700/50',
                  activeSection?.id === section.id && 'ring-2 ring-orange-500/50'
                )}>
                  <button
                    type="button"
                    class="flex w-full items-center gap-3 p-3 text-left"
                    on:click={() => toggleSection(section.id)}
                  >
                    <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                      <Icon icon={section.icon} class="text-xl text-orange-500 dark:text-orange-400" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2">
                        <span class={cn(classes.text.body, 'font-semibold truncate')}>{section.title}</span>
                        <span class={cn(classes.text.caption, 'flex-shrink-0')}>{section.items.length}</span>
                      </div>
                      <p class={cn(classes.text.caption, 'truncate opacity-80')}>{section.description}</p>
                    </div>
                    <Icon
                      icon="ph:caret-down-duotone"
                      class={cn(
                        'text-lg text-orange-500 dark:text-orange-400 transition-transform flex-shrink-0',
                        expandedSectionId === section.id && 'rotate-180'
                      )}
                    />
                  </button>
                  {#if expandedSectionId === section.id}
                    <div
                      class="bg-orange-100/50 dark:bg-black/40 px-2 py-2 space-y-0.5"
                      transition:slide={{ duration: 300, easing: quintOut }}
                    >
                      {#each section.items as item}
                        <button
                          class={cn(
                            'w-full text-left px-3 py-2.5 text-sm rounded-md',
                            'flex items-center justify-between gap-2',
                            activeItem?.id === item.id
                              ? cn(classes.button.primary, '!py-2.5 !justify-start')
                              : 'text-gray-700 dark:text-gray-300 hover:!text-gray-700 dark:hover:!text-gray-300 hover:bg-orange-200/50 dark:hover:bg-gray-700/50 transition-colors'
                          )}
                          on:click={() => handleSelectItem(section, item)}
                        >
                          <span class="flex-1 truncate">{item.label}</span>
                          {#if !item.supportsEmbed}
                            <span class={cn(
                              'flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded border',
                              activeItem?.id === item.id
                                ? 'bg-white/20 text-white border-white/30'
                                : 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30'
                            )}>
                              เปิดใหม่
                            </span>
                          {/if}
                        </button>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        </div>
        
        <!-- Home Button at Bottom -->
        <div class="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-800">
          <button
            class={cn(classes.button.primary, 'w-full justify-center gap-2')}
            on:click={goToHome}
          >
            <Icon icon="ph:house-duotone" class="text-lg" />
            <span>หน้าหลัก</span>
          </button>
        </div>
      </div>
    </aside>

    <section class="flex-1 min-h-screen overflow-y-auto">
      <div class="mx-auto w-full max-w-6xl px-6 py-10 space-y-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div class="flex items-center gap-4">
            {#if portalMeta.logoUrl}
              <img src={portalMeta.logoUrl} alt="KMITL" class="h-14 w-14 object-contain drop-shadow-lg" />
            {/if}
            <div>
              <h1 class="text-2xl md:text-3xl font-semibold text-orange-500 dark:text-orange-300">
                ระบบสารสนเทศนักศึกษา
              </h1>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                สำนักทะเบียนและประมวลผล · {formatDate(clock)}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="relative group">
              <Button
                variant="secondary"
                class="shadow-sm"
                icon={theme === "dark" ? "ph:sun-duotone" : "ph:moon-duotone"}
                on:click={toggleTheme}
              >
                <span class="hidden xl:inline">{theme === "dark" ? "สว่าง" : "มืด"}</span>
              </Button>
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-sm text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
                {theme === "dark" ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
                <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900/95 dark:border-t-gray-800/95"></div>
              </div>
            </div>
            <div class="relative group">
              <Button
                variant="secondary"
                class="shadow-sm"
                icon="ph:arrow-counter-clockwise-duotone"
                on:click={switchToOriginal}
              >
                <span class="hidden xl:inline">หน้าเดิม</span>
              </Button>
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-sm text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
                กลับไปใช้หน้าเว็บเดิม
                <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900/95 dark:border-t-gray-800/95"></div>
              </div>
            </div>
            <div class="relative group">
              <div class={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2.5 font-medium shadow-sm',
                'border border-orange-200 dark:border-orange-500/30',
                'bg-white/80 dark:bg-orange-500/10',
                'text-sm text-orange-500 dark:text-orange-200'
              )}>
                <Icon icon="ph:clock-duotone" class="text-lg" />
                <span class="font-mono">{formatTime(clock)}</span>
              </div>
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-sm text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
                เวลาเซิร์ฟเวอร์
                <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900/95 dark:border-t-gray-800/95"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="rounded-3xl border border-orange-100/60 dark:border-orange-500/20 bg-white/85 dark:bg-white/5 backdrop-blur-xl shadow-xl p-6 md:p-8">
          <div class="flex items-center justify-between gap-4 mb-4">
            <div>
              <p class="text-xs uppercase text-orange-400 dark:text-orange-300">พื้นที่แสดงผล</p>
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white">
                {#if activeItem}
                  {activeItem.label}
                {:else}
                  เลือกเมนูเพื่อเริ่มใช้งาน
                {/if}
              </h4>
              {#if activeSection && activeItem}
                <p class="text-[11px] uppercase text-orange-400/80 dark:text-orange-200/80 mt-1">
                  {activeSection.title}
                </p>
              {/if}
              {#if contentModel && activeItem && contentModel.title && contentModel.title !== activeItem.label}
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{contentModel.title}</p>
              {/if}
              {#if contentModel?.subtitle}
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{contentModel.subtitle}</p>
              {/if}
            </div>
            {#if activeItem}
              <button
                class={cn(classes.button.outline)}
                on:click={openOriginal}
              >
                <Icon icon="ph:arrow-square-out-duotone" class="text-lg" />
                เปิดหน้าต้นฉบับ
              </button>
            {/if}
          </div>

          {#if loading}
            <div class="h-80 flex flex-col items-center justify-center gap-4 text-orange-500/70 dark:text-orange-200/70">
              <div class="w-14 h-14 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
              <p class="text-sm">กำลังดึงข้อมูลจากระบบ...</p>
            </div>
          {:else if error}
            <div class="rounded-2xl border border-orange-200/80 dark:border-orange-500/30 bg-orange-50/80 dark:bg-orange-500/10 px-6 py-8 text-center text-orange-600 dark:text-orange-200 space-y-3">
              <Icon icon="ph:warning-circle-duotone" class="text-3xl mx-auto" />
              <p class="text-sm md:text-base">{error}</p>
            </div>
          {:else if viewerNotice}
            <div class={cn(classes.note.info, 'text-center space-y-3 py-8')}>
              <Icon icon="ph:info-duotone" class="text-3xl mx-auto" />
              <p class={cn(classes.text.body, 'md:text-base')}>{viewerNotice}</p>
            </div>
          {:else if profile && activeItem && profileActiveItemId === activeItem.id}
            <div class="space-y-6">
              <section class={cn(
                classes.card.base,
                'px-6 py-7 shadow-xl'
              )}>
                <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div class="flex items-start gap-4">
                    <div class={cn(
                      'hidden sm:flex h-16 w-16 items-center justify-center rounded-full',
                      'bg-orange-500/10 text-orange-500 dark:text-orange-200'
                    )}>
                      <Icon icon="ph:user-duotone" class="text-2xl" />
                    </div>
                    <div class="min-w-0 space-y-1.5">
                      <p class={cn(classes.text.caption, 'uppercase text-orange-400 dark:text-orange-300')}>โปรไฟล์นักศึกษา</p>
                      <h2 class={cn(classes.text.heading1, 'leading-tight break-words')}>{profile.thaiFullName}</h2>
                      {#if hasValue(profile.englishFullName)}
                        <p class={cn(classes.text.bodySecondary, 'break-words')}>{profile.englishFullName}</p>
                      {/if}
                      {#if hasValue(profile.faculty)}
                        <p class={cn(classes.text.caption, 'break-words')}>{profile.faculty}</p>
                      {/if}
                    </div>
                  </div>
                  <div class={cn(
                    'flex flex-wrap items-center gap-2 font-semibold',
                    'text-xs text-orange-500 dark:text-orange-200'
                  )}>
                    <span class={cn(classes.badge.primary, 'rounded-full px-4 py-2 border border-orange-300/70 dark:border-orange-500/30')}>{profile.studentId}</span>
                    {#if profileStatusValue}
                      <span class={cn(classes.badge.orange, 'rounded-full px-4 py-2 border border-orange-300/60 dark:border-orange-500/30')}>{profileStatusValue}</span>
                    {/if}
                    {#if profileExpectedGradValue}
                      <span class={cn(
                        'inline-flex items-center rounded-full px-4 py-2 font-semibold text-xs border',
                        'border-orange-300/60 dark:border-orange-500/25',
                        'bg-white/80 dark:bg-orange-500/15',
                        'text-orange-500 dark:text-orange-200'
                      )}>
                        จบ {profileExpectedGradValue}
                      </span>
                    {/if}
                  </div>
                </div>
              </section>

              <section class={cn(
                'rounded-3xl overflow-hidden shadow-sm backdrop-blur-sm',
                'border border-orange-100/70 dark:border-orange-500/20',
                'bg-white/90 dark:bg-gray-900/80'
              )}>
                <div class="divide-y divide-orange-100/70 dark:divide-orange-500/20">
                  {#if profileSections.length}
                    {#each profileSections as section}
                      <div class="px-6 py-6">
                        <div class="flex items-center justify-between gap-3">
                          <h3 class={cn(classes.text.heading3, 'text-sm text-orange-500 dark:text-orange-200')}>{section.title}</h3>
                          <span class={cn(classes.text.caption, 'uppercase text-orange-400 dark:text-orange-300')}>{section.items.length} รายการ</span>
                        </div>
                        <dl class="mt-4 grid gap-x-6 gap-y-4 md:grid-cols-2">
                          {#each section.items as info}
                            <div>
                              <dt class={cn(classes.text.caption, 'uppercase')}>{info.label}</dt>
                              <dd class={cn(classes.text.body, 'mt-1 font-medium leading-relaxed break-words')}>{info.value}</dd>
                            </div>
                          {/each}
                        </dl>
                      </div>
                    {/each}
                  {/if}
                  <div class="px-6 py-6">
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p class={cn(classes.text.caption, 'uppercase text-orange-400 dark:text-orange-300')}>เลขประจำตัวประชาชน</p>
                        <p class={cn(
                          classes.text.body,
                          'mt-2 font-semibold tracking-widest text-orange-500 dark:text-orange-200'
                        )}>
                          {showNationalId ? profile.nationalId : profile.nationalIdMasked}
                        </p>
                      </div>
                      <button
                        class={cn(classes.button.outline)}
                        on:click={() => (showNationalId = !showNationalId)}
                      >
                        <Icon icon={showNationalId ? "ph:eye-closed-duotone" : "ph:eye-duotone"} class="text-sm" />
                        {showNationalId ? "ซ่อน" : "แสดง"}
                      </button>
                    </div>
                    <p class="mt-3 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      ระบบจะปิดบังเลขบัตรเป็นค่าเริ่มต้นเพื่อความปลอดภัยของข้อมูลส่วนบุคคล
                    </p>
                  </div>
                  {#if hasValue(profile.advisoryMessage)}
                    <div class="px-6 py-6 bg-orange-500/5 dark:bg-orange-500/10 text-sm text-orange-600 dark:text-orange-200">
                      {profile.advisoryMessage}
                    </div>
                  {/if}
                </div>
              </section>
            </div>
          {:else if contentModel && isMinorProgramOnly(contentModel)}
            <!-- Render MinorProgramPage directly for full-width layout -->
            <MinorProgramPage sourceUrl={getMinorProgramSourceUrl(contentModel)} />
          {:else if contentModel}
            <div class="space-y-6">
              <ContentRenderer model={contentModel} />
            </div>
          {:else if contentHtml}
            <div
              class="legacy-content rounded-2xl border border-orange-100/70 dark:border-orange-500/20 bg-white/60 dark:bg-white/5 p-4 md:p-6 overflow-x-auto shadow-inner"
            >
              <div bind:this={contentHost} class="legacy-root">
                {@html contentHtml}
              </div>
            </div>
          {:else}
            <div class="space-y-8">
              <section class="rounded-3xl border border-orange-100/70 dark:border-orange-500/20 bg-gradient-to-br from-orange-100 via-white to-orange-50 dark:from-orange-500/10 dark:via-zinc-900 dark:to-zinc-900 px-6 py-8 md:px-8 md:py-10 shadow-lg">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div class="space-y-3 max-w-3xl">
                    <p class="text-xs uppercase text-orange-500 dark:text-orange-200">Welcome</p>
                    <h2 class="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
                      {#if profile?.thaiFullName}
                        ยินดีต้อนรับกลับ, {profile.thaiFullName}!
                      {:else}
                        ยินดีต้อนรับสู่ระบบสารสนเทศนักศึกษา
                      {/if}
                    </h2>
                    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
                      เลือกเมนูทางซ้ายเพื่อใช้งานบริการต่าง ๆ หรือดูข่าวสารล่าสุดจากสำนักทะเบียน
                    </p>
                    <div class="flex flex-wrap items-center gap-3">
                      {#if personalInfoItem}
                        <button
                          class={cn(classes.button.primaryRounded)}
                          on:click={() => void selectItem(personalInfoItem.section, personalInfoItem.item)}
                        >
                          <Icon icon="ph:user-duotone" class="text-base" />
                          ดูข้อมูลส่วนบุคคล
                        </button>
                      {/if}
                      <button
                        class={cn(classes.button.outline)}
                        on:click={() => {
                          const target = menuAnnouncementItems[0]?.section;
                          if (target) {
                            activeSection = target;
                            expandedSectionId = target.id;
                          }
                        }}
                      >
                        <Icon icon="ph:megaphone-duotone" class="text-base" />
                        ข่าวสารล่าสุด
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section class="space-y-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs uppercase text-orange-400 dark:text-orange-300">ประกาศ</p>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">อัปเดตล่าสุดจากสำนักทะเบียน</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">เลือกหัวข้อเพื่อเปิดดูรายละเอียดจากแหล่งข้อมูลต้นฉบับ</p>
                  </div>
                </div>
                {#if homeAnnouncementEntries.length > 0}
                  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {#each homeAnnouncementEntries as entry (entry.kind === "menu" ? entry.item.id : entry.announcement.id)}
                      {#if entry.kind === "menu"}
                        <div class="rounded-2xl border border-orange-100/70 dark:border-orange-500/20 bg-white/70 dark:bg-orange-500/10 p-5 flex flex-col gap-3 shadow-sm">
                          <div class="space-y-1">
                            <p class="text-xs uppercase text-orange-400 dark:text-orange-300">{entry.section.title}</p>
                            <h4 class="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">{entry.item.label}</h4>
                          </div>
                          <div class="mt-auto flex items-center gap-2 flex-wrap">
                            <button
                              class={cn(classes.button.primaryRounded, 'px-4 py-2 text-xs')}
                              on:click={() => void selectItem(entry.section, entry.item)}
                            >
                              <Icon icon="ph:arrow-right-duotone" class="text-sm" />
                              เปิดดูในหน้านี้
                            </button>
                            {#if !entry.item.supportsEmbed}
                              <button
                                class={cn(classes.button.outline, 'px-4 py-2 text-xs')}
                                on:click={() => window.open(entry.item.absoluteUrl, "_blank", "noopener")}
                              >
                                <Icon icon="ph:arrow-square-out-duotone" class="text-sm" />
                                เปิดต้นฉบับ
                              </button>
                            {/if}
                          </div>
                        </div>
                      {:else}
                        <div class={getProfileAnnouncementClasses(entry.announcement.variant)}>
                          <div class={`space-y-1 ${entry.announcement.variant === "empty" ? "text-center" : ""}`}>
                            <p class="text-xs uppercase text-orange-400 dark:text-orange-300">
                              {resolveProfileAnnouncementSource(entry.announcement.source)}
                            </p>
                            <h4 class="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
                              {entry.announcement.title}
                            </h4>
                            {#if entry.announcement.description}
                              <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                {entry.announcement.description}
                              </p>
                            {/if}
                          </div>
                          {#if entry.announcement.variant !== "empty"}
                            <div class="mt-auto flex items-center gap-2 flex-wrap">
                              {#if entry.announcement.href}
                                <button
                                  class={cn(classes.button.outline, 'px-4 py-2 text-xs')}
                                  on:click={() => {
                                    const href = entry.announcement.href;
                                    if (href) window.open(href, "_blank", "noopener");
                                  }}
                                >
                                  <Icon icon="ph:arrow-square-out-duotone" class="text-sm" />
                                  เปิดต้นฉบับ
                                </button>
                              {/if}
                              {#if personalInfoItem}
                                <button
                                  class={cn(classes.button.primaryRounded, 'px-4 py-2 text-xs')}
                                  on:click={() => void selectItem(personalInfoItem.section, personalInfoItem.item)}
                                >
                                  <Icon icon="ph:user-circle-duotone" class="text-sm" />
                                  เปิดข้อมูลส่วนตัว
                                </button>
                              {/if}
                            </div>
                          {/if}
                        </div>
                      {/if}
                    {/each}
                  </div>
                {:else}
                  <div class="rounded-2xl border border-dashed border-orange-200 dark:border-orange-500/30 bg-orange-50/70 dark:bg-orange-500/10 px-6 py-10 text-center text-sm text-orange-500 dark:text-orange-200">
                    ยังไม่มีประกาศที่พร้อมแสดงในขณะนี้
                  </div>
                {/if}
              </section>
            </div>
          {/if}
        </div>
      </div>
    </section>
  </div>
</main>

<ConfirmModal
  isOpen={showConfirmModal}
  title={pendingItem?.label || ""}
  url={pendingItem?.absoluteUrl || ""}
  onConfirm={handleConfirmModal}
  onCancel={handleCancelModal}
/>

<svelte:window on:keydown={(event) => {
  if (event.key === "Escape" && activeItem && activeItem.openInNewTab) {
    error = null;
  }
}} />

<style lang="postcss">
  /* Hide Scrollbar but keep functionality */
  .sidebar-scroll {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }

  .sidebar-scroll::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  :global(.legacy-content) {
    @apply text-sm leading-relaxed text-gray-700 dark:text-white;
  }

  :global(.legacy-content > :not([hidden]) ~ :not([hidden])) {
    margin-top: 1rem;
  }

  :global(.legacy-content table) {
    @apply w-full border-collapse overflow-hidden rounded-2xl shadow-sm bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm;
  }

  :global(.legacy-content thead) {
    @apply bg-orange-100/90 dark:bg-orange-500/20 text-orange-600 dark:text-orange-200;
  }

  :global(.legacy-content th) {
    @apply px-3 py-2 text-left text-sm font-semibold border border-orange-200/60 dark:border-orange-500/20;
  }

  :global(.legacy-content td) {
    @apply px-3 py-2 align-top border border-orange-100/60 dark:border-orange-500/20 text-sm;
  }

  :global(.legacy-content tr:nth-child(even)) {
    @apply bg-orange-50/60 dark:bg-orange-500/10;
  }

  :global(.legacy-content button),
  :global(.legacy-content input[type="submit"]),
  :global(.legacy-content input[type="button"]) {
    @apply rounded-full bg-orange-500/90 backdrop-blur-sm text-white px-4 py-1.5 text-sm font-medium hover:bg-orange-400/90 transition-all shadow-md shadow-orange-500/25;
    border: none;
  }

  :global(.legacy-content input),
  :global(.legacy-content select),
  :global(.legacy-content textarea) {
    @apply w-full rounded-xl border border-orange-200/60 dark:border-orange-500/20 bg-white/90 dark:bg-gray-900/70 backdrop-blur-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/60;
  }

  :global(.legacy-content a) {
    @apply text-orange-500 hover:text-orange-600 underline underline-offset-4;
  }

  :global(.legacy-content iframe) {
    @apply w-full rounded-2xl border border-orange-100/80 dark:border-orange-500/20;
    min-height: 480px;
  }

  :global(.legacy-root > :not([hidden]) ~ :not([hidden])) {
    margin-top: 1rem;
  }
</style>
