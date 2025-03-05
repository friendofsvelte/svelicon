<script lang="ts" module>
  export interface FluentSearch12RegularProps {
    size?: number;
    class?: string;
  }
</script>

<script lang="ts">
  const { size = 0.7, class: className = '' }: FluentSearch12RegularProps = $props();
</script>

<svg
   xmlns="http://www.w3.org/2000/svg"
   width="{size}em"
   height="{size}em"
   viewBox="0 0 12 12"
   class="{className}">
  <path fill="currentColor" d="M5 1a4 4 0 1 0 2.452 7.16l2.694 2.693a.5.5 0 1 0 .707-.707L8.16 7.453A4 4 0 0 0 5 1M2 5a3 3 0 1 1 6 0a3 3 0 0 1-6 0"/>
</svg>