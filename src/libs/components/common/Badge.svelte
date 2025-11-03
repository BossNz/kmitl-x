<script lang="ts">
  import { classes, cn } from '../../styles';

  // Props
  export let variant: 'default' | 'success' | 'warning' | 'error' | 'info' = 'default';
  
  // Additional classes
  let className: string = '';
  export { className as class };

  // Determine the base class based on variant
  $: baseClass = classes.badge[variant];
  
  // Combine classes
  $: computedClass = cn(baseClass, className);
</script>

<span class={computedClass} {...$$restProps}>
  <slot />
</span>
