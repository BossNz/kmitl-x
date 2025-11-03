<script lang="ts">
  import Icon from "@iconify/svelte";
  import type { ScoreboardBlock, ScoreStatus } from "../../utils/PortalContentMapper";
  import { classes, cn } from '../../styles';

  export let block: ScoreboardBlock;

  type StatusMeta = {
    icon: string;
    bg: string;
    border: string;
    text: string;
  };

  const STATUS_META: Record<ScoreStatus, StatusMeta> = {
    score: {
      icon: "ph:check-circle-duotone",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      border: "border-emerald-400/30 dark:border-emerald-400/25",
      text: "text-emerald-600 dark:text-emerald-300",
    },
    processing: {
      icon: "ph:clock-duotone",
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
      border: "border-amber-400/30 dark:border-amber-400/20",
      text: "text-amber-600 dark:text-amber-200",
    },
    notAnnounced: {
      icon: "ph:x-circle-duotone",
      bg: "bg-rose-500/10 dark:bg-rose-500/15",
      border: "border-rose-400/30 dark:border-rose-400/25",
      text: "text-rose-600 dark:text-rose-200",
    },
    notEntered: {
      icon: "ph:dots-three-circle-duotone",
      bg: "bg-zinc-500/10 dark:bg-zinc-500/20",
      border: "border-zinc-400/30 dark:border-zinc-500/25",
      text: "text-zinc-600 dark:text-zinc-200",
    },
  };

  function getStatusMeta(status: ScoreStatus | "score"): StatusMeta {
    if (status === "score") return STATUS_META.score;
    return STATUS_META[status];
  }

  function hasHeaderInfo(block: ScoreboardBlock): boolean {
    const header = block.header;
    if (!header) return false;
    return Boolean(
      header.institution ||
        header.faculty ||
        header.studentId ||
        header.studentEnglishName ||
        header.studentThaiName ||
        header.major ||
        header.semester
    );
  }
</script>

<div class="space-y-6">
  {#if hasHeaderInfo(block)}
    <section class={cn(classes.card.base, 'px-5 py-5')}>
      <div class="space-y-3">
        {#if block.header?.institution}
          <p class={classes.text.labelOrange}>{block.header.institution}</p>
        {/if}
        {#if block.header?.faculty}
          <h3 class={classes.text.heading2}>{block.header.faculty}</h3>
        {/if}
        <div class={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', classes.text.body)}>
          {#if block.header?.studentEnglishName}
            <div>
              <p class={classes.text.caption}>Name (EN)</p>
              <p class={cn(classes.text.body, 'font-semibold')}>{block.header.studentEnglishName}</p>
            </div>
          {/if}
          {#if block.header?.studentThaiName}
            <div>
              <p class={classes.text.caption}>ชื่อ (TH)</p>
              <p class={cn(classes.text.body, 'font-semibold')}>{block.header.studentThaiName}</p>
            </div>
          {/if}
          {#if block.header?.studentId}
            <div>
              <p class={classes.text.caption}>รหัสนักศึกษา</p>
              <p class={cn(classes.text.body, 'font-semibold')}>{block.header.studentId}</p>
            </div>
          {/if}
          {#if block.header?.major}
            <div class="sm:col-span-2 lg:col-span-1">
              <p class={classes.text.caption}>หลักสูตร</p>
              <p class={cn(classes.text.body, 'font-semibold')}>{block.header.major}</p>
            </div>
          {/if}
          {#if block.header?.semester}
            <div>
              <p class={classes.text.caption}>ภาคเรียน/ปี</p>
              <p class={cn(classes.text.body, 'font-semibold')}>{block.header.semester}</p>
            </div>
          {/if}
        </div>
      </div>
    </section>
  {/if}

  <section class={cn(classes.card.base, 'overflow-hidden')}>
    <div class="overflow-x-auto">
      <table class={classes.table.base}>
        <thead class={classes.table.header}>
          <tr>
            <th class={cn(classes.table.th, 'border border-orange-400/60 dark:border-orange-500/50')}>No.</th>
            <th class={cn(classes.table.th, 'border border-orange-400/60 dark:border-orange-500/50')}>รายวิชา</th>
            <th class={cn(classes.table.th, 'text-center border border-orange-400/60 dark:border-orange-500/50')}>Section</th>
            {#each block.assessments as assessment}
              <th class={cn(classes.table.th, 'text-center border border-orange-400/60 dark:border-orange-500/50')}>{assessment}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each block.courses as course, index}
            <tr class={index % 2 === 1 ? "bg-orange-50/70 dark:bg-orange-900/20 backdrop-blur-sm" : "bg-white/95 dark:bg-transparent backdrop-blur-sm"}>
              <td class="px-4 py-3 align-top text-sm font-semibold text-orange-600 dark:text-orange-400 border border-gray-200/60 dark:border-gray-700/50">{course.order}</td>
              <td class="px-4 py-3 align-top border border-gray-200/60 dark:border-gray-700/50">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">{course.courseNumber}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{course.courseTitle}</p>
              </td>
              <td class="px-4 py-3 align-top text-center text-sm text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/50">
                {course.section || "-"}
              </td>
              {#each course.assessments as assessment}
                <td class="px-4 py-3 text-center border border-gray-200/60 dark:border-gray-700/50">
                  {#if assessment.status === "score"}
                    <span class={`${getStatusMeta("score").bg} ${getStatusMeta("score").border} ${getStatusMeta("score").text} inline-flex min-w-[3.5rem] items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold backdrop-blur-sm`}>{assessment.display}</span>
                  {:else}
                    <span class={`${getStatusMeta(assessment.status).bg} ${getStatusMeta(assessment.status).border} ${getStatusMeta(assessment.status).text} inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold backdrop-blur-sm`}>
                      <Icon icon={getStatusMeta(assessment.status).icon} class="text-sm" />
                      {assessment.display}
                    </span>
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  {#if block.legend.length}
    <section class="space-y-3">
      <p class="text-xs uppercase text-orange-600 dark:text-orange-400 tracking-wide">คำอธิบายสัญลักษณ์</p>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {#each block.legend as item}
          <div class="rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/40 backdrop-blur-sm px-4 py-3 space-y-2 shadow-sm">
            <span class={`${getStatusMeta(item.status).bg} ${getStatusMeta(item.status).border} ${getStatusMeta(item.status).text} inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-sm`}> 
              {#if item.status !== "score"}
                <Icon icon={getStatusMeta(item.status).icon} class="text-sm" />
              {/if}
              {item.label}
            </span>
            <p class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{item.description}</p>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  {#if block.note}
    <section class="rounded-xl border border-amber-200/70 dark:border-amber-600/50 bg-amber-50/70 dark:bg-amber-900/20 backdrop-blur-sm px-5 py-4 text-sm text-amber-800 dark:text-amber-200 shadow-sm">
      {block.note}
    </section>
  {/if}
</div>
