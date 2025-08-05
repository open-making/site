<script>
  import SEO from '$lib/components/SEO.svelte';
  import Guestbook from '$lib/components/Guestbook.svelte';
</script>

<SEO
  title="Guestbook"
  description="Leave a message and share where you're from"
/>

<!-- Header -->
<div class="text-left mb-16">
  <a href="/" class="text-[var(--color-accent)] border-b border-dotted border-[var(--color-accent)] hover:text-[var(--color-link-hover)] hover:border-solid hover:border-[var(--color-link-hover)]">
    <h1 class="text-2xl font-bold tracking-[3px] text-[var(--color-accent)] font-mono">OPEN MAKING</h1>
  </a>
  <nav class="mt-4">
    <a href="/" class="text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-mono text-sm border-b border-dotted border-[var(--color-text-muted)] hover:border-[var(--color-text)]">← back to home</a>
  </nav>
</div>

<!-- Guestbook -->
<Guestbook />