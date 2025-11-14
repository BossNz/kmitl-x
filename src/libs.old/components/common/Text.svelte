<script lang="ts">
  import { classes, cn } from '../../styles';

  // Props
  export let variant: 'heading1' | 'heading2' | 'heading3' | 'body' | 'bodySecondary' | 'caption' | 'label' = 'body';
  export let as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' = 'p';
  
  // Additional classes
  let className: string = '';
  export { className as class };

  // Determine the base class based on variant
  $: baseClass = classes.text[variant];
  
  // Combine classes
  $: computedClass = cn(baseClass, className);
</script>

<svelte:element this={as} class={computedClass} {...$$restProps}>
  <slot />
</svelte:element>
