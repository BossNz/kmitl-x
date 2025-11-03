<script lang="ts">
  import { classes, cn } from '../../styles';
  
  export let label: string;
  export let value: string;
  export let className: string = '';
</script>

<div class={cn(classes.card.base, 'px-4 py-3', className)}>
  <dt class={cn(classes.text.caption, 'mb-0.5 uppercase tracking-wide')}>
    {label}
  </dt>
  <dd class={cn(classes.text.body, 'font-semibold')}>
    {value || "-"}
  </dd>
</div>
