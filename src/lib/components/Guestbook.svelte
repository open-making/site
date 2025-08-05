<script>
  import { onMount } from 'svelte';

  let entries = $state([]);
  let loading = $state(false);
  let submitting = $state(false);
  let error = $state('');
  let success = $state('');
  
  // Form fields
  let name = $state('');
  let comment = $state('');

  const API_URL = '/api/guestbook';

  async function fetchEntries() {
    loading = true;
    error = '';
    
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch entries: ${response.status}`);
      }
      
      const data = await response.json();
      entries = data;
    } catch (e) {
      error = `Failed to load guestbook entries: ${e.message}`;
      console.error('Fetch error:', e);
    } finally {
      loading = false;
    }
  }

  async function submitEntry() {
    if (!name.trim() || !comment.trim()) {
      error = 'Name and comment are required';
      return;
    }

    submitting = true;
    error = '';
    success = '';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to submit: ${response.status}`);
      }

      // Add new entry to the beginning of the list
      entries = [data, ...entries];
      
      // Reset form
      name = '';
      comment = '';
      success = 'Thank you for signing the guestbook!';
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        success = '';
      }, 3000);
      
    } catch (e) {
      error = e.message;
      console.error('Submit error:', e);
    } finally {
      submitting = false;
    }
  }

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  onMount(() => {
    fetchEntries();
  });
</script>

<div class="w-full max-w-4xl mx-auto space-y-6">
  <!-- Header -->
  <div class="border-b border-[var(--color-base-800)] pb-4">
    <h2 class="text-lg font-mono text-[var(--color-text)]">guestbook</h2>
    <p class="text-xs text-[var(--color-text-muted)] mt-1 font-mono">
      Leave a message and your location will be automatically detected
    </p>
  </div>

  <!-- Form -->
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="name" class="block text-xs font-mono text-[var(--color-text-muted)] mb-1">
          name
        </label>
        <input
          id="name"
          type="text"
          bind:value={name}
          placeholder="Your name"
          maxlength="100"
          class="w-full px-3 py-2 bg-[var(--color-base-950)] border border-[var(--color-base-800)] rounded text-sm font-mono text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-base-600)] focus:ring-1 focus:ring-[var(--color-base-600)]"
          disabled={submitting}
        />
      </div>
    </div>

    <div>
      <label for="comment" class="block text-xs font-mono text-[var(--color-text-muted)] mb-1">
        message
      </label>
      <textarea
        id="comment"
        bind:value={comment}
        placeholder="Leave a message..."
        maxlength="500"
        rows="3"
        class="w-full px-3 py-2 bg-[var(--color-base-950)] border border-[var(--color-base-800)] rounded text-sm font-mono text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-base-600)] focus:ring-1 focus:ring-[var(--color-base-600)] resize-vertical"
        disabled={submitting}
      ></textarea>
      <div class="text-xs text-[var(--color-text-dim)] mt-1 font-mono text-right">
        {comment.length}/500
      </div>
    </div>

    <!-- Messages -->
    {#if error}
      <div class="text-xs text-[var(--color-red-light)] font-mono bg-[var(--color-base-950)] border border-[var(--color-red)] rounded px-3 py-2">
        error: {error}
      </div>
    {/if}

    {#if success}
      <div class="text-xs text-[var(--color-green-light)] font-mono bg-[var(--color-base-950)] border border-[var(--color-green)] rounded px-3 py-2">
        {success}
      </div>
    {/if}

    <!-- Submit Button -->
    <button
      onclick={submitEntry}
      disabled={submitting || !name.trim() || !comment.trim()}
      class="px-4 py-2 bg-[var(--color-base-800)] hover:bg-[var(--color-base-700)] disabled:bg-[var(--color-base-900)] disabled:text-[var(--color-text-dim)] border border-[var(--color-base-700)] hover:border-[var(--color-base-600)] disabled:border-[var(--color-base-800)] rounded text-xs font-mono text-[var(--color-text)] transition-colors cursor-pointer disabled:cursor-not-allowed"
    >
      {submitting ? 'submitting...' : 'sign guestbook'}
    </button>
  </div>

  <!-- Entries -->
  <div class="space-y-6">
    <div class="border-t border-[var(--color-base-800)] pt-6">
      <h3 class="text-sm font-mono text-[var(--color-text)] mb-4">
        entries ({entries.length})
      </h3>

      {#if loading}
        <div class="text-xs text-[var(--color-text-muted)] font-mono">
          loading entries...
        </div>
      {:else if entries.length === 0}
        <div class="text-xs text-[var(--color-text-dim)] font-mono">
          no entries yet. be the first to sign!
        </div>
      {:else}
        <div class="space-y-4">
          {#each entries as entry (entry.id)}
            <div class="border border-[var(--color-base-800)] rounded p-4 bg-[var(--color-base-950)]">
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span class="text-sm font-mono text-[var(--color-text)] font-semibold">
                    {entry.name}
                  </span>
                  {#if entry.location && entry.location !== 'Unknown'}
                    <span class="text-xs text-[var(--color-text-muted)] font-mono">
                      from {entry.location}
                    </span>
                  {/if}
                </div>
                <time class="text-xs text-[var(--color-text-dim)] font-mono">
                  {formatDate(entry.timestamp)}
                </time>
              </div>
              <p class="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
                {entry.comment}
              </p>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  /* Override browser default focus styles for consistency */
  input:focus,
  textarea:focus {
    box-shadow: 0 0 0 1px var(--color-base-600);
  }
</style>