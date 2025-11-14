<script lang="ts">
  import { classes, cn } from '../../styles';

  // Props
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let text: string | undefined = undefined;
  export let centered: boolean = false;
  
  // Additional classes
  let className: string = '';
  export { className as class };

  // Size mappings
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  $: spinnerClass = cn(
    'border-orange-200/60 border-t-orange-600 rounded-full animate-spin',
    sizeClasses[size]
  );

  $: containerClass = cn(
    'flex flex-col items-center gap-3',
    centered && 'justify-center py-12',
    className
  );
</script>

<div class={containerClass} {...$$restProps}>
  <div class={spinnerClass}></div>
  {#if text}
    <p class={classes.text.bodySecondary}>{text}</p>
  {/if}
</div>
