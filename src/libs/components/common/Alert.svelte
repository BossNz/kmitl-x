<script lang="ts">
  import { classes, cn } from '../../styles';
  import Icon from '@iconify/svelte';

  // Props
  export let variant: 'info' | 'success' | 'warning' | 'error' = 'info';
  export let icon: string | undefined = undefined;
  export let title: string | undefined = undefined;
  
  // Additional classes
  let className: string = '';
  export { className as class };

  // Default icons for each variant
  const defaultIcons = {
    info: 'ph:info-duotone',
    success: 'ph:check-circle-duotone',
    warning: 'ph:warning-duotone',
    error: 'ph:x-circle-duotone',
  };

  // Determine the base class based on variant
  $: baseClass = classes.note[variant];
  $: iconToShow = icon || defaultIcons[variant];
  
  // Combine classes
  $: computedClass = cn(baseClass, className);
</script>

<div class={computedClass} {...$$restProps}>
  {#if iconToShow}
    <Icon icon={iconToShow} class="w-5 h-5 flex-shrink-0 mt-0.5" />
  {/if}
  <div class="flex-1">
    {#if title}
      <p class="font-semibold mb-1">{title}</p>
    {/if}
    <slot />
  </div>
</div>
