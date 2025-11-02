<script lang="ts">
  import { onMount } from "svelte";
  import { DesignTokens } from "../libs/styles/design-tokens";
  import Badge from "../libs/components/common/Badge.svelte";
  import Button from "../libs/components/common/Button.svelte";
  import Text from "../libs/components/common/Text.svelte";
  import Loading from "../libs/components/common/Loading.svelte";

  interface ExamItem {
    no: number;
    code: string;
    name: string;
    section: string;
    credits: string;
    type: string;
    date: string;
    time: string;
    location: string;
    seatMapUrl?: string;
  }

  interface ExamGroup {
    date: string;
    dayName: string;
    fullDate: string; // "30 ส.ค. 2568"
    daysUntil: number;
    items: ExamItem[];
  }

  // State
  let loading = true;
  let error = "";
  let examType: "M" | "F" = "M";
  let examItems: ExamItem[] = [];
  let groupedExams: ExamGroup[] = [];
  let darkMode = true;
  
  // Student info
  let studentId = "";
  let studentName = "";
  let semester = "";
  let year = "";

  onMount(() => {
    console.log("ExamSchedule component mounted");
    parseExamData();
  });

  function parseExamData() {
    console.log("parseExamData started");
    loading = true;
    error = "";

    try {
      // Get the stored HTML (same pattern as StudentTable)
      const originalHTML = (window as any).__KMITL_X_EXAM_ORIGINAL_HTML__ as string;
      
      console.log("Original HTML length:", originalHTML?.length);
      
      if (!originalHTML) {
        throw new Error("Original HTML not found");
      }
      
      // Create a temporary container to parse the HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = originalHTML;
      
      console.log("Temp div created, parsing form inputs...");
      
      // Parse student info from form inputs
      const studentIdInput = tempDiv.querySelector<HTMLInputElement>("#student_id");
      const yearInput = tempDiv.querySelector<HTMLInputElement>("#year");
      const semesterInput = tempDiv.querySelector<HTMLInputElement>("#semester");
      const examTypeSelect = tempDiv.querySelector<HTMLSelectElement>("#mid_or_final");
      
      if (studentIdInput) studentId = studentIdInput.value;
      if (yearInput) year = yearInput.value;
      if (semesterInput) semester = semesterInput.value;
      if (examTypeSelect) examType = examTypeSelect.value as "M" | "F";
      
      console.log("Parsed values:", { studentId, year, semester, examType });

      // Parse student name from header
      const headerText = tempDiv.textContent || "";
      const nameMatch = headerText.match(/ชื่อ[:\s]*([^\n]+)/);
      if (nameMatch) studentName = nameMatch[1].trim();
      
      console.log("Parsed student name:", studentName);

      // Parse exam table rows
      const rows = Array.from(tempDiv.querySelectorAll("table tr"));
      const parsedItems: ExamItem[] = [];

      rows.forEach((row) => {
        const cells = Array.from((row as HTMLTableRowElement).cells);
        
        // Skip if not a data row (check if first cell is a number)
        if (cells.length < 17) return;
        
        const noText = (cells[0] as HTMLTableCellElement)?.textContent?.trim() || "";
        if (!/^\d+$/.test(noText)) return;

        const code = (cells[2] as HTMLTableCellElement)?.textContent?.trim() || "";
        const name = (cells[4] as HTMLTableCellElement)?.textContent?.trim() || "";
        const section = (cells[6] as HTMLTableCellElement)?.textContent?.trim() || "";
        const credits = (cells[8] as HTMLTableCellElement)?.textContent?.trim() || "";
        const type = (cells[10] as HTMLTableCellElement)?.textContent?.trim() || "";
        const date = (cells[12] as HTMLTableCellElement)?.textContent?.trim() || "";
        const time = (cells[14] as HTMLTableCellElement)?.textContent?.trim() || "";
        
        // Parse location from cell 16 (may contain link or text)
        let location = "";
        let seatMapUrl = "";
        const locationCell = cells[16] as HTMLTableCellElement;
        if (locationCell) {
          const link = locationCell.querySelector("a") as HTMLAnchorElement;
          if (link) {
            location = link.textContent?.trim() || "";
            seatMapUrl = link.href;
          } else {
            location = locationCell.textContent?.trim() || "";
          }
        }

        parsedItems.push({
          no: parseInt(noText),
          code,
          name,
          section,
          credits,
          type,
          date,
          time,
          location,
          seatMapUrl,
        });
      });

      examItems = parsedItems;
      console.log("Parsed exam items:", examItems.length, examItems);
      
      groupExamsByDate();
      
      console.log("Grouped exams:", groupedExams);
      
      loading = false;
    } catch (err) {
      console.error("Parse error:", err);
      error = "ไม่สามารถโหลดข้อมูลตารางสอบได้";
      loading = false;
    }
  }

  function groupExamsByDate() {
    const groups = new Map<string, ExamItem[]>();
    const today = new Date();

    examItems.forEach((item) => {
      if (!item.date || item.date === " ") {
        const key = "อื่นๆ";
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(item);
      } else {
        if (!groups.has(item.date)) groups.set(item.date, []);
        groups.get(item.date)!.push(item);
      }
    });

    groupedExams = Array.from(groups.entries()).map(([date, items]) => {
      const { fullDate, daysUntil } = parseDateInfo(date, today);
      
      return {
        date,
        dayName: getDayName(date),
        fullDate,
        daysUntil,
        items: items.sort((a, b) => a.no - b.no),
      };
    });

    // Sort by days until exam (soonest first), but keep "อื่นๆ" at the end
    groupedExams.sort((a, b) => {
      if (a.date === "อื่นๆ") return 1;
      if (b.date === "อื่นๆ") return -1;
      return a.daysUntil - b.daysUntil;
    });
  }

  function parseDateInfo(dateStr: string, today: Date): { fullDate: string; daysUntil: number } {
    if (dateStr === "อื่นๆ") {
      return { fullDate: "ไม่ระบุวันที่", daysUntil: 999 };
    }

    try {
      // Parse Thai date format: "จ. 30 ส.ค. 25" or "จ. 30 ส.ค."
      const parts = dateStr.trim().split(/\s+/); // Split by whitespace
      
      if (parts.length < 3) {
        console.warn("Invalid date format:", dateStr);
        return { fullDate: dateStr, daysUntil: 999 };
      }

      const day = parseInt(parts[1]);
      const monthStr = parts[2];
      
      // Get year from parts[3] or use current year
      let fullBuddhistYear: number;
      if (parts.length >= 4 && parts[3]) {
        const yearShort = parseInt(parts[3]);
        
        // Year format is likely: "25" = ค.ศ. 2025 = พ.ศ. 2568
        // So we need to convert from Gregorian 2-digit to Buddhist full year
        if (yearShort >= 0 && yearShort <= 99) {
          // Assume yearShort is Gregorian (e.g., 25 = 2025)
          // Convert to full Gregorian year (2000 + yearShort)
          const fullGregorianYear = 2000 + yearShort;
          // Convert to Buddhist year
          fullBuddhistYear = fullGregorianYear + 543;
        } else {
          // Already full Buddhist year
          fullBuddhistYear = yearShort;
        }
      } else {
        // If no year specified, use current Buddhist year
        fullBuddhistYear = new Date().getFullYear() + 543;
      }

      // Thai month abbreviations to numbers (0-indexed for JavaScript Date)
      const monthMap: Record<string, number> = {
        "ม.ค.": 0, "ก.พ.": 1, "มี.ค.": 2, "เม.ย.": 3, "พ.ค.": 4, "มิ.ย.": 5,
        "ก.ค.": 6, "ส.ค.": 7, "ก.ย.": 8, "ต.ค.": 9, "พ.ย.": 10, "ธ.ค.": 11
      };

      const month = monthMap[monthStr];
      if (month === undefined) {
        console.warn("Unknown month:", monthStr, "in date:", dateStr);
        return { fullDate: dateStr, daysUntil: 999 };
      }

      // Create exam date (Buddhist year - 543 = Gregorian year)
      const gregorianYear = fullBuddhistYear - 543;
      const examDate = new Date(gregorianYear, month, day);
      
      // Reset time to start of day for accurate day counting
      examDate.setHours(0, 0, 0, 0);
      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);
      
      // Calculate days until exam
      const diffTime = examDate.getTime() - todayStart.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Format full date in Thai
      const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
                          "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
      const fullDate = `${day} ${thaiMonths[month]} ${fullBuddhistYear}`;

      console.log(`Parsed date: ${dateStr} -> ${fullDate} (${diffDays} days, exam: ${examDate.toISOString().split('T')[0]})`);

      return { fullDate, daysUntil: diffDays };
    } catch (err) {
      console.error("Error parsing date:", dateStr, err);
      return { fullDate: dateStr, daysUntil: 999 };
    }
  }

  function getDayName(dateStr: string): string {
    if (dateStr === "อื่นๆ") return "";
    
    // Parse Thai date format (e.g., "จ. 30 ส.ค. 25")
    const dayAbbrev = dateStr.split(" ")[0];
    const dayMap: Record<string, string> = {
      "จ.": "จันทร์",
      "อ.": "อังคาร",
      "พ.": "พุธ",
      "พฤ.": "พฤหัสบดี",
      "ศ.": "ศุกร์",
      "ส.": "เสาร์",
      "อา.": "อาทิตย์",
    };
    
    return dayMap[dayAbbrev] || "";
  }

  function toggleExamType() {
    // Change exam type
    const newType = examType === "M" ? "F" : "M";
    
    // Create and submit form (same as original RefreshEdit function)
    const form = document.createElement("form");
    form.method = "post";
    form.action = "report_examtable_show.php";
    
    // Add hidden inputs
    const yearInput = document.createElement("input");
    yearInput.type = "hidden";
    yearInput.name = "year";
    yearInput.value = year;
    form.appendChild(yearInput);
    
    const semesterInput = document.createElement("input");
    semesterInput.type = "hidden";
    semesterInput.name = "semester";
    semesterInput.value = semester;
    form.appendChild(semesterInput);
    
    const studentIdInput = document.createElement("input");
    studentIdInput.type = "hidden";
    studentIdInput.name = "student_id";
    studentIdInput.value = studentId;
    form.appendChild(studentIdInput);
    
    const examTypeInput = document.createElement("input");
    examTypeInput.type = "hidden";
    examTypeInput.name = "mid_or_final";
    examTypeInput.value = newType;
    form.appendChild(examTypeInput);
    
    // Submit form
    document.body.appendChild(form);
    form.submit();
  }

  function openSeatMap(url: string) {
    if (url) {
      window.open(url, "_blank");
    }
  }

  function getExamTypeLabel(): string {
    return examType === "M" ? "สอบกลางภาค" : "สอบปลายภาค";
  }

  function getTypeColor(type: string): "info" | "success" | "default" {
    if (type.includes("ทฤษฎี")) return "info";
    if (type.includes("ปฏิบัติ")) return "success";
    return "default";
  }

  function toggleDarkMode() {
    darkMode = !darkMode;
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  function showOriginal() {
    // Restore original HTML
    const originalHTML = (window as any).__KMITL_X_EXAM_ORIGINAL_HTML__ as string;
    if (originalHTML) {
      document.body.innerHTML = originalHTML;
      document.body.style.display = "";
      
      // Add "NEW VERSION" button at the bottom left
      const buttonContainer = document.createElement("div");
      buttonContainer.style.cssText = "position: fixed; bottom: 20px; left: 20px; z-index: 9999;";
      
      const newVersionButton = document.createElement("button");
      newVersionButton.textContent = "NEW VERSION";
      newVersionButton.style.cssText = `
        padding: 8px 16px;
        background: #f97316;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.2s;
      `;
      
      newVersionButton.onmouseover = () => {
        newVersionButton.style.background = "#ea580c";
        newVersionButton.style.transform = "scale(1.05)";
      };
      
      newVersionButton.onmouseout = () => {
        newVersionButton.style.background = "#f97316";
        newVersionButton.style.transform = "scale(1)";
      };
      
      newVersionButton.onclick = () => {
        window.location.reload();
      };
      
      buttonContainer.appendChild(newVersionButton);
      document.body.appendChild(buttonContainer);
    }
  }

  function getDaysText(days: number): string {
    if (days >= 999) return "ไม่ระบุวันที่";
    if (days < 0) return "สอบไปแล้ว";
    if (days === 0) return "สอบวันนี้!";
    if (days === 1) return "สอบพรุ่งนี้";
    return `อีก ${days} วัน`;
  }

  function getDaysColor(days: number): string {
    if (days >= 999) return "text-gray-500";
    if (days < 0) return "text-gray-400";
    if (days === 0) return "text-red-500";
    if (days === 1) return "text-orange-500";
    if (days <= 3) return "text-yellow-500";
    if (days <= 7) return "text-blue-500";
    return "text-green-500";
  }
</script>

<div class="{darkMode ? 'dark' : ''} min-h-screen">
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Header with Sticky Navigation -->
    <div class="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between gap-4">
          <!-- Left: Title & Student Info -->
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white">ตารางสอบส่วนบุคคล</h1>
                <p class="text-sm text-gray-600 dark:text-gray-400">ภาคเรียน {semester}/{year}</p>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
              <span><strong class="text-gray-900 dark:text-white">{studentId}</strong></span>
              <span>{studentName}</span>
            </div>
          </div>

          <!-- Right: Actions -->
          <div class="flex items-center gap-2">
            <!-- Exam Type Toggle -->
            <Button
              variant={examType === "M" ? "primary" : "secondary"}
              on:click={toggleExamType}
              class="hidden sm:flex"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {getExamTypeLabel()}
            </Button>

            <!-- Dark Mode Toggle (Portal Style) -->
            <Button
              variant="secondary"
              class="shadow-sm"
              icon={darkMode ? "ph:sun-duotone" : "ph:moon-duotone"}
              on:click={toggleDarkMode}
            >
              <span class="hidden xl:inline">{darkMode ? "สว่าง" : "มืด"}</span>
            </Button>

            <!-- Original View Button (Portal Style) -->
            <Button
              variant="secondary"
              class="shadow-sm"
              icon="ph:arrow-counter-clockwise-duotone"
              on:click={showOriginal}
            >
              <span class="hidden xl:inline">หน้าเดิม</span>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {#if loading}
        <div class="flex flex-col items-center justify-center py-20">
          <Loading />
          <p class="mt-4 text-gray-600 dark:text-gray-400">กำลังโหลดตารางสอบ...</p>
        </div>
      {:else if error}
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <svg class="w-12 h-12 mx-auto text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-red-700 dark:text-red-300">{error}</p>
        </div>
      {:else if examItems.length === 0}
        <div class="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">ไม่มีตารางสอบ</h3>
          <p class="text-gray-600 dark:text-gray-400">ยังไม่มีกำหนดการสอบในภาคเรียนนี้</p>
        </div>
      {:else}
        <!-- Calendar View -->
        <div class="space-y-6">
          {#each groupedExams as group}
            <!-- Date Card (Calendar Style) -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl">
              <!-- Date Header -->
              <div class="bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <!-- Large Date Display -->
                    <div class="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[80px]">
                      <div class="text-3xl font-bold text-white leading-none mb-1">
                        {group.date.split(" ")[1]}
                      </div>
                      <div class="text-xs text-white/90 font-medium uppercase">
                        {group.dayName}
                      </div>
                    </div>
                    
                    <!-- Full Date -->
                    <div class="text-white">
                      <div class="text-sm opacity-90 mb-1">วันที่</div>
                      <div class="text-lg font-semibold">{group.fullDate}</div>
                    </div>
                  </div>
                  
                  <!-- Countdown Badge -->
                  <div class="bg-white rounded-full px-4 py-2 shadow-lg">
                    <span class="{getDaysColor(group.daysUntil)} text-sm font-bold">
                      {getDaysText(group.daysUntil)}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Exam Cards for this Date -->
              <div class="p-6 space-y-4">
                {#each group.items as exam}
                  <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md transition-all duration-200">
                    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <!-- Left: Course Info -->
                      <div class="flex-1">
                        <div class="flex items-start gap-3 mb-3">
                          <div class="bg-orange-500 text-white rounded-lg px-3 py-1 text-sm font-bold shadow-sm">
                            {exam.code}
                          </div>
                          <div class="flex-1">
                            <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">
                              {exam.name}
                            </h3>
                            <div class="flex flex-wrap gap-2">
                              <Badge variant="info">Sec {exam.section}</Badge>
                              <Badge variant="default">{exam.credits} หน่วยกิต</Badge>
                              <Badge variant={getTypeColor(exam.type)}>{exam.type}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Right: Time & Location -->
                      <div class="md:text-right space-y-2 md:min-w-[200px]">
                        <!-- Time -->
                        <div class="flex items-center md:justify-end gap-2">
                          <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span class="text-lg font-bold text-gray-900 dark:text-white">
                            {exam.time}
                          </span>
                        </div>

                        <!-- Location -->
                        {#if exam.location}
                          <div class="flex items-center md:justify-end gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{exam.location}</span>
                          </div>
                        {/if}

                        <!-- Seat Map Button -->
                        {#if exam.seatMapUrl}
                          <button
                            on:click={() => openSeatMap(exam.seatMapUrl || "")}
                            class="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            แผนผังที่นั่ง
                          </button>
                        {/if}
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Footer -->
    <div class="border-t border-gray-200 dark:border-gray-700 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          KMITL-X Extension • ตารางสอบส่วนบุคคล
        </p>
      </div>
    </div>
  </div>
</div>
