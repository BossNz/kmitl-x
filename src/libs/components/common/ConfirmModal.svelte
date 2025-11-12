<script lang="ts">
  import Icon from "@iconify/svelte";
  import { fade, scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { classes, cn } from '../../styles';
  
  export let isOpen = false;
  export let title = "";
  export let url = "";
  export let onConfirm: () => void;
  export let onCancel: () => void;

  function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  }
</script>

{#if isOpen}
  <div 
    class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    on:click={handleOverlayClick}
    on:keydown={(e) => e.key === "Escape" && onCancel()}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    transition:fade={{ duration: 200 }}
  >
    <div 
      class={cn(
        "modal-content relative w-full max-w-md mx-4 rounded-2xl border border-orange-100/70 dark:border-orange-500/20",
        "bg-gradient-to-b from-white/95 to-orange-50/70 dark:from-gray-900/95 dark:to-gray-900/90",
        "backdrop-blur-sm shadow-2xl overflow-hidden"
      )}
      transition:scale={{ duration: 300, easing: cubicOut, start: 0.95 }}
    >
      <!-- Header -->
      <div class={cn(
        "border-b border-orange-100/70 dark:border-orange-500/20",
        "bg-gradient-to-br from-orange-50/90 to-orange-100/50 dark:from-orange-500/10 dark:to-orange-500/5",
        "px-6 py-4"
      )}>
        <div class="flex items-center gap-3">
          <div class={classes.button.icon}>
            <Icon icon="ph:arrow-square-out-duotone" class="text-xl" />
          </div>
          <div>
            <h3 class={classes.text.heading3}>เปิดหน้าต่างใหม่</h3>
            <p class={classes.text.caption}>ยืนยันการเปิดหน้าต่างภายนอก</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="px-6 py-6 space-y-4">
        <div class="space-y-2">
          <p class={cn(classes.text.bodySecondary, 'font-medium')}>
            คุณต้องการเปิดหน้านี้ในหน้าต่างใหม่ใช่หรือไม่?
          </p>
          <div class={cn(
            classes.note.info,
            'rounded-xl px-4 py-3'
          )}>
            <div class="flex-1">
              <p class={cn(classes.text.labelOrange, 'mb-1')}>เมนู</p>
              <p class={cn(classes.text.bodySecondary, 'font-semibold break-words')}>{title}</p>
            </div>
          </div>
        </div>

        {#if url}
          <div class={cn(
            classes.card.base,
            'px-3 py-2'
          )}>
            <p class={cn(classes.text.caption, 'mb-1')}>URL</p>
            <p class={cn(classes.text.caption, 'font-mono break-all')}>{url}</p>
          </div>
        {/if}

        <div class={cn('flex items-start gap-2', classes.text.caption)}>
          <Icon icon="ph:info-duotone" class="text-sm mt-0.5 flex-shrink-0 text-orange-500 dark:text-orange-300" />
          <p>หน้าต่างใหม่จะเปิดแยกจากระบบปัจจุบัน</p>
        </div>
      </div>

      <!-- Footer -->
      <div class={cn(
        "border-t border-orange-100/70 dark:border-orange-500/20",
        "bg-gradient-to-b from-gray-50/80 to-white/50 dark:from-gray-800/40 dark:to-gray-900/30",
        "backdrop-blur-sm px-6 py-4 flex gap-3"
      )}>
        <button
          class={cn(classes.button.secondary, 'flex-1', 'hover:scale-[1.02] active:scale-[0.98]')}
          on:click={onCancel}
        >
          ยกเลิก
        </button>
        <button
          class={cn(
            'flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white',
            'bg-gradient-to-br from-orange-500/95 to-orange-600/95 backdrop-blur-sm',
            'hover:from-orange-400/95 hover:to-orange-500/95',
            'hover:scale-[1.02] active:scale-[0.98]',
            'transition-all duration-200 shadow-lg shadow-orange-500/30'
          )}
          on:click={onConfirm}
        >
          เปิดหน้าต่าง
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans Thai", "Sukhumvit Set", "Sarabun", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }
  
  .modal-content {
    font-family: inherit;
  }
</style>
