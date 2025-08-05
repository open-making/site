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
  let course = $state('');

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
          course: course.trim(),
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
      course = '';
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

    });
  }

  onMount(() => {
    fetchEntries();
  });
</script>

<div class="w-full max-w-4xl mx-auto space-y-8">
  <!-- Terminal Header -->
  <div class="mb-8">
    <div class="font-mono text-sm text-[var(--color-text-subtle)] mb-4">
      <span class="text-[var(--color-green)]">$ cat</span> guestbook.txt
    </div>
  </div>

  <!-- Entries Display -->
  <div class="space-y-6">
    {#if loading}
      <div class="text-xs text-[var(--color-text-muted)] font-mono">
        loading entries...
      </div>
    {:else if entries.length === 0}
      <div class="text-xs text-[var(--color-text-dim)] font-mono bg-[var(--color-bg)] border border-[var(--color-border)] rounded p-4">
        No entries yet - be the first to leave a message!
      </div>
    {:else}
      <div class="space-y-4">
        {#each entries as entry, index (entry.id)}
          <div class="bg-[var(--color-bg)] border border-[var(--color-border)] rounded p-4 font-mono text-xs">
            <!-- Entry header with index -->
            <div class="flex items-start justify-between gap-4 mb-3 text-[var(--color-text-muted)]">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <span class="text-[var(--color-text-subtle)] flex-shrink-0">[{String(index + 1).padStart(3, '0')}]</span>
                <span class="text-[var(--color-text)] font-semibold truncate">{entry.name}</span>
                {#if entry.course}
                  <span class="text-[var(--color-cyan-light)] bg-[var(--color-border)] px-2 py-1 rounded text-xs flex-shrink-0">
                    {entry.course}
                  </span>
                {/if}
              </div>
              <div class="flex items-center gap-2 text-xs flex-shrink-0">
                <time class="text-[var(--color-text-dim)]">
                  {formatDate(entry.timestamp)}
                </time>
                {#if entry.location && entry.location !== 'Unknown'}
                  <span class="text-[var(--color-text-muted)] hidden sm:inline">
                    | 📍 {entry.location}
                  </span>
                {/if}
              </div>
            </div>

            <!-- Message content -->
            <div class="pl-12">
              <div class="text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
                {entry.comment}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Terminal separator -->
  <div class="border-t border-[var(--color-border)] pt-8">
    <div class="font-mono text-sm text-[var(--color-text-subtle)] mb-6">
      <span class="text-[var(--color-green)]">$ nano</span> new_entry.txt
    </div>
  </div>

  <!-- Form -->
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="name" class="block text-xs font-mono text-[var(--color-text-muted)] mb-1">
          Name
        </label>
        <input
          id="name"
          type="text"
          bind:value={name}
          placeholder="Your name"
          maxlength="100"
          class="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm font-mono text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-text-subtle)] focus:ring-1 focus:ring-[var(--color-text-subtle)]"
          disabled={submitting}
        />
      </div>
      <div>
        <label for="course" class="block text-xs font-mono text-[var(--color-text-muted)] mb-1">
          Course (optional)
        </label>
        <input
          id="course"
          type="text"
          bind:value={course}
          placeholder="e.g., WEB2025, CDV2025"
          maxlength="50"
          class="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm font-mono text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-text-subtle)] focus:ring-1 focus:ring-[var(--color-text-subtle)]"
          disabled={submitting}
        />
      </div>
    </div>

    <div>
      <label for="comment" class="block text-xs font-mono text-[var(--color-text-muted)] mb-1">
        Message
      </label>
      <textarea
        id="comment"
        bind:value={comment}
        placeholder="Leave a message..."
        maxlength="500"
        rows="3"
        class="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm font-mono text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-text-subtle)] focus:ring-1 focus:ring-[var(--color-text-subtle)] resize-vertical"
        disabled={submitting}
      ></textarea>
      <div class="text-xs text-[var(--color-text-dim)] mt-1 font-mono text-right">
        {comment.length}/500
      </div>
    </div>

    <!-- Messages -->
    {#if error}
      <div class="text-xs text-[var(--color-red-light)] font-mono bg-[var(--color-bg)] border border-[var(--color-red)] rounded px-3 py-2">
        {error}
      </div>
    {/if}

    {#if success}
      <div class="text-xs text-[var(--color-green-light)] font-mono bg-[var(--color-bg)] border border-[var(--color-green)] rounded px-3 py-2">
        {success}
      </div>
    {/if}

    <!-- Submit Button -->
    <button
      onclick={submitEntry}
      disabled={submitting || !name.trim() || !comment.trim()}
      class="px-4 py-2 bg-[var(--color-border)] hover:bg-[var(--color-text-subtle)] disabled:bg-[var(--color-bg)] disabled:text-[var(--color-text-dim)] border border-[var(--color-border)] hover:border-[var(--color-text-subtle)] disabled:border-[var(--color-border)] rounded text-xs font-mono text-[var(--color-text)] transition-colors cursor-pointer disabled:cursor-not-allowed"
    >
      {submitting ? 'saving...' : 'save entry'}
    </button>
  </div>

</div>

<style>
  /* Override browser default focus styles for consistency */
  input:focus,
  textarea:focus {
    box-shadow: 0 0 0 1px var(--color-text-subtle);
  }
</style>