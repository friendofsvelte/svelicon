<script lang="ts" module>
  export interface MdiAccountProps {
    display?: boolean;
    occupy?: boolean;
    size?: number;
    class?: string;
  }
</script>

<script lang="ts">
  const {display = false, occupy = true, size = 0.7, class: className = ''}: MdiAccountProps = $props();
</script>

{#if display}
  <svg
   xmlns="http://www.w3.org/2000/svg"
   width="{size}em"
   height="{size}em"
   viewBox="0 0 24 24"
   class="{className}">
  <path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4"/>
</svg>
{:else if occupy}
  <div style="height: {size}em; width: {size}em;" />
{/if}