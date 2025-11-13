<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import { classes, cn } from '../../styles';
  import { Button, Card, Text, Loading, Alert } from '../common';

  export let actionUrl: string;
  export let pdfUrl: string | undefined = undefined;

  let loading = true;
  let error: string | null = null;
  let transcriptData: any = null;

  async function fetchTranscript() {
    try {
      loading = true;
      error = null;

      const response = await fetch(
        `https://www.reg.kmitl.ac.th/u_student/${actionUrl}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("ไม่สามารถโหลดข้อมูลได้");
      }

      const buffer = await response.arrayBuffer();
      const decoder = new TextDecoder("windows-874");
      const html = decoder.decode(buffer);

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Parse transcript data
      transcriptData = parseTranscriptData(doc);
    } catch (err) {
      error = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
    } finally {
      loading = false;
    }
  }

  function parseTranscriptData(doc: Document) {
    const tables = Array.from(doc.querySelectorAll("table"));
    const mainTable = tables.find((table) => {
      const text = table.textContent || "";
      return (
        text.includes("COURSE TITLE") &&
        text.includes("CREDIT") &&
        text.includes("GRADE")
      );
    });

    if (!mainTable) {
      return null;
    }

    const data: any = {
      personalInfo: {},
      semesters: [],
      summary: {},
    };

    // Extract personal info from specific rows
    const rows = Array.from(mainTable.querySelectorAll("tr"));
    
    rows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll("td"));
      const text = row.textContent || "";
      
      // Name - look for specific cell structure
      if (text.includes("Name") && !data.personalInfo.name) {
        // Find cell that contains Name label and value
        for (let i = 0; i < cells.length; i++) {
          const cellText = cells[i].textContent || "";
          // Look for pattern: "Name   Mr./Ms./Mrs. FirstName LastName"
          const nameMatch = cellText.match(/Name\s+(?:Mr\.|Ms\.|Mrs\.|Miss)\s+(.+?)$/);
          if (nameMatch) {
            data.personalInfo.name = nameMatch[0].replace(/Name\s+/, '').trim();
            break;
          }
        }
      }
      
      // Date of Birth and Student ID - same row but different cells
      if (text.includes("Date of Birth") && text.includes("Student ID")) {
        for (let i = 0; i < cells.length; i++) {
          const cellText = cells[i].textContent || "";
          
          // Date of Birth cell
          if (cellText.includes("Date of Birth") && !cellText.includes("Student ID")) {
            const birthMatch = cellText.match(/Date of Birth\s+(.+?)$/);
            if (birthMatch) {
              data.personalInfo.dateOfBirth = birthMatch[1].trim();
            }
          }
          
          // Student ID cell
          if (cellText.includes("Student ID") && !cellText.includes("Date of Birth")) {
            const idMatch = cellText.match(/Student ID\s+(\d+)/);
            if (idMatch) {
              data.personalInfo.studentId = idMatch[1].trim();
            }
          }
        }
      }
      
      // Date of Admission and Graduation - same row but different cells
      if (text.includes("Date of Admission") && text.includes("Date of Graduation")) {
        for (let i = 0; i < cells.length; i++) {
          const cellText = cells[i].textContent || "";
          
          // Date of Admission cell
          if (cellText.includes("Date of Admission") && !cellText.includes("Graduation")) {
            const admissionMatch = cellText.match(/Date of Admission\s+(\d+)/);
            if (admissionMatch) {
              data.personalInfo.admissionDate = admissionMatch[1].trim();
            }
          }
          
          // Date of Graduation cell
          if (cellText.includes("Date of Graduation") && !cellText.includes("Admission")) {
            const gradMatch = cellText.match(/Date of Graduation\s+(.+?)(?:\(|$)/);
            if (gradMatch) {
              data.personalInfo.graduationDate = gradMatch[1].trim();
            }
          }
        }
      }
      
      // Degree - single cell
      if (text.includes("Degree") && !data.personalInfo.degree) {
        for (let i = 0; i < cells.length; i++) {
          const cellText = cells[i].textContent || "";
          if (cellText.includes("Degree") && cellText.includes("Bachelor")) {
            const degreeMatch = cellText.match(/Degree\s+(.+?)$/);
            if (degreeMatch) {
              data.personalInfo.degree = degreeMatch[1].trim();
              break;
            }
          }
        }
      }
      
      // Major - single cell
      if (text.includes("Major") && !data.personalInfo.major) {
        for (let i = 0; i < cells.length; i++) {
          const cellText = cells[i].textContent || "";
          if (cellText.includes("Major") && (cellText.includes("Engineering") || cellText.includes("Computer") || cellText.includes("Science"))) {
            const majorMatch = cellText.match(/Major\s+(.+?)$/);
            if (majorMatch) {
              data.personalInfo.major = majorMatch[1].trim();
              break;
            }
          }
        }
      }
    });

    // Extract semesters and courses
    let currentSemester: any = null;
    let isInCourseSection = false;
    
    rows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll("td"));
      const text = row.textContent || "";

      // Start of course section
      if (text.includes("COURSE TITLE") && text.includes("CREDIT") && text.includes("GRADE")) {
        isInCourseSection = true;
        return;
      }

      if (!isInCourseSection) return;

      // Check for semester header
      if (text.match(/\d+(st|nd|rd|th) Semester/)) {
        if (currentSemester && currentSemester.courses.length > 0) {
          data.semesters.push(currentSemester);
        }
        const semesterMatch = text.match(/(\d+(st|nd|rd|th) Semester[^)]+\))/);
        currentSemester = {
          name: semesterMatch ? semesterMatch[1].trim() : text.trim().split('\n')[0],
          courses: [],
          gps: "",
          gpa: "",
        };
        return;
      }

      // Check for GPS/GPA
      if (text.includes("GPS") && text.includes("GPA") && currentSemester) {
        const gpsMatch = text.match(/GPS\s*:\s*([^\s]+)/);
        const gpaMatch = text.match(/GPA\s*:\s*([^\s]+)/);
        if (gpsMatch) currentSemester.gps = gpsMatch[1];
        if (gpaMatch) currentSemester.gpa = gpaMatch[1];
        return;
      }

      // Extract course data - look for rows with exactly 7 or 15 cells
      if ((cells.length === 7 || cells.length === 15) && currentSemester) {
        const courseCode = cells[0]?.textContent?.trim() || "";
        const courseTitle = cells[2]?.textContent?.trim() || "";
        const credit = cells[4]?.textContent?.trim() || "";
        const grade = cells[6]?.textContent?.trim() || "";

        // Check if it's a valid course (code is numeric and not empty)
        if (courseCode && /^\d+$/.test(courseCode) && courseTitle) {
          currentSemester.courses.push({
            code: courseCode,
            title: courseTitle,
            credit,
            grade: grade || "-",
          });
        }
      }

      // Extract summary data
      if (text.includes("Total  number of credit earned")) {
        const match = text.match(/Total\s+number of credit earned:\s*(\d+)/);
        if (match) data.summary.totalCredits = match[1];
      }
      
      if (text.includes("Cumulative GPA")) {
        const match = text.match(/Cumulative GPA:\s*([\d.]+)/);
        if (match) data.summary.cumulativeGPA = match[1];
      }
      
      if (text.includes("Date Issued")) {
        const match = text.match(/Date Issued:\s*([^C]+)Certified/);
        if (match) data.summary.dateIssued = match[1].trim();
      }
    });

    // Push last semester
    if (currentSemester && currentSemester.courses.length > 0) {
      data.semesters.push(currentSemester);
    }

    return data;
  }

  onMount(() => {
    fetchTranscript();
  });
</script>

<div class="space-y-6">
  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center space-y-3">
        <div class="w-8 h-8 border-4 border-orange-200/60 border-t-orange-600 rounded-full animate-spin"></div>
        <p class={classes.text.bodySecondary}>กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  {:else if error}
    <div class="flex items-center justify-center py-12">
      <div class="text-center space-y-3">
        <Icon icon="ph:warning-duotone" class="w-12 h-12 text-red-500 mx-auto" />
        <p class="text-red-600 dark:text-red-400">{error}</p>
      </div>
    </div>
  {:else if transcriptData}
    <!-- Header with PDF Button -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class={classes.text.heading1}>ทรานสคริปต์</h2>
        <p class={cn(classes.text.bodySecondary, 'mt-1')}>Unofficial Transcript</p>
      </div>
      {#if pdfUrl}
        <Button
          variant="primary"
          icon="ph:file-pdf-duotone"
          href={pdfUrl}
          target="_blank"
        >
          ดาวน์โหลด PDF
        </Button>
      {/if}
    </div>

    <!-- Personal Info Card -->
    <div class={classes.card.base}>
      <div class="bg-gradient-to-r from-orange-500/95 to-amber-500/95 backdrop-blur-sm px-6 py-4">
        <div class="flex items-center gap-2">
          <Icon icon="ph:user-circle-duotone" class="w-6 h-6 text-white" />
          <h3 class="text-lg font-semibold text-white">ข้อมูลส่วนตัว</h3>
        </div>
      </div>
      <div class="p-6">
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div class="flex flex-col">
            <dt class={cn(classes.text.caption, 'uppercase tracking-wide mb-1')}>
              ชื่อ-นามสกุล (Name)
            </dt>
            <dd class={cn(classes.text.body, 'font-semibold')}>
              {transcriptData.personalInfo.name || "-"}
            </dd>
          </div>
          
          <div class="flex flex-col">
            <dt class={cn(classes.text.caption, 'uppercase tracking-wide mb-1')}>
              รหัสนักศึกษา (Student ID)
            </dt>
            <dd class={cn(classes.text.body, 'font-semibold font-mono')}>
              {transcriptData.personalInfo.studentId || "-"}
            </dd>
          </div>
          
          <div class="flex flex-col">
            <dt class={cn(classes.text.caption, 'uppercase tracking-wide mb-1')}>
              วันเกิด (Date of Birth)
            </dt>
            <dd class={classes.text.body}>
              {transcriptData.personalInfo.dateOfBirth || "-"}
            </dd>
          </div>
          
          <div class="flex flex-col">
            <dt class={cn(classes.text.caption, 'uppercase tracking-wide mb-1')}>
              ปีที่เข้าศึกษา (Admission)
            </dt>
            <dd class={classes.text.body}>
              {transcriptData.personalInfo.admissionDate || "-"}
            </dd>
          </div>
          
          <div class="flex flex-col md:col-span-2">
            <dt class={cn(classes.text.caption, 'uppercase tracking-wide mb-1')}>
              ระดับการศึกษา (Degree)
            </dt>
            <dd class={classes.text.body}>
              {transcriptData.personalInfo.degree || "-"}
            </dd>
          </div>
          
          <div class="flex flex-col md:col-span-2">
            <dt class={cn(classes.text.caption, 'uppercase tracking-wide mb-1')}>
              สาขาวิชา (Major)
            </dt>
            <dd class={classes.text.body}>
              {transcriptData.personalInfo.major || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Semesters -->
    {#each transcriptData.semesters as semester, index}
      <div class={classes.card.base}>
        <div class={cn(
          'px-6 py-4 border-b',
          'bg-orange-50/70 dark:bg-orange-900/20 backdrop-blur-sm',
          'border-orange-200/60 dark:border-orange-800/50'
        )}>
          <div class="flex items-center gap-3">
            <div class={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm',
              'bg-orange-600/90 backdrop-blur-sm text-white'
            )}>
              {index + 1}
            </div>
            <h3 class={cn(classes.text.heading3, 'text-orange-900 dark:text-orange-100')}>
              {semester.name}
            </h3>
          </div>
        </div>
        
        <div class={classes.table.wrapper}>
          <table class={classes.table.base}>
            <thead class={classes.table.header}>
              <tr>
                <th class={cn(classes.table.th, 'text-left')}>
                  รหัสวิชา
                </th>
                <th class={cn(classes.table.th, 'text-left')}>
                  ชื่อวิชา
                </th>
                <th class={cn(classes.table.th, 'text-center')}>
                  หน่วยกิต
                </th>
                <th class={cn(classes.table.th, 'text-center')}>
                  เกรด
                </th>
              </tr>
            </thead>
            <tbody class={classes.table.body}>
              {#each semester.courses as course}
                <tr class={classes.table.row}>
                  <td class={cn(classes.table.cell, 'font-mono whitespace-nowrap')}>
                    {course.code}
                  </td>
                  <td class={classes.table.cell}>
                    {course.title}
                  </td>
                  <td class={cn(classes.table.cell, 'text-center')}>
                    {course.credit}
                  </td>
                  <td class={cn(classes.table.cell, 'text-center')}>
                    <span class={cn(
                      'inline-flex items-center justify-center min-w-[3rem] px-3 py-1.5 rounded-lg backdrop-blur-sm font-bold text-sm',
                      'bg-orange-100/80 dark:bg-orange-900/40',
                      'text-orange-700 dark:text-orange-300'
                    )}>
                      {course.grade || "-"}
                    </span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        {#if semester.gps || semester.gpa}
          <div class={cn(
            'px-6 py-4 border-t backdrop-blur-sm',
            'bg-gray-50/70 dark:bg-gray-900/40',
            'border-gray-200/60 dark:border-gray-700/50'
          )}>
            <div class="flex justify-end items-center gap-8">
              {#if semester.gps && semester.gps !== "-"}
                <div class="flex items-center gap-2">
                  <span class={cn(classes.text.bodySecondary, 'font-medium')}>GPS:</span>
                  <span class="text-lg font-bold text-orange-600 dark:text-orange-400">{semester.gps}</span>
                </div>
              {/if}
              {#if semester.gpa && semester.gpa !== "-"}
                <div class="flex items-center gap-2">
                  <span class={cn(classes.text.bodySecondary, 'font-medium')}>GPA:</span>
                  <span class="text-lg font-bold text-orange-600 dark:text-orange-400">{semester.gpa}</span>
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    {/each}

    <!-- Summary Card -->
    {#if transcriptData.summary && (transcriptData.summary.totalCredits || transcriptData.summary.cumulativeGPA)}
      <div class="bg-gradient-to-br from-orange-500/95 to-amber-500/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        <div class="px-6 py-5">
          <div class="flex items-center gap-2 mb-4">
            <Icon icon="ph:graduation-cap-duotone" class="w-6 h-6 text-white" />
            <h3 class="text-lg font-bold text-white">สรุปผลการเรียน</h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            {#if transcriptData.summary.totalCredits}
              <div class={cn(classes.card.base, 'p-5 text-center')}>
                <p class={cn(classes.text.caption, 'uppercase tracking-wide mb-2')}>
                  หน่วยกิตสะสม
                </p>
                <p class="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {transcriptData.summary.totalCredits}
                </p>
                <p class={cn(classes.text.caption, 'mt-1')}>Total Credits</p>
              </div>
            {/if}
            {#if transcriptData.summary.cumulativeGPA}
              <div class={cn(classes.card.base, 'p-5 text-center')}>
                <p class={cn(classes.text.caption, 'uppercase tracking-wide mb-2')}>
                  เกรดเฉลี่ยสะสม
                </p>
                <p class="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {transcriptData.summary.cumulativeGPA}
                </p>
                <p class={cn(classes.text.caption, 'mt-1')}>Cumulative GPA</p>
              </div>
            {/if}
            {#if transcriptData.summary.dateIssued}
              <div class={cn(classes.card.base, 'p-5 text-center md:col-span-1')}>
                <p class={cn(classes.text.caption, 'uppercase tracking-wide mb-2')}>
                  วันที่ออกเอกสาร
                </p>
                <p class={cn(classes.text.body, 'font-semibold mt-2')}>
                  {transcriptData.summary.dateIssued}
                </p>
                <p class={cn(classes.text.caption, 'mt-1')}>Date Issued</p>
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/if}

    <!-- Note -->
    <div class={classes.note.warning}>
      <Icon icon="ph:info-duotone" class="w-5 h-5 text-amber-700 dark:text-amber-300 flex-shrink-0 mt-0.5" />
      <p class={cn(classes.text.bodySecondary, 'text-amber-800 dark:text-amber-200')}>
        <span class="font-semibold">หมายเหตุ:</span> นี่เป็นทรานสคริปต์ฉบับไม่เป็นทางการ (Unofficial Transcript) 
        หากต้องการใช้เป็นเอกสารอย่างเป็นทางการ กรุณาดาวน์โหลด PDF หรือติดต่อสำนักทะเบียนและประมวลผล
      </p>
    </div>
  {/if}
</div>
