<script lang="ts">
  import Icon from "@iconify/svelte";
  import InfoBlock from "./InfoBlock.svelte";
  import Scoreboard from "./Scoreboard.svelte";
  import MidtermScore from "./MidtermScore.svelte";
  import GradeReport from "./GradeReport.svelte";
  import Transcript from "./Transcript.svelte";
  import NewsList from "./NewsList.svelte";
  import ScheduleTable from "./ScheduleTable.svelte";
  import ExamTable from "./ExamTable.svelte";
  import MinorProgramPage from "./MinorProgramPage.svelte";
  import RegistrationEligibility from "./RegistrationEligibility.svelte";
  import type { PortalContentModel, PortalBlock } from "../../types";
  import { classes, cn } from '../../styles';

  export let model: PortalContentModel;

  // Design System Typography Scale
  const headingScale: Record<number, string> = {
    1: classes.text.heading1,
    2: classes.text.heading2,
    3: classes.text.heading3,
    4: "text-base md:text-lg font-semibold text-gray-900 dark:text-white",
  };

  // Design System Note Styles
  const noteToneStyles = {
    info: {
      container: classes.note.info,
      icon: "ph:info-duotone",
      iconColor: "text-orange-600 dark:text-orange-400",
      textColor: "text-orange-800 dark:text-orange-200",
    },
    warning: {
      container: classes.note.warning,
      icon: "ph:warning-duotone",
      iconColor: "text-amber-600 dark:text-amber-400",
      textColor: "text-amber-800 dark:text-amber-200",
    },
  } as const;

  function getHeadingScale(level: number) {
    return headingScale[level] ?? headingScale[3];
  }
</script>

<div class="space-y-6">
  {#if model.subtitle}
    <p class={classes.text.bodySecondary}>{model.subtitle}</p>
  {/if}

  {#each model.blocks as block, index (index)}
    {#if block.type === "heading"}
      {#if block.level === 1}
        <h1 class={getHeadingScale(block.level)}>
          {block.text}
        </h1>
      {:else if block.level === 2}
        <h2 class={getHeadingScale(block.level)}>
          {block.text}
        </h2>
      {:else if block.level === 3}
        <h3 class={getHeadingScale(block.level)}>
          {block.text}
        </h3>
      {:else}
        <h4 class={getHeadingScale(block.level)}>
          {block.text}
        </h4>
      {/if}
    {:else if block.type === "paragraph"}
      <p class={classes.text.body}>
        {block.text}
      </p>
    {:else if block.type === "list"}
      {#if block.ordered}
        <ol class={cn("list-decimal pl-6 space-y-2", classes.text.body)}>
          {#each block.items as item}
            <li>{item}</li>
          {/each}
        </ol>
      {:else}
        <ul class={cn("list-disc pl-6 space-y-2", classes.text.body)}>
          {#each block.items as item}
            <li>{item}</li>
          {/each}
        </ul>
      {/if}
    {:else if block.type === "keyValue"}
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {#each block.items as item}
          <InfoBlock label={item.label} value={item.value} />
        {/each}
      </div>
    {:else if block.type === "table"}
      <div class={classes.table.wrapper}>
        <table class={classes.table.base}>
          {#if block.headers.length}
            <thead class={classes.table.header}>
              <tr>
                {#each block.headers as header}
                  <th class={classes.table.th}>
                    {header}
                  </th>
                {/each}
              </tr>
            </thead>
          {/if}
          <tbody class={classes.table.body}>
            {#each block.rows as row, rowIndex}
              <tr class={classes.table.row}>
                {#each row as cell}
                  <td class={classes.table.cell}>
                    {cell || "-"}
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else if block.type === "links"}
      <div class="flex flex-wrap gap-3">
        {#each block.items as link}
          <a
            class={cn(classes.button.primary, 'inline-flex items-center gap-2')}
            href={link.href}
            target="_blank"
            rel="noopener"
          >
            <span>{link.label}</span>
            <Icon icon="ph:arrow-up-right" class="w-5 h-5" />
          </a>
        {/each}
      </div>
    {:else if block.type === "scoreboard"}
      <Scoreboard block={block} />
    {:else if block.type === "midtermScore"}
      <MidtermScore 
        actionUrl={block.actionUrl || ""}
        years={block.years || []}
        semesters={block.semesters || []}
        selectedYear={block.selectedYear}
        selectedSemester={block.selectedSemester}
        header={block.header}
        assessments={block.assessments || []}
        courses={block.courses || []}
        legend={block.legend || []}
        note={block.note || ""}
      />
    {:else if block.type === "gradeReport"}
      <GradeReport 
        actionUrl={block.actionUrl || ""}
        pdfUrl={block.pdfUrl}
        years={block.years || []}
        semesters={block.semesters || []}
        selectedYear={block.selectedYear}
        selectedSemester={block.selectedSemester}
        header={block.header}
        courses={block.courses || []}
        summaries={block.summaries || []}
        legend={block.legend || []}
        note={block.note}
      />
    {:else if block.type === "transcript"}
      <Transcript 
        actionUrl={block.actionUrl || ""}
        pdfUrl={block.pdfUrl}
      />
    {:else if block.type === "newsList"}
      <NewsList block={block} />
    {:else if block.type === "scheduleTable"}
      <ScheduleTable block={block} />
    {:else if block.type === "examTable"}
      <ExamTable block={block} />
    {:else if block.type === "minorProgram"}
      <MinorProgramPage sourceUrl={block.sourceUrl} />
    {:else if block.type === "registrationEligibility"}
      <RegistrationEligibility 
        studentId={block.studentId || ""}
        studentName={block.studentName || ""}
        semester={block.semester || ""}
        hasEligibility={block.hasEligibility ?? true}
        compact={false}
      />
    {:else if block.type === "note"}
      <div class={noteToneStyles[block.tone].container}>
        <Icon icon={noteToneStyles[block.tone].icon} class={`w-5 h-5 flex-shrink-0 ${noteToneStyles[block.tone].iconColor}`} />
        <span class={cn("text-base leading-relaxed", noteToneStyles[block.tone].textColor)}>{block.text}</span>
      </div>
    {:else if block.type === "divider"}
      <div class="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
    {/if}
  {/each}
</div>
