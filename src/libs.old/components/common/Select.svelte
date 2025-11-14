<script lang="ts">
  import { classes, cn } from '../../styles';

  // Props
  export let value: string = '';
  export let options: Array<{ value: string; label: string }> = [];
  export let placeholder: string = 'เลือก...';
  export let disabled: boolean = false;
  export let error: string | undefined = undefined;
  export let label: string | undefined = undefined;
  
  // Additional classes
  let className: string = '';
  export { className as class };

  // Combine classes
  $: computedClass = cn(
    classes.input.base,
    error && classes.input.error,
    className
  );
</script>

<div class="flex flex-col gap-1.5">
  {#if label}
    <label class={classes.text.label} for={$$restProps.id || $$restProps.name}>
      {label}
    </label>
  {/if}
  
  <select
    bind:value
    {disabled}
    class={computedClass}
    id={$$restProps.id || $$restProps.name}
    on:change
    on:focus
    on:blur
    {...$$restProps}
  >
    {#if placeholder}
      <option value="" disabled selected>{placeholder}</option>
    {/if}
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
  
  {#if error}
    <p class={cn(classes.text.caption, 'text-red-600 dark:text-red-400')}>
      {error}
    </p>
  {/if}
</div>
