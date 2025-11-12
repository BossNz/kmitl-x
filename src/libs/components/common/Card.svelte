<script lang="ts">
  import { classes, cn } from '../../styles';

  // Props
  export let variant: 'base' | 'hover' | 'bordered' = 'base';
  
  // Additional classes
  let className: string = '';
  export { className as class };

  // Determine the base class based on variant
  $: baseClass = classes.card[variant];
  
  // Combine classes
  $: computedClass = cn(baseClass, className);
</script>

<div class={computedClass} {...$$restProps}>
  <slot />
</div>
