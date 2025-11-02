<script lang="ts">
  import { onMount } from "svelte";
  import { DesignTokens } from "../libs/styles/design-tokens";
  import Badge from "../libs/components/common/Badge.svelte";
  import Button from "../libs/components/common/Button.svelte";
  import Card from "../libs/components/common/Card.svelte";
  import Text from "../libs/components/common/Text.svelte";
  import Loading from "../libs/components/common/Loading.svelte";

  interface ExamItem {
    no: number;
    courseCode: string;
    courseName: string;
    section: string;
    credit: string;
    type: string; // ทฤษฎี/ปฏิบัติ
    date: string;
    time: string;
    location: string;
    seatUrl?: string;
  }

  interface ExamGroup {
    date: string;
    dayName: string;
    items: ExamItem[];
  }

  // State
  let loading = true;
  let error = "";
  let examType: "M" | "F" = "M"; // M = Midterm, F = Final
  let examItems: ExamItem[] = [];
  let groupedExams: ExamGroup[] = [];
  
  // Student info (will be parsed from HTML)
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

        const courseCode = (cells[2] as HTMLTableCellElement)?.textContent?.trim() || "";
        const courseName = (cells[4] as HTMLTableCellElement)?.textContent?.trim() || "";
        const section = (cells[6] as HTMLTableCellElement)?.textContent?.trim() || "";
        const credit = (cells[8] as HTMLTableCellElement)?.textContent?.trim() || "";
        const type = (cells[10] as HTMLTableCellElement)?.textContent?.trim() || "";
        const date = (cells[12] as HTMLTableCellElement)?.textContent?.trim() || "";
        const time = (cells[14] as HTMLTableCellElement)?.textContent?.trim() || "";
        
        // Parse location from cell 16 (may contain link or text)
        let location = "";
        let seatUrl = "";
        const locationCell = cells[16] as HTMLTableCellElement;
        if (locationCell) {
          const link = locationCell.querySelector("a") as HTMLAnchorElement;
          if (link) {
            location = link.textContent?.trim() || "";
            seatUrl = link.href;
          } else {
            location = locationCell.textContent?.trim() || "";
          }
        }

        parsedItems.push({
          no: parseInt(noText),
          courseCode,
          courseName,
          section,
          credit,
          type,
          date,
          time,
          location,
          seatUrl,
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

    examItems.forEach((item) => {
      if (!item.date || item.date === " ") {
        // Items without specific date go to "อื่นๆ" group
        const key = "อื่นๆ";
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(item);
      } else {
        if (!groups.has(item.date)) groups.set(item.date, []);
        groups.get(item.date)!.push(item);
      }
    });

    groupedExams = Array.from(groups.entries()).map(([date, items]) => ({
      date,
      dayName: getDayName(date),
      items: items.sort((a, b) => a.no - b.no),
    }));

    // Sort by date (but keep "อื่นๆ" at the end)
    groupedExams.sort((a, b) => {
      if (a.date === "อื่นๆ") return 1;
      if (b.date === "อื่นๆ") return -1;
      return a.date.localeCompare(b.date);
    });
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
    examType = examType === "M" ? "F" : "M";
    
    // Reload page with new exam type
    const url = new URL(window.location.href);
    url.searchParams.set("mid_or_final", examType);
    window.location.href = url.toString();
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
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
  <!-- Header -->
  <div class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">ตารางสอบส่วนบุคคล</h1>
          <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
            <span><strong>รหัส:</strong> {studentId}</span>
            <span><strong>ชื่อ:</strong> {studentName}</span>
          </div>
          <div class="mt-1 text-sm text-gray-600">
            <strong>ภาคเรียน:</strong> {semester}/{year}
          </div>
        </div>

        <div class="flex items-center gap-3">
          <Button
            variant={examType === "M" ? "primary" : "secondary"}
            on:click={toggleExamType}
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {getExamTypeLabel()}
          </Button>

          <Button
            variant="ghost"
            on:click={() => window.location.reload()}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if loading}
      <div class="flex items-center justify-center py-20">
        <Loading />
      </div>
    {:else if error}
      <Card>
        <div class="text-center py-8">
          <div class="text-red-600 mb-2">
            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <Text variant="body" class="text-gray-600">{error}</Text>
        </div>
      </Card>
    {:else if examItems.length === 0}
      <Card>
        <div class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <Text variant="heading3" class="text-gray-700 mb-2">ไม่มีตารางสอบ</Text>
          <Text variant="body" class="text-gray-500">ยังไม่มีกำหนดการสอบในภาคเรียนนี้</Text>
        </div>
      </Card>
    {:else}
      <!-- Summary Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <div class="text-center">
            <div class="text-3xl font-bold text-orange-600">{examItems.length}</div>
            <div class="text-sm text-gray-600 mt-1">วิชาทั้งหมด</div>
          </div>
        </Card>
        <Card>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{groupedExams.filter(g => g.date !== "อื่นๆ").length}</div>
            <div class="text-sm text-gray-600 mt-1">วันสอบ</div>
          </div>
        </Card>
        <Card>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">
              {examItems.filter(item => item.seatUrl).length}
            </div>
            <div class="text-sm text-gray-600 mt-1">มีข้อมูลที่นั่งสอบ</div>
          </div>
        </Card>
      </div>

      <!-- Exam Groups by Date -->
      <div class="space-y-8">
        {#each groupedExams as group}
          <div>
            <!-- Date Header -->
            <div class="flex items-center gap-4 mb-4">
              <div class="flex-shrink-0">
                <div class={`
                  w-16 h-16 rounded-xl flex flex-col items-center justify-center
                  ${group.date === "อื่นๆ" ? "bg-gray-100" : "bg-gradient-to-br from-orange-500 to-pink-500"}
                  shadow-lg
                `}>
                  {#if group.date === "อื่นๆ"}
                    <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  {:else}
                    <div class="text-white text-center">
                      <div class="text-xs font-medium opacity-90">
                        {group.date.split(" ")[0]}
                      </div>
                      <div class="text-lg font-bold">
                        {group.date.split(" ")[1]}
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
              <div class="flex-1">
                <h2 class="text-xl font-bold text-gray-900">
                  {group.date === "อื่นๆ" ? "อื่นๆ / สอบในช่วงปลายภาค" : group.date}
                </h2>
                {#if group.dayName}
                  <p class="text-sm text-gray-600 mt-0.5">วัน{group.dayName}</p>
                {/if}
              </div>
              <Badge variant="default">{group.items.length} วิชา</Badge>
            </div>

            <!-- Exam Cards -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {#each group.items as exam}
                <Card interactive={!!exam.seatUrl}>
                  <div class="space-y-3">
                    <!-- Course Header -->
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <Badge variant={getTypeColor(exam.type)}>
                            {exam.type}
                          </Badge>
                          <span class="text-xs text-gray-500">Section {exam.section}</span>
                        </div>
                        <h3 class="text-sm font-semibold text-gray-900 mb-1">
                          {exam.courseCode}
                        </h3>
                        <p class="text-sm text-gray-700 line-clamp-2">
                          {exam.courseName}
                        </p>
                      </div>
                      <div class="flex-shrink-0 text-right">
                        <div class="text-xs text-gray-500">หน่วยกิต</div>
                        <div class="text-lg font-bold text-orange-600">{exam.credit}</div>
                      </div>
                    </div>

                    <!-- Exam Details -->
                    <div class="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                      <div>
                        <div class="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          เวลา
                        </div>
                        <div class="text-sm font-medium text-gray-900">
                          {exam.time || "-"}
                        </div>
                      </div>
                      <div>
                        <div class="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          สถานที่
                        </div>
                        <div class="text-sm font-medium text-gray-900">
                          {#if exam.location}
                            {#if exam.location.includes("สอบในช่วงสอบปลายภาค")}
                              <span class="text-amber-600">สอบช่วงปลายภาค</span>
                            {:else if exam.location.includes("อาคาร") || exam.location.includes("ห้อง")}
                              {exam.location.split(":")[0] || exam.location}
                            {:else}
                              {exam.location}
                            {/if}
                          {:else}
                            <span class="text-gray-400">ยังไม่ระบุ</span>
                          {/if}
                        </div>
                      </div>
                    </div>

                    <!-- Seat Info Button -->
                    {#if exam.seatUrl}
                      <div class="pt-2">
                        <Button
                          variant="secondary"
                          class="w-full"
                          on:click={() => openSeatMap(exam.seatUrl || "")}
                        >
                          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                          ดูที่นั่งสอบ
                        </Button>
                      </div>
                    {/if}
                  </div>
                </Card>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Footer -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="text-center text-sm text-gray-500">
      <p>ข้อมูลจากสำนักทะเบียนและประมวลผล สถาบันเทคโนโลยีพระจอมเกล้าคุณทหารลาดกระบัง</p>
    </div>
  </div>
</div>

<style lang="postcss">
  :global(body) {
    @apply overflow-x-hidden;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
