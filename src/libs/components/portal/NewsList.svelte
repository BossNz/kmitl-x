<script lang="ts">
  import Icon from "@iconify/svelte";
  import type { NewsListBlock, NewsItem } from "../../types";
  import { classes, cn } from '../../styles';
  import { Button } from '../common';

  export let block: NewsListBlock;

  const ITEMS_PER_PAGE = 10;
  let currentPage = 1;

  $: totalPages = Math.ceil(block.items.length / ITEMS_PER_PAGE);
  $: startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  $: endIndex = startIndex + ITEMS_PER_PAGE;
  $: paginatedItems = block.items.slice(startIndex, endIndex);

  function openNews(href: string) {
    window.open(href, "_blank", "noopener");
  }

  function goToPage(page: number) {
    currentPage = page;
  }

  function nextPage() {
    if (currentPage < totalPages) {
      currentPage++;
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      currentPage--;
    }
  }
</script>

<div class="space-y-4">
  {#if block.title}
    <div class="flex items-center gap-3">
      <div class={classes.button.icon}>
        <Icon icon="ph:megaphone-duotone" class="text-xl" />
      </div>
      <div>
        <p class={classes.text.labelOrange}>ข่าวประชาสัมพันธ์</p>
        <h3 class={classes.text.heading3}>{block.title}</h3>
      </div>
    </div>
  {/if}

  <div class="space-y-2">
    {#each paginatedItems as item, index}
      <button
        class={cn(
          classes.card.base,
          'group w-full px-5 py-4 text-left',
          'hover:border-orange-400/60 hover:bg-orange-50/70 hover:shadow-sm dark:hover:bg-orange-900/20'
        )}
        on:click={() => openNews(item.href)}
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex-1 space-y-1.5">
            <div class="flex items-start gap-2">
              <span class={cn(
                classes.badge.primary,
                'mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold'
              )}>
                {startIndex + index + 1}
              </span>
              <h4 class={cn(
                classes.text.body,
                'flex-1 font-medium leading-relaxed group-hover:text-orange-600 dark:group-hover:text-orange-400'
              )}>
                {item.title}
              </h4>
            </div>
            {#if item.date}
              <div class="flex items-center gap-2 pl-8">
                <Icon icon="ph:clock-duotone" class="text-sm text-orange-600 dark:text-orange-400" />
                <p class={classes.text.caption}>{item.date}</p>
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

  {#if totalPages > 1}
    <div class="flex items-center justify-between pt-4">
      <div class={classes.text.bodySecondary}>
        แสดง {startIndex + 1}-{Math.min(endIndex, block.items.length)} จาก {block.items.length} รายการ
      </div>
      
      <div class="flex items-center gap-2">
        <button
          class={cn(
            classes.button.secondary,
            'flex h-9 w-9 items-center justify-center rounded-lg',
            'disabled:opacity-40 disabled:hover:bg-white/90 dark:disabled:hover:bg-gray-700/80'
          )}
          on:click={prevPage}
          disabled={currentPage === 1}
        >
          <Icon icon="ph:caret-left-bold" class="text-base" />
        </button>

        <div class="flex items-center gap-1">
          {#each Array(totalPages) as _, pageIndex}
            {@const page = pageIndex + 1}
            {#if page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)}
              <button
                class={cn(
                  'flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border px-2 text-sm font-medium transition-all backdrop-blur-sm',
                  page === currentPage
                    ? 'border-orange-500/60 bg-orange-500/90 text-white shadow-sm shadow-orange-500/25'
                    : cn(classes.button.secondary, 'min-w-[2.25rem]')
                )}
                on:click={() => goToPage(page)}
              >
                {page}
              </button>
            {:else if page === currentPage - 2 || page === currentPage + 2}
              <span class="px-2 text-gray-500 dark:text-gray-400">...</span>
            {/if}
          {/each}
        </div>

        <button
          class={cn(
            classes.button.secondary,
            'flex h-9 w-9 items-center justify-center rounded-lg',
            'disabled:opacity-40 disabled:hover:bg-white/90 dark:disabled:hover:bg-gray-700/80'
          )}
          on:click={nextPage}
          disabled={currentPage === totalPages}
        >
          <Icon icon="ph:caret-right-bold" class="text-base" />
        </button>
      </div>
    </div>
  {/if}

  {#if block.items.length === 0}
    <div class={cn(
      classes.note.warning,
      'rounded-xl border-dashed px-6 py-10 text-center text-sm'
    )}>
      ไม่มีข่าวประชาสัมพันธ์ในขณะนี้
    </div>
  {/if}
</div>
