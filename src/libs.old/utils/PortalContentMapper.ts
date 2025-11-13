import type {
  ScoreStatus,
  ScoreAssessment,
  ScoreCourse,
  ScoreLegendItem,
  ScoreboardHeader,
  ScoreboardBlock,
  MidtermScoreBlock,
  NewsItem,
  NewsListBlock,
  ScheduleOption,
  ScheduleTableBlock,
  ExamTableBlock,
  MinorProgramBlock,
  RegistrationEligibilityBlock,
  GradeReportCourse,
  GradeReportSummary,
  GradeReportLegendItem,
  GradeReportBlock,
  TranscriptBlock,
  PortalBlock,
  PortalContentModel,
  PortalContentMapperOptions,
} from "../types";

export function mapDocumentToContent(
  doc: Document,
  options: PortalContentMapperOptions = {}
): PortalContentModel {
  const specialized = detectSpecializedContent(doc, options);
  if (specialized) return specialized;

  const workingRoot = doc.body.cloneNode(true) as HTMLElement;
  sanitizeRoot(workingRoot);

  const blocks: PortalBlock[] = [];
  let paragraphBuffer = "";

  const flushParagraph = () => {
    const text = normalizeText(paragraphBuffer);
    if (text) {
      blocks.push({ type: "paragraph", text });
    }
    paragraphBuffer = "";
  };

  const visit = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      paragraphBuffer += (node.textContent || "") + " ";
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const element = node as HTMLElement;
    const tag = element.tagName;

    if (tag === "BR") {
      paragraphBuffer += "\n";
      return;
    }

    if (tag === "HR") {
      flushParagraph();
      blocks.push({ type: "divider" });
      return;
    }

    if (/^H([1-4])$/.test(tag)) {
      flushParagraph();
      const level = parseInt(RegExp.$1, 10);
      const text = normalizeText(element.textContent || "");
      if (text) blocks.push({ type: "heading", level, text });
      return;
    }

    if (tag === "P") {
      flushParagraph();
      const text = normalizeText(element.textContent || "");
      if (text) blocks.push({ type: "paragraph", text });
      return;
    }

    if (tag === "UL" || tag === "OL") {
      flushParagraph();
      const items = Array.from(element.querySelectorAll("li")).map((item) =>
        normalizeText(item.textContent || "")
      );
      const filtered = items.filter(Boolean);
      if (filtered.length > 0) {
        blocks.push({
          type: "list",
          ordered: tag === "OL",
          items: filtered,
        });
      }
      return;
    }

    if (tag === "TABLE") {
      flushParagraph();
      const table = element as HTMLTableElement;
      const kvItems = extractKeyValueTable(table);
      if (kvItems) {
        blocks.push({ type: "keyValue", items: kvItems });
        return;
      }

      const tableData = extractGeneralTable(table);
      if (tableData.rows.length > 0) {
        blocks.push({ type: "table", headers: tableData.headers, rows: tableData.rows });
      }
      return;
    }

    if (tag === "A") {
      const href = element.getAttribute("href") || "";
      const label = normalizeText(element.textContent || "");
      if (href && label) {
        flushParagraph();
        blocks.push({
          type: "links",
          items: [
            {
              label,
              href,
            },
          ],
        });
        return;
      }
    }

    if (tag === "FORM") {
      flushParagraph();
      const noteText = normalizeText(
        element.getAttribute("title") || element.querySelector("legend")?.textContent || ""
      );
      blocks.push({
        type: "note",
        tone: "info",
        text: noteText || "ฟอร์มนี้ยังไม่รองรับในเวอร์ชันใหม่ กรุณาเปิดหน้าต้นฉบับเพื่อดำเนินการ",
      });
      return;
    }

    const textContent = normalizeText(element.textContent || "");
    const hasNestedBlocks = Array.from(element.children).some((child) =>
      isBlockLevelElement(child as HTMLElement)
    );

    if (!hasNestedBlocks && textContent) {
      paragraphBuffer += textContent + " ";
      return;
    }

    element.childNodes.forEach(visit);
  };

  workingRoot.childNodes.forEach(visit);
  flushParagraph();

  const titleCandidate = workingRoot.querySelector("h1, h2, .title, .header")?.textContent ||
    doc.title ||
    "ข้อมูล";

  return {
    title: normalizeText(titleCandidate),
    blocks: mergeAdjacentLinkBlocks(blocks),
  };
}

function sanitizeRoot(root: HTMLElement) {
  root.querySelectorAll("script, style, iframe, noscript").forEach((el) => el.remove());
  root.querySelectorAll("br").forEach((el) => {
    const textNode = root.ownerDocument.createTextNode("\n");
    el.parentNode?.replaceChild(textNode, el);
  });
}

function extractNewsListContent(doc: Document): PortalContentModel | null {
  const table = findNewsListTable(doc);
  if (!table) return null;

  const rows = Array.from(table.rows);
  const items: NewsItem[] = [];

  rows.forEach((row, index) => {
    const cell = row.cells[0];
    if (!cell) return;

    // Find only the first link with group_news in this row
    const mainLink = cell.querySelector<HTMLAnchorElement>("a[href*='group_news']");
    if (!mainLink) return;

    const href = mainLink.getAttribute("href");
    if (!href || href.startsWith("javascript:")) return;

    const titleElement = mainLink.querySelector("span, strong") ?? mainLink;
    const title = normalizeText(titleElement.textContent || "");
    if (!title) return;

    // Extract date and time from the format: [ 21 Oct. 62 - 10:06 ]
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

    items.push({
      id: `news-${index}`,
      title,
      href,
      date,
    });
  });

  if (items.length === 0) return null;

  const titleElement = doc.querySelector("img[src*='group']") ?? doc.querySelector("h1, h2");
  const title = titleElement
    ? normalizeText(titleElement.getAttribute("alt") ?? titleElement.textContent ?? "")
    : "ข่าวประชาสัมพันธ์";

  return {
    title,
    blocks: [{ type: "newsList", items }],
  };
}

function findNewsListTable(doc: Document): HTMLTableElement | null {
  const tables = Array.from(doc.querySelectorAll<HTMLTableElement>("table"));
  
  // Look for the inner table that contains the actual news rows
  // It should have multiple rows with group_news links
  for (const table of tables) {
    const newsLinks = table.querySelectorAll<HTMLAnchorElement>("a[href*='group_news']");
    if (newsLinks.length < 3) continue;
    
    // Count how many rows have group_news links
    const rowsWithNews = Array.from(table.rows).filter(row => {
      return row.querySelector("a[href*='group_news']") !== null;
    });
    
    // The correct table should have multiple rows with news
    if (rowsWithNews.length > 3) {
      return table;
    }
  }
  
  return null;
}

function extractScheduleTableContent(
  doc: Document,
  options: PortalContentMapperOptions
): PortalContentModel | null {
  const form = doc.querySelector('form[name="edit"]') as HTMLFormElement;
  if (!form) return null;

  const yearSelect = form.querySelector('select[name="year"]') as HTMLSelectElement;
  const semesterSelect = form.querySelector('select[name="semester"]') as HTMLSelectElement;
  
  if (!yearSelect || !semesterSelect) return null;

  const years: ScheduleOption[] = Array.from(yearSelect.options).map(opt => ({
    value: opt.value,
    label: opt.textContent?.trim() || opt.value
  }));

  const semesters: ScheduleOption[] = Array.from(semesterSelect.options).map(opt => ({
    value: opt.value,
    label: opt.textContent?.trim() || opt.value
  }));

  const actionUrl = form.action || options.sourceUrl?.replace('report_studytable.php', 'report_studytable_show.php') || '';

  return {
    title: "ตารางเรียนส่วนบุคคล",
    blocks: [{
      type: "scheduleTable",
      title: "ตารางเรียนส่วนบุคคล",
      years,
      semesters,
      actionUrl
    }]
  };
}

function extractExamTableContent(
  doc: Document,
  options: PortalContentMapperOptions
): PortalContentModel | null {
  const form = doc.querySelector('form[name="edit"]') as HTMLFormElement;
  if (!form) return null;

  const yearSelect = form.querySelector('select[name="year"]') as HTMLSelectElement;
  const semesterSelect = form.querySelector('select[name="semester"]') as HTMLSelectElement;
  
  if (!yearSelect || !semesterSelect) return null;

  const years: ScheduleOption[] = Array.from(yearSelect.options).map(opt => ({
    value: opt.value,
    label: opt.textContent?.trim() || opt.value
  }));

  const semesters: ScheduleOption[] = Array.from(semesterSelect.options).map(opt => ({
    value: opt.value,
    label: opt.textContent?.trim() || opt.value
  }));

  const actionUrl = form.action || options.sourceUrl?.replace('report_examtable.php', 'report_examtable_show.php') || '';

  return {
    title: "ตารางสอบส่วนบุคคล",
    blocks: [{
      type: "examTable",
      title: "ตารางสอบส่วนบุคคล",
      years,
      semesters,
      actionUrl
    }]
  };
}

function extractMinorProgramContent(
  doc: Document,
  options: PortalContentMapperOptions
): PortalContentModel | null {
  // Primary detection: check URL pattern
  const isMinorUrl = options.sourceUrl?.includes("minor.php") || false;
  
  // Secondary detection: check for minor-specific elements
  const hasMinorNav = !!doc.querySelector('ul.blue a[href*="minor_news.php"]') ||
                      !!doc.querySelector('ul.blue a[href*="minor_program.php"]') ||
                      !!doc.querySelector('ul.blue a[href*="minor_apply.php"]');
  
  const hasPrompt = !!doc.querySelector('h3.prompt');
  
  // If URL matches and has minor-specific navigation, it's a minor program page
  if (isMinorUrl && (hasMinorNav || hasPrompt)) {
    return {
      title: "หลักสูตรวิชาโท",
      subtitle: "Minor Program Management",
      blocks: [{
        type: "minorProgram",
        sourceUrl: options.sourceUrl || ""
      }]
    };
  }
  
  return null;
}

function extractRegistrationEligibilityContent(doc: Document): PortalContentModel | null {
  // Find h1.prompt to check registration status
  const promptHeading = doc.querySelector("h1.prompt");
  if (!promptHeading) return null;

  const headingText = normalizeText(promptHeading.textContent || "");
  const hasEligibility = headingText.includes("สามารถลงทะเบียน");

  // Try to find student info from div id first
  let studentId = "";
  let studentName = "";
  let semester = "";

  const studentIdDiv = doc.querySelector("#div_student_id");
  const studentNameDiv = doc.querySelector("#div_tname");
  const semesterDiv = doc.querySelector("#div_semester");

  if (studentIdDiv) {
    studentId = normalizeText(studentIdDiv.textContent || "");
  }
  if (studentNameDiv) {
    studentName = normalizeText(studentNameDiv.textContent || "");
  }
  if (semesterDiv) {
    semester = normalizeText(semesterDiv.textContent || "");
  }

  // If not found from div, search from table instead
  if (!studentId || !studentName) {
    const tables = Array.from(doc.querySelectorAll("table"));
    for (const table of tables) {
      const rows = Array.from(table.rows);
      for (const row of rows) {
        const cells = Array.from(row.cells);
        if (cells.length >= 2) {
          const label = normalizeText(cells[0].textContent || "");
          const value = normalizeText(cells[1].textContent || "");

          if (label.includes("รหัสนักศึกษา") && !studentId) {
            studentId = value;
          } else if ((label.includes("ชื่อ-นามสกุล") || label.includes("ชื่อ")) && !studentName) {
            studentName = value;
          } else if (label.includes("ภาคการศึกษา") && !semester) {
            semester = value;
          }
        }
      }
    }
  }

  // If no student info found, return null
  if (!studentId || !studentName) return null;

  return {
    type: "registrationEligibility",
    title: "ตรวจสอบสิทธิ์ก่อนลงทะเบียน",
    subtitle: "Registration Eligibility Check",
    blocks: [{
      type: "registrationEligibility",
      studentId,
      studentName,
      semester: semester || "-",
      hasEligibility
    }]
  };
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isBlockLevelElement(element: HTMLElement): boolean {
  return ["P", "TABLE", "UL", "OL", "H1", "H2", "H3", "H4", "FORM"].includes(
    element.tagName
  );
}

function extractKeyValueTable(table: HTMLTableElement) {
  const rows = Array.from(table.rows);
  if (rows.length === 0) return null;

  const items: Array<{ label: string; value: string }> = [];
  let validRowCount = 0;

  for (const row of rows) {
    const cells = Array.from(row.cells);
    if (cells.length === 0) continue;
    if (cells.length > 3) return null;

    const label = normalizeText(cells[0].textContent || "");
    const value = normalizeText(cells.slice(1).map((cell) => cell.textContent || "").join(" "));
    if (!label && !value) continue;

    if (label || value) {
      validRowCount += 1;
      items.push({ label: label || "ข้อมูล", value });
    }
  }

  if (validRowCount === 0) return null;
  return items;
}

function extractGeneralTable(table: HTMLTableElement) {
  const headers: string[] = [];
  const headerCells = table.querySelectorAll("thead th");
  if (headerCells.length > 0) {
    headerCells.forEach((cell) => headers.push(normalizeText(cell.textContent || "")));
  }

  const rows: string[][] = [];

  Array.from(table.rows).forEach((row) => {
    const parentTag = row.parentElement?.tagName ?? "";
    if (parentTag === "THEAD") return;

    const rowValues: string[] = [];
    Array.from(row.cells).forEach((cell) => {
      const content = extractCellContent(cell);
      if (!shouldKeepCell(cell, content)) return;
      rowValues.push(content);
    });

    if (rowValues.some((value) => value)) rows.push(rowValues);
  });

  let dataRows = rows;

  if (headers.length === 0 && dataRows.length > 0) {
    const headerCandidate = dataRows[0];
    const nextRow = dataRows[1];
    const sameLength = nextRow ? nextRow.length === headerCandidate.length : true;
    const hasLetters = headerCandidate.some((value) => /[A-Za-z\u0E00-\u0E7F]/.test(value));

    if (headerCandidate.length > 0 && sameLength && hasLetters) {
      headers.push(...headerCandidate);
      dataRows = dataRows.slice(1);
    }
  }

  const columnCount = Math.max(headers.length, ...dataRows.map((row) => row.length));

  if (headers.length === 0 && columnCount > 0) {
    for (let i = 0; i < columnCount; i += 1) {
      headers.push(`ข้อมูลที่ ${i + 1}`);
    }
  } else if (headers.length < columnCount) {
    for (let i = headers.length; i < columnCount; i += 1) {
      headers.push(`ข้อมูลที่ ${i + 1}`);
    }
  }

  const normalizedRows = dataRows.map((row) => {
    const padded = [...row];
    while (padded.length < columnCount) padded.push("");
    return padded;
  });

  return { headers, rows: normalizedRows };
}

function extractCellContent(cell: HTMLTableCellElement): string {
  const inlineText = normalizeText(cell.textContent || "");
  if (inlineText) return inlineText;

  const image = cell.querySelector<HTMLImageElement>("img[alt], img[title]");
  if (image) {
    const alt = image.getAttribute("alt") || image.getAttribute("title") || "";
    const mappedAlt = alt === "" && image.src ? image.src.split("/").pop() ?? "" : alt;
    return normalizeText(mappedAlt);
  }

  const link = cell.querySelector<HTMLAnchorElement>("a");
  if (link) {
    const linkText = normalizeText(link.textContent || "");
    if (linkText) return linkText;
    const href = link.getAttribute("href") || "";
    return href;
  }

  return "";
}

function shouldKeepCell(cell: HTMLTableCellElement, content: string): boolean {
  if (cell.colSpan > 1 || cell.rowSpan > 1) return true;
  if (content) return true;

  const widthAttr = cell.getAttribute("width");
  if (widthAttr) {
    const widthValue = parseInt(widthAttr, 10);
    if (!Number.isNaN(widthValue) && widthValue <= 2) return false;
  }

  if (!cell.children.length) return false;

  if (cell.querySelector("table")) return true;

  const hasInteractiveChild = cell.querySelector(
    "img, input, select, button, textarea, a"
  );
  return Boolean(hasInteractiveChild);
}

function mergeAdjacentLinkBlocks(blocks: PortalBlock[]): PortalBlock[] {
  const merged: PortalBlock[] = [];

  for (const block of blocks) {
    if (block.type === "links") {
      const previous = merged[merged.length - 1];
      if (previous && previous.type === "links") {
        previous.items.push(...block.items);
        continue;
      }
    }
    merged.push(block);
  }

  return merged;
}

function detectSpecializedContent(
  doc: Document,
  options: PortalContentMapperOptions
): PortalContentModel | null {
  if (options.sourceUrl?.includes("advance_gradetable") ) {
    return {
      title: "ข้อมูลผลการเรียน 4+1",
      blocks: [
        {
          type: "note",
          tone: "info",
          text: "ฟีเจอร์นี้กำลังอยู่ในระหว่างการพัฒนา กรุณาใช้หน้าต้นฉบับในการดูข้อมูล",
        },
      ],
    };
  }

  if (options.sourceUrl?.includes("grad/grad.php") || options.sourceUrl?.includes("unauthor.php")) {
    return {
      title: "แจ้งคาดว่าจะสำเร็จการศึกษา",
      blocks: [
        {
          type: "note",
          tone: "info",
          text: "ฟีเจอร์นี้กำลังอยู่ในระหว่างการพัฒนา กรุณาใช้หน้าต้นฉบับในการดูข้อมูล",
        },
      ],
    };
  }

  if (options.sourceUrl?.includes("webboardX.php")) {
    return {
      title: "เว็บบอร์ดสำนักฯ",
      blocks: [
        {
          type: "note",
          tone: "info",
          text: "ฟีเจอร์นี้กำลังอยู่ในระหว่างการพัฒนา กรุณาใช้หน้าต้นฉบับในการดูข้อมูล",
        },
      ],
    };
  }

  if (options.sourceUrl?.includes("grade_process.php")) {
    return {
      title: "ขั้นตอนการส่งเกรด",
      blocks: [
        {
          type: "note",
          tone: "info",
          text: "ฟีเจอร์นี้กำลังอยู่ในระหว่างการพัฒนา กรุณาใช้หน้าต้นฉบับในการดูข้อมูล",
        },
      ],
    };
  }

  if (options.sourceUrl?.includes("report_gradetable")) {
    const gradeReport = extractGradeReportContent(doc);
    if (gradeReport) return gradeReport;
  }

  if (options.sourceUrl?.includes("report_transcript")) {
    const transcript = extractTranscriptContent(doc);
    if (transcript) return transcript;
  }

  if (options.sourceUrl?.includes("midterm_score")) {
    const midterm = extractMidtermScoreContent(doc);
    if (midterm) return midterm;
  }

  if (options.sourceUrl?.includes("newsX.php")) {
    const news = extractNewsListContent(doc);
    if (news) return news;
  }

  if (options.sourceUrl?.includes("report_studytable.php")) {
    const schedule = extractScheduleTableContent(doc, options);
    if (schedule) return schedule;
  }

  if (options.sourceUrl?.includes("report_examtable.php")) {
    const exam = extractExamTableContent(doc, options);
    if (exam) return exam;
  }

  if (options.sourceUrl?.includes("minor.php")) {
    const minor = extractMinorProgramContent(doc, options);
    if (minor) return minor;
  }

  if (options.sourceUrl?.includes("check_regis_no_right.php")) {
    const eligibility = extractRegistrationEligibilityContent(doc);
    if (eligibility) return eligibility;
  }

  return null;
}

interface ScoreCellData {
  text: string;
  imgSrc?: string;
  imgAlt?: string;
}

function extractMidtermScoreContent(doc: Document): PortalContentModel | null {
  const table = findMidtermScoreTable(doc);
  if (!table) return null;

  const rows = Array.from(table.rows);
  const headerInfo = locateMidtermHeader(rows);
  if (!headerInfo) return null;

  const { headerRowIndex, assessments, header } = headerInfo;
  const courses = parseMidtermCourses(rows.slice(headerRowIndex + 1), assessments);
  if (courses.length === 0) return null;

  const legend = extractMidtermLegend(doc);
  const note = extractMidtermNote(doc);
  
  // Extract year and semester selectors
  const form = doc.querySelector<HTMLFormElement>("form[name='edit']");
  const actionUrl = form?.getAttribute("action") || "midterm_score.php";
  
  const years: ScheduleOption[] = [];
  const yearSelect = form?.querySelector<HTMLSelectElement>("select[name='year']");
  if (yearSelect) {
    Array.from(yearSelect.options).forEach((option) => {
      years.push({
        value: option.value,
        label: option.textContent?.trim() || option.value,
      });
    });
  }
  
  const semesters: ScheduleOption[] = [];
  const semesterSelect = form?.querySelector<HTMLSelectElement>("select[name='semester']");
  if (semesterSelect) {
    Array.from(semesterSelect.options).forEach((option) => {
      semesters.push({
        value: option.value,
        label: option.textContent?.trim() || option.value,
      });
    });
  }
  
  const selectedYear = yearSelect?.value;
  const selectedSemester = semesterSelect?.value;

  const model: PortalContentModel = {
    type: "midtermScore",
    title: "ข้อมูลคะแนนเก็บ",
    subtitle: header.semester ? `ภาคเรียน ${header.semester}` : undefined,
    blocks: [
      {
        type: "midtermScore",
        actionUrl,
        years,
        semesters,
        selectedYear,
        selectedSemester,
        header,
        assessments,
        courses,
        legend,
        note,
      },
    ],
  };

  return model;
}

function findMidtermScoreTable(doc: Document): HTMLTableElement | null {
  const tables = Array.from(doc.querySelectorAll<HTMLTableElement>("table"));
  
  // Find the table with the most rows and contains course information
  let bestTable: HTMLTableElement | null = null;
  let maxRows = 0;
  
  tables.forEach((table) => {
    const text = normalizeText(table.textContent || "");
    const hasRequiredHeaders = (text.includes("Course Title") || text.includes("Course No")) && 
                                (text.includes("Section"));
    
    if (hasRequiredHeaders && table.rows.length > maxRows) {
      bestTable = table;
      maxRows = table.rows.length;
    }
  });
  
  return bestTable;
}

function locateMidtermHeader(rows: HTMLTableRowElement[]) {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const cells = getRowCellData(row);
    const texts = cells.map((cell) => cell.text);
    
    // Header row should have multiple cells (at least 5: No, Course No, Title, Section, Score1)
    if (cells.length < 5) continue;
    
    const hasCourseHeader = texts.some((text) => /Course Title/i.test(text));
    const hasCourseNumber = texts.some((text) => /Course No/i.test(text));

    if (hasCourseHeader && hasCourseNumber) {
      // Find the indices of key columns
      const sectionIndex = texts.findIndex(t => /^Section$/i.test(t.trim()));
      
      // Assessments start after Section column
      let assessmentStartIndex = sectionIndex >= 0 ? sectionIndex + 1 : 4;
      const assessments = texts.slice(assessmentStartIndex).filter(Boolean);
      
      const headerRows = rows.slice(0, index);
      const header = extractMidtermHeaderInfo(headerRows);
      
      return { headerRowIndex: index, assessments, header };
    }
  }
  
  return null;
}

function getRowCellData(row: HTMLTableRowElement): ScoreCellData[] {
  const data: ScoreCellData[] = [];

  Array.from(row.cells).forEach((cell) => {
    const text = normalizeText(cell.textContent || "");
    const image = cell.querySelector<HTMLImageElement>("img");
    const imgSrc = image?.getAttribute("src") || undefined;
    const imgAlt = image
      ? normalizeText(image.getAttribute("alt") || image.getAttribute("title") || "")
      : undefined;

    // Skip separator cells (width <= 2 and no content)
    if (!text && !image) {
      const widthAttr = cell.getAttribute("width");
      if (widthAttr) {
        const widthValue = parseInt(widthAttr, 10);
        if (!Number.isNaN(widthValue) && widthValue <= 2) {
          return; // Skip this cell
        }
      }
      if (!cell.children.length) return;
    }

    // Handle colspan - add the cell only once but note it spans multiple columns
    const colspan = parseInt(cell.getAttribute("colspan") || "1", 10);
    data.push({ text, imgSrc, imgAlt });
    
    // Don't add empty entries for colspan, just use the actual cell
  });

  return data;
}

function extractMidtermHeaderInfo(rows: HTMLTableRowElement[]): ScoreboardHeader {
  const header: ScoreboardHeader = {};

  rows.forEach((row) => {
    const text = normalizeText(row.textContent || "");
    if (!text) return;

    if (!header.institution && /King Mongkut/i.test(text)) {
      header.institution = text;
      return;
    }
    if (!header.faculty && /Faculty/i.test(text)) {
      header.faculty = text;
      return;
    }

    if (text.includes("ID:")) {
      const idMatch = text.match(/ID:\s*(\d+)/);
      if (idMatch) header.studentId = idMatch[1];

      // Extract English name - everything after "Name:" until we hit Thai characters or special separators
      const nameMatch = text.match(/Name:\s*([A-Za-z.\s]+?)(?:\s{2,}|นาย|นาง|น\.ส\.|$)/);
      if (nameMatch) {
        header.studentEnglishName = nameMatch[1].trim();
      }

      // Extract Thai name - look for Thai text after English name
      const afterName = text.split(/Name:/i)[1];
      if (afterName) {
        // Remove the English name part and ID if present
        let remaining = afterName;
        if (header.studentEnglishName) {
          remaining = remaining.replace(header.studentEnglishName, "");
        }
        // Remove ID if it appears
        remaining = remaining.replace(/\d+/, "").trim();
        
        // Look for Thai characters (Unicode range for Thai: \u0E00-\u0E7F)
        const thaiMatch = remaining.match(/[\u0E00-\u0E7F\s]+/);
        if (thaiMatch) {
          header.studentThaiName = thaiMatch[0].trim();
        }
      }
      return;
    }

    if (text.includes("Major:")) {
      const majorMatch = text.match(/Major:\s*(.+?)(?:\s+Semester\/Year|$)/);
      if (majorMatch) header.major = majorMatch[1].trim();

      const semesterMatch = text.match(/Semester\/Year\s*:\s*([^\s]+)/);
      if (semesterMatch) header.semester = semesterMatch[1].trim();
    }
  });

  return header;
}

function parseMidtermCourses(
  rows: HTMLTableRowElement[],
  assessments: string[]
): ScoreCourse[] {
  const courses: ScoreCourse[] = [];

  rows.forEach((row) => {
    const cells = getRowCellData(row);
    if (cells.length === 0) return;

    const first = cells[0]?.text;
    if (!first || !/^\d+$/.test(first)) return;

    const courseNumber = cells[1]?.text || "";
    const courseTitle = cells[2]?.text || "";
    const section = cells[3]?.text || "";

    const courseAssessments = assessments.map((label, index) => {
      const cell = cells[4 + index];
      return formatScoreAssessment(cell, label);
    });

    courses.push({
      order: first,
      courseNumber,
      courseTitle,
      section,
      assessments: courseAssessments,
    });
  });

  return courses;
}

function formatScoreAssessment(cell: ScoreCellData | undefined, label: string): ScoreAssessment {
  if (!cell) {
    return {
      label,
      status: "notEntered",
      display: "ไม่มีข้อมูล",
      raw: "",
    };
  }

  if (cell.imgSrc) {
    const { status, display } = mapIconToStatus(cell.imgSrc, cell.imgAlt);
    return {
      label,
      status,
      display,
      raw: cell.imgAlt || cell.imgSrc,
    };
  }

  if (!cell.text) {
    return {
      label,
      status: "notEntered",
      display: "ไม่มีข้อมูล",
      raw: "",
    };
  }

  if (cell.text === "-") {
    return {
      label,
      status: "notEntered",
      display: "ไม่มีข้อมูล",
      raw: cell.text,
    };
  }

  return {
    label,
    status: "score",
    display: cell.text,
    raw: cell.text,
  };
}

function mapIconToStatus(src: string, alt?: string): { status: ScoreStatus; display: string } {
  const filename = src.split("/").pop()?.toLowerCase() || "";

  if (filename.includes("process")) {
    return {
      status: "processing",
      display: alt || "อยู่ระหว่างออกคะแนน",
    };
  }

  if (filename.includes("fail")) {
    return {
      status: "notAnnounced",
      display: alt || "ยังไม่ประกาศคะแนน",
    };
  }

  return {
    status: "notEntered",
    display: alt || "ไม่มีข้อมูล",
  };
}

function extractMidtermLegend(doc: Document): ScoreLegendItem[] {
  const tables = Array.from(doc.querySelectorAll<HTMLTableElement>("table"));
  const legendTable = tables.find((table) => {
    const text = normalizeText(table.textContent || "");
    return text.includes("สัญลักษณ์") && text.includes("ความหมาย");
  });

  if (!legendTable) return [];

  const legend: ScoreLegendItem[] = [];
  const rows = Array.from(legendTable.rows).slice(1);

  rows.forEach((row) => {
    const cells = getRowCellData(row);
    if (cells.length < 2) return;

    const symbolCell = cells[0];
    const description = cells[cells.length - 1]?.text || "";
    if (!description) return;

    legend.push(mapLegendItem(symbolCell, description));
  });

  return legend;
}

function mapLegendItem(cell: ScoreCellData, description: string): ScoreLegendItem {
  if (cell.imgSrc) {
    const { status, display } = mapIconToStatus(cell.imgSrc, cell.imgAlt);
    return {
      status,
      label: display,
      description,
    };
  }

  if (cell.text === "-") {
    return {
      status: "notEntered",
      label: "-",
      description,
    };
  }

  return {
    status: "score",
    label: cell.text,
    description,
  };
}

function extractMidtermNote(doc: Document): string | undefined {
  const paragraphs = Array.from(doc.querySelectorAll("p, strong"));
  for (const element of paragraphs) {
    const text = normalizeText(element.textContent || "");
    if (text.startsWith("หมายเหตุ")) {
      return text;
    }
  }
  return undefined;
}

function extractTranscriptContent(doc: Document): PortalContentModel | null {
  try {
    // Use windows-874 decoder to fix encoding issues
    const tables = Array.from(doc.querySelectorAll("table"));
    if (tables.length === 0) return null;

    // Find main table with transcript data
    const mainTable = tables.find(table => {
      const text = table.textContent || "";
      return text.includes("COURSE TITLE") && text.includes("CREDIT") && text.includes("GRADE");
    });

    if (!mainTable) return null;

    // Find PDF URL
    const pdfLink = doc.querySelector<HTMLAnchorElement>("a[href*='transcript_pdf']");
    const pdfUrl = pdfLink?.href;

    return {
      type: "transcript",
      title: "ทรานสคริปต์",
      blocks: [
        {
          type: "transcript",
          actionUrl: "report_transcript_show2.php",
          pdfUrl,
        },
      ],
    };
  } catch (error) {
    return null;
  }
}

function extractGradeReportContent(doc: Document): PortalContentModel | null {
  const tables = Array.from(doc.querySelectorAll("table"));
  
  // Find course table (contains "Course No." and "Course Title" headers)
  const courseTable = findGradeReportCourseTable(tables);
  
  // Check if this is the form page or results page
  const isFormPage = !courseTable;
  const isResultsPage = !!courseTable;

  // Always extract form data if available on current page
  let form = doc.querySelector<HTMLFormElement>("form[name='edit']");
  
  let actionUrl = "report_gradetable_show.php";
  let years: ScheduleOption[] = [];
  let semesters: ScheduleOption[] = [];
  let selectedYear: string | undefined;
  let selectedSemester: string | undefined;

  // Try to extract from current page
  if (form) {
    actionUrl = form.getAttribute("action") || actionUrl;
    
    const yearSelect = form.querySelector<HTMLSelectElement>("select[name='year']");
    
    if (yearSelect) {
      Array.from(yearSelect.options).forEach((option) => {
        years.push({
          value: option.value,
          label: option.textContent?.trim() || option.value,
        });
      });
      selectedYear = yearSelect.value;
    }

    const semesterSelect = form.querySelector<HTMLSelectElement>("select[name='semester']");
    
    if (semesterSelect) {
      Array.from(semesterSelect.options).forEach((option) => {
        semesters.push({
          value: option.value,
          label: option.textContent?.trim() || option.value,
        });
      });
      selectedSemester = semesterSelect.value;
    }
  }

  // If this is form page only, return form UI with empty data
  // The component will handle fetching default data
  if (isFormPage) {
    const gradeReportBlock: GradeReportBlock = {
      type: "gradeReport",
      actionUrl,
      years,
      semesters,
      selectedYear,
      selectedSemester,
      courses: [],
      summaries: [],
      legend: [],
    };

    return {
      type: "gradeReport",
      title: "ข้อมูลผลการเรียน",
      subtitle: "เลือกปีการศึกษาและภาคเรียนเพื่อดูผลการเรียน",
      blocks: [gradeReportBlock],
    };
  }

  // This is the results page - extract all data
  const header = extractGradeReportHeader(courseTable!);
  const courses = extractGradeReportCourses(courseTable!);
  
  // Summary is in a separate table (after course table)
  const summaryTable = findGradeReportSummaryTable(tables);
  const summaries = summaryTable ? extractGradeReportSummaries(summaryTable) : [];
  
  // Legend is in a separate table
  const legendTable = findGradeReportLegendTable(tables);
  const legend = legendTable ? extractGradeReportLegend(legendTable) : [];
  const note = extractGradeReportNote(doc);
  const pdfLink = doc.querySelector<HTMLAnchorElement>("a[href*='report_gradetable_pdf']");
  const pdfUrl = pdfLink?.getAttribute("href") || undefined;

  // If results page doesn't have form selectors, parse from header and create full option lists
  if (years.length === 0 && header?.semester) {
    // Parse semester like "1/2568" to extract year and semester
    const semesterMatch = header.semester.match(/(\d+)\/(\d+)/);
    if (semesterMatch) {
      selectedSemester = semesterMatch[1];
      selectedYear = semesterMatch[2];
      
      // Create full option lists (common academic years and semesters)
      const currentYear = parseInt(selectedYear);
      for (let i = 0; i <= 2; i++) {
        const year = (currentYear - i).toString();
        years.push({ value: year, label: year });
      }
      
      // Standard semesters: 1, 2, 3 (summer)
      semesters.push({ value: "1", label: "1" });
      semesters.push({ value: "2", label: "2" });
      semesters.push({ value: "3", label: "3" });
    }
  }

  const gradeReportBlock: GradeReportBlock = {
    type: "gradeReport",
    actionUrl,
    pdfUrl,
    years,
    semesters,
    selectedYear,
    selectedSemester,
    header,
    courses,
    summaries,
    legend,
    note,
  };

  return {
    type: "gradeReport",
    title: "ข้อมูลผลการเรียน",
    subtitle: header ? `${header.semester}` : undefined,
    blocks: [gradeReportBlock],
  };
}

function findGradeReportCourseTable(tables: HTMLTableElement[]): HTMLTableElement | null {
  let bestTable: HTMLTableElement | null = null;
  let maxDataRows = 0;
  
  for (const table of tables) {
    const headerText = normalizeText(table.textContent || "");
    
    // Look for distinctive grade report headers
    if (headerText.includes("Course No") && headerText.includes("Grade") && 
        (headerText.includes("Course Title") || headerText.includes("Section"))) {
      
      // Count rows with multiple cells (actual data rows, not wrappers)
      let dataRowCount = 0;
      for (const row of Array.from(table.rows)) {
        if (row.cells.length > 5) {
          dataRowCount++;
        }
      }
      
      // Use table with most data rows
      if (dataRowCount > maxDataRows) {
        bestTable = table;
        maxDataRows = dataRowCount;
      }
    }
  }
  
  return bestTable;
}

function findGradeReportSummaryTable(tables: HTMLTableElement[]): HTMLTableElement | null {
  // Summary table has CA, CP, CD, GP, GPS/GPA, Status headers
  // It's a smaller table (not the main course table)
  for (const table of tables) {
    const rows = Array.from(table.rows);
    
    // Skip large course table (has many rows)
    if (rows.length > 15) continue;
    
    // Check if first or second row has CA, CP, GP headers
    for (let i = 0; i < Math.min(3, rows.length); i++) {
      const text = normalizeText(rows[i].textContent || "");
      if (text.includes("CA") && text.includes("CP") && text.includes("GP")) {
        return table;
      }
    }
  }
  
  return null;
}

function findGradeReportLegendTable(tables: HTMLTableElement[]): HTMLTableElement | null {
  // Legend table has specific structure:
  // - Has <font color="...">X</font> patterns
  // - Small table (< 10 rows)
  // - 2 columns per row (Symbol | Description)
  for (const table of tables) {
    // Check if this table has font elements with X symbols
    const fontElements = table.querySelectorAll("font[color]");
    let hasXSymbol = false;
    
    for (const font of Array.from(fontElements)) {
      if (font.textContent?.trim() === "X") {
        hasXSymbol = true;
        break;
      }
    }
    
    if (!hasXSymbol) continue;
    
    const rows = Array.from(table.rows);
    
    // Legend table should be small (< 10 rows)
    if (rows.length > 10) continue;
    
    // Check if rows have 2 columns (not 13 like course table)
    let hasTwoColumns = false;
    for (const row of rows) {
      if (row.cells.length === 2) {
        hasTwoColumns = true;
        break;
      }
    }
    
    if (hasTwoColumns) {
      return table;
    }
  }
  
  return null;
}

function extractGradeReportHeader(table: HTMLTableElement): ScoreboardHeader | undefined {
  const rows = Array.from(table.rows);
  
  const header: ScoreboardHeader = {};

  for (const row of rows) {
    // Skip separator rows
    if (row.cells.length === 1 && row.cells[0].getAttribute("height") === "1") {
      continue;
    }
    
    const text = normalizeText(row.textContent || "");
    if (!text) continue;
    
    // Institution row
    if (text.includes("King Mongkut")) {
      header.institution = text;
      continue;
    }
    
    // Faculty row
    if (text.includes("Faculty of") && !text.includes("ID:")) {
      header.faculty = text.replace(/^Faculty of\s*/i, "").trim();
      continue;
    }
    
    // ID and Name row (in single colspan cell)
    if (text.includes("ID:") && text.includes("Name:")) {
      // Extract ID
      const idMatch = text.match(/ID:\s*(\d+)/);
      if (idMatch) {
        header.studentId = idMatch[1];
      }
      
      // Extract English name and Thai name
      // English name continues until we hit Thai characters
      const nameMatch = text.match(/Name:\s*([A-Za-z.\s]+?)\s+([\u0E00-\u0E7F][\u0E00-\u0E7F\s]*)/);
      if (nameMatch) {
        header.studentEnglishName = nameMatch[1].replace(/\s+/g, ' ').trim();
        header.studentThaiName = nameMatch[2].replace(/\s+/g, ' ').trim();
      } else {
        // Fallback: try to extract just English name (everything after Name: until end or Thai char)
        const englishOnly = text.match(/Name:\s*([A-Za-z.\s]+?)(?:\s*[\u0E00-\u0E7F]|$)/);
        if (englishOnly) {
          header.studentEnglishName = englishOnly[1].replace(/\s+/g, ' ').trim();
        }
      }
      
      continue;
    }
    
    // Major and Semester row
    if (text.includes("Major:") && text.includes("Semester/Year")) {
      const majorMatch = text.match(/Major:\s*(.+?)\s+Semester\/Year/);
      if (majorMatch) header.major = majorMatch[1].trim();
      
      const semesterMatch = text.match(/Semester\/Year\s*:\s*(\d+\/\d+)/);
      if (semesterMatch) header.semester = semesterMatch[1];
      
      continue;
    }
  }

  return header.studentId ? header : undefined;
}

function extractGradeReportCourses(table: HTMLTableElement): GradeReportCourse[] {
  const rows = Array.from(table.rows);
  const courses: GradeReportCourse[] = [];
  
  // Find header row
  let headerIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const text = normalizeText(rows[i].textContent || "");
    if (text.includes("No.") && text.includes("Course No.") && text.includes("Grade")) {
      headerIndex = i;
      break;
    }
  }
  
  if (headerIndex === -1) return courses;
  
  // Parse course rows (skip separator rows)
  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    
    // Skip separator rows (height="1" or empty single cell)
    const heightAttr = row.getAttribute("height");
    if (heightAttr === "1") continue;
    if (row.cells.length === 1 && !normalizeText(row.cells[0].textContent || "")) continue;
    
    const cells = Array.from(row.cells);
    
    // Filter out separator cells (width="1" or very narrow widths)
    const dataCells = cells.filter(cell => {
      const width = cell.getAttribute("width");
      if (width) {
        const widthNum = parseInt(width);
        if (widthNum <= 1) return false;
      }
      const bgcolor = cell.getAttribute("bgcolor");
      if (bgcolor === "#FFFFFF" && !normalizeText(cell.textContent || "")) {
        return false;
      }
      return true;
    });
    
    if (dataCells.length < 7) continue;
    
    const cellTexts = dataCells.map(cell => normalizeText(cell.textContent || ""));
    
    // Filter out empty separator values
    const nonEmptyCells = cellTexts.filter(text => text !== "");
    
    // Check if this is a data row
    // Need at least 6 columns: No, Course No, Title, Section, Credit, Type (Grade is optional)
    if (nonEmptyCells.length < 6 || !/^\d+$/.test(nonEmptyCells[0])) {
      continue;
    }
    
    const course: GradeReportCourse = {
      no: nonEmptyCells[0] || "",
      courseNo: nonEmptyCells[1] || "",
      courseTitle: nonEmptyCells[2] || "",
      section: nonEmptyCells[3] || "",
      credit: nonEmptyCells[4] || "",
      type: nonEmptyCells[5] || "",
      grade: nonEmptyCells[6] || "-",
    };
    
    // Skip rows with empty courseNo
    if (!course.courseNo) continue;
    
    courses.push(course);
  }
  
  return courses;
}

function extractGradeReportSummaries(table: HTMLTableElement): GradeReportSummary[] {
  const rows = Array.from(table.rows);
  const summaries: GradeReportSummary[] = [];
  
  // Find header row
  let headerIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const text = normalizeText(rows[i].textContent || "");
    if (text.includes("CA") && text.includes("CP") && text.includes("GP")) {
      headerIndex = i;
      break;
    }
  }
  
  if (headerIndex === -1) return summaries;
  
  // Parse summary rows (same filtering as course table)
  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    
    // Skip separator rows
    const heightAttr = row.getAttribute("height");
    if (heightAttr === "1") continue;
    
    // Skip single empty cell rows
    if (row.cells.length === 1 && !row.cells[0].textContent?.trim()) {
      continue;
    }
    
    const cells = Array.from(row.cells);
    
    // Filter separator cells (same as course extraction)
    const dataCells = cells.filter(cell => {
      const width = cell.getAttribute("width");
      if (width && parseInt(width) <= 1) return false;
      
      const bgcolor = cell.getAttribute("bgcolor");
      const text = normalizeText(cell.textContent || "");
      if (bgcolor === "#FFFFFF" && !text) return false;
      
      return true;
    });
    
    // Map to text and filter empties
    const cellTexts = dataCells.map(cell => normalizeText(cell.textContent || ""));
    const nonEmptyCells = cellTexts.filter(text => text !== "");
    
    // Pre-Semester row has only 3 fields (label, GP, GPA), others have 7
    // Must have at least label and some data
    if (nonEmptyCells.length < 1) continue;
    
    // Check if this is Pre-Semester (only has label + 2 numeric values)
    if (nonEmptyCells.length === 3 && nonEmptyCells[0].includes("Pre")) {
      const summary: GradeReportSummary = {
        label: nonEmptyCells[0] || "",
        ca: "",
        cp: "",
        cd: "",
        gp: nonEmptyCells[1] || "",
        gpsGpa: nonEmptyCells[2] || "",
        status: "",
      };
      
      summaries.push(summary);
      continue;
    }
    
    // Regular rows need at least 7 fields: label, CA, CP, CD, GP, GPS/GPA, Status
    if (nonEmptyCells.length < 7) continue;
    
    const summary: GradeReportSummary = {
      label: nonEmptyCells[0] || "",
      ca: nonEmptyCells[1] || "",
      cp: nonEmptyCells[2] || "",
      cd: nonEmptyCells[3] || "",
      gp: nonEmptyCells[4] || "",
      gpsGpa: nonEmptyCells[5] || "",
      status: nonEmptyCells[6] || "",
    };
    
    // Must have a label
    if (!summary.label) continue;
    
    summaries.push(summary);
  }
  
  return summaries;
}

function extractGradeReportLegend(table: HTMLTableElement): GradeReportLegendItem[] {
  const rows = Array.from(table.rows);
  const legend: GradeReportLegendItem[] = [];
  
  // Skip header row and parse legend items
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const cells = Array.from(row.cells);
    
    if (cells.length < 2) continue;
    
    // Skip rows with colspan (note rows)
    if (cells[0].getAttribute("colspan")) continue;
    
    const symbolCell = cells[0];
    const descCell = cells[1];
    
    const symbolText = normalizeText(symbolCell.textContent || "");
    const description = normalizeText(descCell.textContent || "");
    
    if (!description) continue;
    
    // Check for colored X symbols
    const fontElement = symbolCell.querySelector("font");
    const colorAttr = fontElement?.getAttribute("color");
    
    let symbolColor = "gray";
    if (colorAttr) {
      if (colorAttr.toLowerCase().includes("00ff00")) {
        symbolColor = "green";
      } else if (colorAttr.toLowerCase().includes("ff0000")) {
        symbolColor = "red";
      }
    }
    
    legend.push({
      symbol: symbolText,
      symbolColor,
      description,
    });
  }
  
  return legend;
}

function extractGradeReportNote(doc: Document): string | undefined {
  // Look for note in actual legend table (small table with X symbols and 2 columns)
  const tables = Array.from(doc.querySelectorAll("table"));
  
  for (const table of tables) {
    const rows = Array.from(table.rows);
    
    // Legend table should be small (< 10 rows) and have X symbols
    if (rows.length > 10) continue;
    
    // Check if this table has X symbols with colors
    const hasXSymbol = Array.from(table.querySelectorAll("font[color]")).some(
      font => font.textContent?.trim() === "X"
    );
    if (!hasXSymbol) continue;
    
    // Look for colspan cell in this table
    for (const row of rows) {
      const cell = row.querySelector("td[colspan]");
      if (cell) {
        const text = normalizeText(cell.textContent || "");
        
        // Note should be long text (> 100 chars) and not contain ID/Name/Faculty
        if (text && text.length > 100 && !text.includes("ID:") && !text.includes("Name:") && !text.includes("Faculty") && !text.includes("Major:")) {
          return text;
        }
      }
    }
  }
  
  return undefined;
}
