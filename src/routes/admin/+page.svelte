<script>
  import { onMount } from 'svelte';
  import SEO from '$lib/components/SEO.svelte';

  let entries = $state([]);
  let loading = $state(false);
  let error = $state('');
  let password = $state('');
  let authenticated = $state(false);
  let deleting = $state(new Set());

  const API_URL = '/.netlify/functions/guestbook';

  async function authenticate() {
    if (!password.trim()) {
      error = 'Password is required';
      return;
    }

    try {
      // Test authentication by attempting to fetch entries with auth header
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });

      if (response.ok) {
        authenticated = true;
        error = '';
        await fetchEntries();
      } else {
        error = 'Invalid password';
      }
    } catch (e) {
      error = 'Authentication failed';
    }
  }

  async function fetchEntries() {
    if (!authenticated) return;
    
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
      error = `Failed to load entries: ${e.message}`;
    } finally {
      loading = false;
    }
  }

  async function deleteEntry(entryId) {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    deleting.add(entryId);
    error = '';

    try {
      const response = await fetch(`${API_URL}?id=${entryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });

      const result = await response.json();

      if (response.ok) {
        entries = entries.filter(entry => entry.id !== entryId);
      } else {
        error = result.error || 'Failed to delete entry';
      }
    } catch (e) {
      error = `Delete failed: ${e.message}`;
    } finally {
      deleting.delete(entryId);
    }
  }

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onMount(() => {
    // Check if already authenticated
    const savedAuth = sessionStorage.getItem('admin_auth');
    if (savedAuth) {
      password = savedAuth;
      authenticate();
    }
  });

  $effect(() => {
    if (authenticated && password) {
      sessionStorage.setItem('admin_auth', password);
    }
  });
</script>

<SEO
  title="Admin"
  description="Guestbook administration"
/>

<div class="w-full max-w-6xl mx-auto space-y-8">
  <!-- Terminal Header -->
  <div class="mb-8">
    <div class="font-mono text-sm text-[var(--color-text-subtle)] mb-4">
      <span class="text-[var(--color-green)]">$</span> admin --manage guestbook
    </div>
  </div>

  {#if !authenticated}
    <!-- Authentication Form -->
    <div class="max-w-md mx-auto">
      <div class="bg-[var(--color-bg)] border border-[var(--color-border)] rounded p-6 space-y-4">
        <h2 class="text-[var(--color-primary)] font-bold text-lg font-mono">ADMIN ACCESS</h2>
        
        <div>
          <label for="password" class="block text-xs font-mono text-[var(--color-text-muted)] mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            bind:value={password}
            placeholder="Enter admin password"
            class="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm font-mono text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-text-subtle)] focus:ring-1 focus:ring-[var(--color-text-subtle)]"
            onkeydown={(e) => e.key === 'Enter' && authenticate()}
          />
        </div>

        {#if error}
          <div class="text-xs text-[var(--color-red-light)] font-mono bg-[var(--color-bg)] border border-[var(--color-red)] rounded px-3 py-2">
            {error}
          </div>
        {/if}

        <button
          onclick={authenticate}
          class="w-full px-4 py-2 bg-[var(--color-border)] hover:bg-[var(--color-text-subtle)] border border-[var(--color-border)] hover:border-[var(--color-text-subtle)] rounded text-xs font-mono text-[var(--color-text)] transition-colors cursor-pointer"
        >
          authenticate
        </button>
      </div>
    </div>
  {:else}
    <!-- Admin Dashboard -->
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-[var(--color-primary)] font-bold text-lg font-mono">GUESTBOOK ENTRIES ({entries.length})</h2>
        <button
          onclick={fetchEntries}
          disabled={loading}
          class="px-3 py-1 bg-[var(--color-border)] hover:bg-[var(--color-text-subtle)] disabled:bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-xs font-mono text-[var(--color-text)] transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? 'refreshing...' : 'refresh'}
        </button>
      </div>

      {#if error}
        <div class="text-xs text-[var(--color-red-light)] font-mono bg-[var(--color-bg)] border border-[var(--color-red)] rounded px-3 py-2">
          {error}
        </div>
      {/if}

      {#if loading}
        <div class="text-xs text-[var(--color-text-muted)] font-mono">
          loading entries...
        </div>
      {:else if entries.length === 0}
        <div class="text-xs text-[var(--color-text-dim)] font-mono bg-[var(--color-bg)] border border-[var(--color-border)] rounded p-4">
          No entries found
        </div>
      {:else}
        <div class="space-y-4">
          {#each entries as entry, index (entry.id)}
            <div class="bg-[var(--color-bg)] border border-[var(--color-border)] rounded p-4 font-mono text-xs">
              <!-- Entry header -->
              <div class="flex items-start justify-between gap-4 mb-3">
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
                  <button
                    onclick={() => deleteEntry(entry.id)}
                    disabled={deleting.has(entry.id)}
                    class="ml-2 px-2 py-1 bg-[var(--color-red)] hover:bg-[var(--color-red-light)] disabled:bg-[var(--color-border)] text-[var(--color-base-paper)] disabled:text-[var(--color-text-dim)] rounded text-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    {deleting.has(entry.id) ? 'deleting...' : 'delete'}
                  </button>
                </div>
              </div>

              <!-- Message content -->
              <div class="pl-12">
                <div class="text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
                  {entry.comment}
                </div>
                <div class="mt-2 text-xs text-[var(--color-text-dim)]">
                  ID: {entry.id}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  input:focus {
    box-shadow: 0 0 0 1px var(--color-text-subtle);
  }
</style>