<script lang="ts">
  import Textarea from '$lib/components/ui/textarea/textarea.svelte';

  let { placeholder, value = $bindable(''), onsubmit, ...restProps } = $props();
  let textarea: HTMLElement | null = $state(null);

  function setHeight() {
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight + 2; // 2px for border
      const MAX_HEIGHT = 24 * 4 + 12 * 2 + 2; // 4 lines (24px) + padding (12px top and bottom) + border (2px)
      const height = Math.min(scrollHeight, MAX_HEIGHT);
      textarea.style.height = `${height}px`;
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!textarea) return;
    interface Action {
      key: string;
      condition: boolean;
      action: () => void;
    }
    const events: Action[] = [
      {
        key: 'Enter',
        condition: !e.shiftKey,
        action: () => {
          if (!textarea) return;
          const form = textarea.closest('form');
          if (form) {
            onsubmit(new SubmitEvent('submit'));
          }
        }
      }
    ];
    for (const { key, condition, action } of events) {
      if (e.key === key && condition) {
        e.preventDefault();
        action();
      }
    }
  }

  $effect(() => {
    value = value; // to trigger reactivity
    setHeight();
  });
</script>

<Textarea
  class="min-h-full resize-none overflow-y-auto p-3 text-base transition-all"
  rows={1}
  {placeholder}
  onkeyup={onKeyDown}
  bind:ref={textarea}
  bind:value
  {...restProps}
/>
