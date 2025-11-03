<script lang="ts">
  import { onMount } from "svelte";
  import { slide, fade } from "svelte/transition";
  import { DesignTokens } from "../libs/styles/design-tokens";
  import Badge from "../libs/components/common/Badge.svelte";
  import Button from "../libs/components/common/Button.svelte";
  import Text from "../libs/components/common/Text.svelte";
  import Loading from "../libs/components/common/Loading.svelte";

  interface ExamLocation {
    building: string;  // Building
    room: string;      // Room
    seatNo: string;    // Seat number
    raw: string;       // Raw data (keep for special formats)
  }

  interface ExamItem {
    no: number;
    code: string;
    name: string;
    section: string;
    credits: string;
    type: string;
    date: string;
    time: string;
    location: ExamLocation;
    seatMapUrl?: string;
  }

  interface ExamGroup {
    date: string;
    dayName: string;
    fullDate: string;
    daysUntil: number;
    items: ExamItem[];
  }

  interface CalendarDay {
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    exams: ExamItem[];
    daysUntil: number;
    fullDate: string;
  }

  // State
  let loading = true;
  let error = "";
  let examType: "M" | "F" = "M";
  let examItems: ExamItem[] = [];
  let groupedExams: ExamGroup[] = [];
  let theme = "dark";
  let selectedExam: ExamItem | null = null;
  let showExamDetail = false;
  
  // Calendar state
  let currentMonth: Date = new Date();
  let calendarDays: CalendarDay[] = [];
  
  // Student info
  let studentId = "";
  let studentName = "";
  let semester = "";
  let year = "";

  // Helper function to parse location string
  function parseLocation(locationStr: string): ExamLocation {
    // Format: "building:room:seat_number"
    // Example: "30:3042:001" or "E12:802:D1" or "Not specified" or "-"
    
    if (!locationStr || locationStr === "-" || locationStr === "ไม่ระบุ") {
      return {
        building: "",
        room: "",
        seatNo: "",
        raw: locationStr || ""
      };
    }

    // Check if it's special text (examination info, not location format)
    const isSpecialText = locationStr.includes('สอบ') || 
                          locationStr.includes('Examination') || 
                          locationStr.includes('ปลายภาค') ||
                          locationStr.includes('final exam') ||
                          locationStr.length > 50 || // Very long text
                          !locationStr.includes(':'); // No colon separator

    if (isSpecialText) {
      return {
        building: "",
        room: "",
        seatNo: "",
        raw: locationStr
      };
    }

    // Parse colon-separated format
    const parts = locationStr.split(":");
    
    if (parts.length >= 3) {
      // Full format: building:room:seat
      return {
        building: parts[0].trim(),
        room: parts[1].trim(),
        seatNo: parts[2].trim(),
        raw: locationStr
      };
    } else if (parts.length === 2) {
      // Partial format: building:room (no seat number)
      return {
        building: parts[0].trim(),
        room: parts[1].trim(),
        seatNo: "",
        raw: locationStr
      };
    } else {
      // Single part or unknown format
      return {
        building: "",
        room: "",
        seatNo: "",
        raw: locationStr
      };
    }
  }

  onMount(() => {
    // Initialize theme from localStorage
    const storedTheme = localStorage.getItem("theme") || "dark";
    theme = storedTheme;
    applyTheme(theme);
    
    parseExamData();
  });

  function parseExamData() {
    loading = true;
    loading = true;
    error = "";

    try {
      // Get the stored HTML (same pattern as StudentTable)
      const originalHTML = (window as any).__KMITL_X_EXAM_ORIGINAL_HTML__ as string;
      
      if (!originalHTML) {
        throw new Error("Original HTML not found");
      }
      
      // Create a temporary container to parse the HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = originalHTML;
      
      // Parse student info from form inputs
      const studentIdInput = tempDiv.querySelector<HTMLInputElement>("#student_id");
      const yearInput = tempDiv.querySelector<HTMLInputElement>("#year");
      const semesterInput = tempDiv.querySelector<HTMLInputElement>("#semester");
      const examTypeSelect = tempDiv.querySelector<HTMLSelectElement>("#mid_or_final");
      
      if (studentIdInput) studentId = studentIdInput.value;
      if (yearInput) year = yearInput.value;
      if (semesterInput) semester = semesterInput.value;
      if (examTypeSelect) examType = examTypeSelect.value as "M" | "F";

      // Parse student name from header
      const headerText = tempDiv.textContent || "";
      const nameMatch = headerText.match(/ชื่อ[:\s]*([^\n]+)/);
      if (nameMatch) studentName = nameMatch[1].trim();

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
        let locationStr = "";
        let seatMapUrl = "";
        const locationCell = cells[16] as HTMLTableCellElement;
        if (locationCell) {
          const link = locationCell.querySelector("a") as HTMLAnchorElement;
          if (link) {
            locationStr = link.textContent?.trim() || "";
            seatMapUrl = link.href;
          } else {
            locationStr = locationCell.textContent?.trim() || "";
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
          location: parseLocation(locationStr),
          seatMapUrl,
        });
      });

      examItems = parsedItems;
      
      groupExamsByDate();
      
      loading = false;
    } catch (err) {
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

    // Sort by days until exam (soonest first), but keep "Others" at the end
    groupedExams.sort((a, b) => {
      if (a.date === "อื่นๆ") return 1;
      if (b.date === "อื่นๆ") return -1;
      return a.daysUntil - b.daysUntil;
    });
    
    // Build calendar after grouping
    buildCalendar();
  }

  function buildCalendar() {
    // Find the month that contains most exams
    const examDates = examItems
      .map(item => {
        const { fullDate, daysUntil } = parseDateInfo(item.date, new Date());
        if (daysUntil === 999) return null;
        
        try {
          const parts = item.date.trim().split(/\s+/);
          if (parts.length < 3) return null;
          
          const day = parseInt(parts[1]);
          const monthStr = parts[2];
          const monthMap: Record<string, number> = {
            "ม.ค.": 0, "ก.พ.": 1, "มี.ค.": 2, "เม.ย.": 3, "พ.ค.": 4, "มิ.ย.": 5,
            "ก.ค.": 6, "ส.ค.": 7, "ก.ย.": 8, "ต.ค.": 9, "พ.ย.": 10, "ธ.ค.": 11
          };
          const month = monthMap[monthStr];
          
          let fullBuddhistYear: number;
          if (parts.length >= 4 && parts[3]) {
            const yearShort = parseInt(parts[3]);
            const fullGregorianYear = 2000 + yearShort;
            fullBuddhistYear = fullGregorianYear + 543;
          } else {
            fullBuddhistYear = new Date().getFullYear() + 543;
          }
          
          const gregorianYear = fullBuddhistYear - 543;
          return new Date(gregorianYear, month, day);
        } catch {
          return null;
        }
      })
      .filter(d => d !== null) as Date[];
    
    if (examDates.length > 0) {
      // Use the first exam's month
      currentMonth = new Date(examDates[0].getFullYear(), examDates[0].getMonth(), 1);
    }
    
    generateCalendarDays();
  }

  function generateCalendarDays() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from Sunday of the week containing the 1st
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // End on Saturday of the week containing the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days: CalendarDay[] = [];
    const current = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    while (current <= endDate) {
      const isCurrentMonth = current.getMonth() === month;
      
      // Check if this is today
      const isToday = (
        current.getDate() === today.getDate() &&
        current.getMonth() === today.getMonth() &&
        current.getFullYear() === today.getFullYear()
      );
      
      const dayExams = examItems.filter(exam => {
        const examDate = parseExamDateToDate(exam.date);
        if (!examDate) return false;
        
        return (
          examDate.getDate() === current.getDate() &&
          examDate.getMonth() === current.getMonth() &&
          examDate.getFullYear() === current.getFullYear()
        );
      });
      
      const diffTime = current.getTime() - today.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
                          "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
      const fullDate = `${current.getDate()} ${thaiMonths[current.getMonth()]} ${current.getFullYear() + 543}`;
      
      days.push({
        day: current.getDate(),
        isCurrentMonth,
        isToday,
        exams: dayExams,
        daysUntil,
        fullDate
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    calendarDays = days;
  }

  function parseExamDateToDate(dateStr: string): Date | null {
    try {
      const parts = dateStr.trim().split(/\s+/);
      if (parts.length < 3) return null;
      
      const day = parseInt(parts[1]);
      const monthStr = parts[2];
      const monthMap: Record<string, number> = {
        "ม.ค.": 0, "ก.พ.": 1, "มี.ค.": 2, "เม.ย.": 3, "พ.ค.": 4, "มิ.ย.": 5,
        "ก.ค.": 6, "ส.ค.": 7, "ก.ย.": 8, "ต.ค.": 9, "พ.ย.": 10, "ธ.ค.": 11
      };
      const month = monthMap[monthStr];
      if (month === undefined) return null;
      
      let fullBuddhistYear: number;
      if (parts.length >= 4 && parts[3]) {
        const yearShort = parseInt(parts[3]);
        const fullGregorianYear = 2000 + yearShort;
        fullBuddhistYear = fullGregorianYear + 543;
      } else {
        fullBuddhistYear = new Date().getFullYear() + 543;
      }
      
      const gregorianYear = fullBuddhistYear - 543;
      return new Date(gregorianYear, month, day);
    } catch {
      return null;
    }
  }

  function parseDateInfo(dateStr: string, today: Date): { fullDate: string; daysUntil: number } {
    // Handle special cases first
    if (!dateStr || dateStr.trim() === "") {
      return { fullDate: "ไม่ระบุวันที่", daysUntil: 999 };
    }
    
    if (dateStr === "อื่นๆ" || dateStr === "จัดสอบเอง" || dateStr.includes("จัดสอบเอง")) {
      return { fullDate: "จัดสอบเอง", daysUntil: 999 };
    }

    try {
      // Parse Thai date format: "Mon. 30 Aug. 25" or "Mon. 30 Aug."
      const parts = dateStr.trim().split(/\s+/); // Split by whitespace
      
      if (parts.length < 3) {
        return { fullDate: dateStr, daysUntil: 999 };
      }

      const day = parseInt(parts[1]);
      const monthStr = parts[2];
      
      // Get year from parts[3] or use current year
      let fullBuddhistYear: number;
      if (parts.length >= 4 && parts[3]) {
        const yearShort = parseInt(parts[3]);
        
        // Year format is likely: "25" = CE 2025 = BE 2568
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

      return { fullDate, daysUntil: diffDays };
    } catch (err) {
      return { fullDate: dateStr, daysUntil: 999 };
    }
  }

  function getDayName(dateStr: string): string {
    if (!dateStr || dateStr === "อื่นๆ" || dateStr === "จัดสอบเอง" || dateStr.includes("จัดสอบเอง")) {
      return "";
    }
    
    // Parse Thai date format (e.g., "Mon. 30 Aug. 25")
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

  function viewExamDetail(exam: ExamItem) {
    selectedExam = exam;
    showExamDetail = true;
  }

  function closeExamDetail() {
    showExamDetail = false;
    setTimeout(() => selectedExam = null, 300);
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

  function changeMonth(direction: number) {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1);
    generateCalendarDays();
  }

  // Helper function to format location for display
  function formatLocation(location: ExamLocation): string {
    if (!location.building && !location.room && !location.seatNo) {
      return location.raw || "-";
    }

    const parts: string[] = [];
    if (location.building) parts.push(`อาคาร ${location.building}`);
    if (location.room) parts.push(`ห้อง ${location.room}`);
    if (location.seatNo) parts.push(`ที่นั่ง ${location.seatNo}`);
    
    return parts.length > 0 ? parts.join(" · ") : "-";
  }

  // Helper function to get short location (for compact display)
  function formatLocationShort(location: ExamLocation): string {
    if (!location.building && !location.room) {
      return location.raw || "-";
    }

    const parts: string[] = [];
    if (location.building) parts.push(location.building);
    if (location.room) parts.push(location.room);
    
    return parts.length > 0 ? parts.join(":") : "-";
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

<!-- Add Prompt font -->
<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      font-family: 'Prompt', sans-serif !important;
    }
  </style>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
    <!-- Header -->
    <div class="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200/40 dark:border-gray-700/50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between gap-4">
          <!-- Left: Student Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-1">
              <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h1 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  ตารางสอบส่วนบุคคล
                </h1>
                <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {studentId} · {studentName} · ภาคเรียน {semester}/{year}
                </p>
              </div>
            </div>
          </div>

          <!-- Right: Actions -->
          <div class="flex items-center gap-2">
            <Button
              variant="secondary"
              on:click={toggleExamType}
              class="hidden sm:flex text-sm"
            >
              {examType === "M" ? "ดูปลายภาค" : "ดูกลางภาค"}
            </Button>

            <Button
              variant="secondary"
              class="shadow-sm"
              icon={theme === "dark" ? "ph:sun-duotone" : "ph:moon-duotone"}
              on:click={toggleTheme}
            >
              <span class="hidden xl:inline text-sm">{theme === "dark" ? "สว่าง" : "มืด"}</span>
            </Button>

            <Button
              variant="secondary"
              class="shadow-sm"
              icon="ph:arrow-counter-clockwise-duotone"
              on:click={showOriginal}
            >
              <span class="hidden xl:inline text-sm">หน้าเดิม</span>
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
        <div class="bg-red-50/90 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center backdrop-blur-sm">
          <svg class="w-12 h-12 mx-auto text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-red-700 dark:text-red-300">{error}</p>
        </div>
      {:else if examItems.length === 0}
        <div class="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-12 text-center border border-gray-200/60 dark:border-gray-700/50 backdrop-blur-sm">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">ไม่มีตารางสอบ</h3>
          <p class="text-gray-600 dark:text-gray-400">ยังไม่มีกำหนดการสอบในภาคเรียนนี้</p>
        </div>
      {:else}
        <!-- Calendar Header -->
        <div class="glass-card rounded-2xl p-4 mb-4">
          <div class="flex items-center justify-between">
            <button
              on:click={() => changeMonth(-1)}
              class="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
              aria-label="เดือนก่อนหน้า"
            >
              <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div class="text-center">
              <div class="inline-flex items-center gap-2 mb-1">
                <span class="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full">
                  ปฏิทิน{getExamTypeLabel()}
                </span>
              </div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">
                {new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(currentMonth)}
              </h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {examItems.length} วิชา
              </p>
            </div>
            
            <button
              on:click={() => changeMonth(1)}
              class="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
              aria-label="เดือนถัดไป"
            >
              <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="glass-card rounded-2xl p-3 sm:p-4">
          <!-- Day Headers -->
          <div class="grid grid-cols-7 gap-1.5 mb-2">
            {#each ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'] as day}
              <div class="text-center text-[10px] font-semibold text-gray-500 dark:text-gray-400 py-1">
                {day}
              </div>
            {/each}
          </div>

          <!-- Calendar Days -->
          <div class="grid grid-cols-7 gap-1.5">
            {#each calendarDays as calDay}
              <button
                class="
                  relative aspect-square rounded-lg p-1.5 transition-all duration-150 flex flex-col
                  {calDay.isCurrentMonth ? 'bg-white/60 dark:bg-gray-800/50' : 'bg-gray-100/40 dark:bg-gray-900/20'}
                  {calDay.isToday ? 'ring-1 ring-blue-400 dark:ring-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : ''}
                  {calDay.exams.length > 0 && !calDay.isToday ? 'ring-1 ring-orange-200 dark:ring-orange-700 hover:ring-orange-400 hover:scale-[1.02] cursor-pointer hover:bg-white/70' : ''}
                  {calDay.exams.length > 0 && calDay.isToday ? 'ring-1 ring-blue-400 hover:ring-blue-500 hover:scale-[1.02] cursor-pointer' : ''}
                  {!calDay.isCurrentMonth ? 'opacity-30' : ''}
                  hover:shadow-sm backdrop-blur-sm
                "
                on:click={() => calDay.exams.length > 0 && viewExamDetail(calDay.exams[0])}
                disabled={calDay.exams.length === 0}
              >
                <!-- Today Indicator - Minimal dot -->
                {#if calDay.isToday}
                  <div class="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                {/if}
                
                <!-- Day Number -->
                <div class="text-xs font-medium {calDay.isToday ? 'text-blue-600 dark:text-blue-400' : calDay.exams.length > 0 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-500'}">
                  {calDay.day}
                </div>

                <!-- Exam Info - Show subject name with wrap -->
                {#if calDay.exams.length > 0}
                  <div class="mt-0.5 space-y-0.5 overflow-hidden flex-1 flex flex-col justify-center">
                    {#each calDay.exams.slice(0, 1) as exam}
                      <div class="text-[9px] leading-tight text-gray-700 dark:text-gray-300 font-medium line-clamp-2">
                        {exam.name}
                      </div>
                    {/each}
                    {#if calDay.exams.length > 1}
                      <div class="text-[8px] text-orange-600 dark:text-orange-400 font-medium">
                        +{calDay.exams.length - 1} วิชา
                      </div>
                    {/if}
                  </div>
                  
                  <!-- Countdown Badge - More subtle -->
                  {#if calDay.daysUntil >= 0 && calDay.daysUntil <= 7}
                    <div class="absolute bottom-1 right-1 text-[8px] {getDaysColor(calDay.daysUntil)} font-semibold px-1 py-0.5 rounded bg-white/90 dark:bg-gray-900/90 shadow-sm">
                      {calDay.daysUntil}d
                    </div>
                  {/if}
                {/if}
              </button>
            {/each}
          </div>
        </div>

        <!-- Exam List (Below Calendar) -->
        <div class="mt-6 space-y-3">
          {#each groupedExams as group}
            {#if group.date !== "อื่นๆ"}
              <div class="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm shadow-sm">
                <div class="flex items-center gap-3 mb-3">
                  <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-100/80 dark:bg-orange-500/20 flex flex-col items-center justify-center text-orange-600 dark:text-orange-400 shadow-sm border border-orange-200/30 dark:border-orange-800/50">
                    <div class="text-lg font-bold leading-none">{group.date.split(" ")[1]}</div>
                    <div class="text-[9px] leading-none mt-0.5">{group.dayName}</div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white truncate">{group.fullDate}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{group.items.length} วิชา</p>
                  </div>
                  <div class="flex-shrink-0">
                    <span class="{getDaysColor(group.daysUntil)} text-sm font-bold">
                      {getDaysText(group.daysUntil)}
                    </span>
                  </div>
                </div>
                
                <div class="space-y-2">
                  {#each group.items as exam}
                    <button
                      on:click={() => viewExamDetail(exam)}
                      class="w-full text-left p-3 rounded-xl bg-white/70 dark:bg-gray-800/40 hover:bg-white/90 dark:hover:bg-gray-800/60 border border-gray-200/30 dark:border-gray-700/40 hover:border-orange-300/50 dark:hover:border-orange-600/40 hover:shadow-md transition-all backdrop-blur-sm"
                    >
                      <div class="flex items-center gap-3">
                        <div class="flex-shrink-0 w-16 h-16 rounded-xl bg-orange-100/70 dark:bg-orange-500/20 flex items-center justify-center border border-orange-200/30 dark:border-orange-800/50">
                          <span class="text-xs font-bold text-orange-600 dark:text-orange-400">{exam.code}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <h4 class="text-sm font-semibold text-gray-900 dark:text-white truncate mb-1">{exam.name}</h4>
                          <div class="flex flex-wrap items-center gap-2 text-xs">
                            <Badge variant="info">Sec {exam.section}</Badge>
                            <Badge variant="default">{exam.credits} หน่วยกิต</Badge>
                            <Badge variant={exam.type.includes("ทฤษฎี") ? "info" : "success"}>{exam.type}</Badge>
                          </div>
                        </div>
                        <div class="flex-shrink-0 w-36 text-right self-center">
                          <div class="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-1">{exam.time}</div>
                          {#if exam.location.building || exam.location.room || exam.location.seatNo}
                            <div class="text-[10px] text-gray-600 dark:text-gray-400 font-medium">
                              {#if exam.location.building}{exam.location.building}{/if}{#if exam.location.building && exam.location.room} · {/if}{#if exam.location.room}{exam.location.room}{/if}{#if exam.location.seatNo && (exam.location.building || exam.location.room)} · {/if}{#if exam.location.seatNo}#{exam.location.seatNo}{/if}
                            </div>
                          {:else if exam.location.raw && (exam.location.raw.includes('ปลายภาค') || exam.location.raw.includes('final exam') || exam.location.raw.includes('ในห้องสอบ') || exam.location.raw.includes('examination room'))}
                            <div class="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                              <span class="font-medium">ไม่ระบุห้องสอบ</span>
                            </div>
                          {:else if exam.location.raw}
                            <div class="text-[10px] text-gray-600 dark:text-gray-400 truncate max-w-[144px]">{exam.location.raw}</div>
                          {/if}
                        </div>
                      </div>
                    </button>
                  {/each}
                </div>
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  </div>

<!-- Exam Detail Modal -->
{#if showExamDetail && selectedExam}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    transition:fade={{ duration: 200 }}
    on:click={closeExamDetail}
    role="dialog"
    aria-modal="true"
    aria-labelledby="exam-detail-title"
    tabindex="-1"
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div
      class="bg-white/95 dark:bg-gray-800/95 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl backdrop-blur-md border border-gray-200/60 dark:border-gray-700/50"
      transition:slide={{ duration: 300 }}
      on:click|stopPropagation
      role="document"
    >
      <!-- Modal Header -->
      <div class="sticky top-0 bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-t-2xl shadow-lg">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold text-white mb-2">
              {selectedExam.code}
            </div>
            <h2 id="exam-detail-title" class="text-2xl font-bold text-white mb-1">{selectedExam.name}</h2>
            <p class="text-white/90 text-sm">Section {selectedExam.section} · {selectedExam.credits} หน่วยกิต · {selectedExam.type}</p>
          </div>
          <button
            on:click={closeExamDetail}
            class="flex-shrink-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="ปิดหน้าต่างรายละเอียดการสอบ"
          >
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal Content -->
      <div class="p-6 space-y-6">
        <!-- Date & Time -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white/60 dark:bg-gray-800/40 rounded-xl p-4 border border-gray-200/40 dark:border-gray-700/40 backdrop-blur-sm">
            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-sm font-medium">วันที่สอบ</span>
            </div>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{selectedExam.date}</p>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm font-medium">เวลาสอบ</span>
            </div>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{selectedExam.time}</p>
          </div>
        </div>

        <!-- Location -->
        {#if selectedExam.location.building || selectedExam.location.room || selectedExam.location.seatNo}
          <!-- Case: Structured location data (building:room:seat format) -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-sm font-medium">สถานที่สอบ</span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              {#if selectedExam.location.building}
                <div class="bg-white dark:bg-gray-800/50 rounded-lg p-3">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">อาคาร</div>
                  <div class="text-lg font-bold text-orange-600 dark:text-orange-400">{selectedExam.location.building}</div>
                </div>
              {/if}
              
              {#if selectedExam.location.room}
                <div class="bg-white dark:bg-gray-800/50 rounded-lg p-3">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">ห้อง</div>
                  <div class="text-lg font-bold text-orange-600 dark:text-orange-400">{selectedExam.location.room}</div>
                </div>
              {/if}
              
              {#if selectedExam.location.seatNo}
                <div class="bg-white dark:bg-gray-800/50 rounded-lg p-3">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">ที่นั่ง</div>
                  <div class="text-lg font-bold text-orange-600 dark:text-orange-400">{selectedExam.location.seatNo}</div>
                </div>
              {:else}
                <!-- Show placeholder if no seat number -->
                <div class="bg-white dark:bg-gray-800/50 rounded-lg p-3 opacity-50">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">ที่นั่ง</div>
                  <div class="text-lg font-bold text-gray-400 dark:text-gray-500">-</div>
                </div>
              {/if}
            </div>
          </div>
        {:else if selectedExam.location.raw && (selectedExam.location.raw.includes('ปลายภาค') || selectedExam.location.raw.includes('final exam') || selectedExam.location.raw.includes('ในห้องสอบ') || selectedExam.location.raw.includes('examination room'))}
          <!-- Case: Exam during final period without specific location -->
          <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">ไม่ระบุสถานที่สอบ</h3>
                <p class="text-sm text-amber-700 dark:text-amber-300">วิชานี้จะจัดสอบในช่วงปลายภาค กรุณาตรวจสอบสถานที่สอบอีกครั้งก่อนวันสอบ</p>
              </div>
            </div>
          </div>
        {:else if selectedExam.location.raw}
          <!-- Case: Other location format (raw text) -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-sm font-medium">สถานที่สอบ</span>
            </div>
            <p class="text-base text-gray-900 dark:text-white">{selectedExam.location.raw}</p>
          </div>
        {:else}
          <!-- Case: No location data at all -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-sm font-medium">สถานที่สอบ</span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">ยังไม่ได้ระบุสถานที่สอบ</p>
          </div>
        {/if}

        <!-- Seat Map Button -->
        {#if selectedExam.seatMapUrl}
          <Button
            variant="primary"
            class="w-full justify-center"
            on:click={() => openSeatMap(selectedExam?.seatMapUrl || "")}
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            ดูแผนผังที่นั่งสอบ
          </Button>
        {/if}
      </div>
    </div>
  </div>
{/if}
