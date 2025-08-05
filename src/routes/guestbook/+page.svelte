<script>
  import SEO from '$lib/components/SEO.svelte';
  import Guestbook from '$lib/components/Guestbook.svelte';
</script>

<SEO
  title="Guestbook"
  description="Leave a message and share where you're from"
/>

<!-- Header -->
<div class="text-left mt-8">
  <div class="mt-8 text-sm text-[var(--color-text-muted)] font-mono border-t border-[var(--color-border)] pt-8 mb-6">
    <p>Student remarks and feedback from past teaching</p>
  </div>
</div>

<!-- Guestbook -->
<Guestbook />