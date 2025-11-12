<script lang="ts">
  import { classes, cn } from '../../styles';
  import Icon from '@iconify/svelte';

  // Props
  export let variant: 'primary' | 'secondary' | 'ghost' | 'icon' = 'primary';
  export let href: string | undefined = undefined;
  export let target: string | undefined = undefined;
  export let disabled: boolean = false;
  export let icon: string | undefined = undefined;
  export let iconClass: string = 'w-5 h-5';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  
  // Additional classes
  let className: string = '';
  export { className as class };

  // Determine the base class based on variant
  $: baseClass = classes.button[variant];
  
  // Combine classes
  $: computedClass = cn(
    baseClass,
    variant !== 'icon' && 'inline-flex items-center gap-2',
    'no-underline', // Remove default link underline
    className
  );

  // Handler for button clicks (used for href with button)
  function handleClick(event: MouseEvent) {
    if (href && !disabled) {
      if (target === '_blank') {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = href;
      }
    }
  }
</script>

{#if href && !disabled}
  <a
    {href}
    {target}
    rel={target === '_blank' ? 'noopener noreferrer' : undefined}
    class={cn(computedClass, variant === 'primary' && '!text-white')}
    on:click
    {...$$restProps}
  >
    {#if icon}
      <Icon {icon} class={iconClass} />
    {/if}
    <slot />
  </a>
{:else}
  <button
    {type}
    {disabled}
    class={cn(computedClass, disabled && 'opacity-50 cursor-not-allowed')}
    on:click={handleClick}
    on:click
    {...$$restProps}
  >
    {#if icon}
      <Icon {icon} class={iconClass} />
    {/if}
    <slot />
  </button>
{/if}
