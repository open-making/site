<script>
	import { onMount } from 'svelte';
	import SEO from '$lib/components/SEO.svelte';

	let sites = [];
	let loading = true;
	let error = null;
	let showWidget = false;

	onMount(async () => {
		try {
			const response = await fetch('https://raw.githubusercontent.com/open-making/webring/main/data/sites.json');
			if (!response.ok) throw new Error('Failed to fetch sites');

			const data = await response.json();
			sites = data.sites.filter(site => site.active);
			loading = false;
		} catch (err) {
			error = err.message;
			loading = false;
		}
	});
</script>

<SEO
	title="OpenMaking WebRing"
	description="A network of websites from OpenMaking course participants"
	image="/og?title=WEBRING&description=webring for websites made by OpenMaking participants&count={sites.length}&countType=sites&pageType=webring"
/>

<!-- Header -->
<div class="text-left mb-12">
	<h1 class="text-xl font-bold tracking-[2px] text-[var(--color-accent)]">
		<a href="/" class="text-[var(--color-accent)] no-underline border-b border-dotted border-[var(--color-accent)] hover:text-[var(--color-link-hover)] hover:border-solid hover:border-[var(--color-link-hover)]">OPENMAKING</a>
		/ <span class="text-[var(--color-text-dim)]">WEBRING</span>
	</h1>
	<p class="text-[var(--color-text-muted)] mt-1">connecting websites made for OpenMaking courses</p>
</div>

<!-- Sites -->
<div class="my-12">
	{#if loading}
		<p class="text-[var(--color-text-dim)]">loading...</p>
	{:else if error}
		<p class="text-[var(--color-primary)]">connection failed: {error}</p>
	{:else if sites.length === 0}
		<p class="text-[var(--color-text-dim)]">no sites connected yet</p>
	{:else}
		<p class="mb-8"><span class="text-[var(--color-link)]">{sites.length}</span> sites connected:</p>

		{#each sites as site}
			<div class="my-8 pl-4">
				<div><span class="text-[var(--color-primary)] -ml-4">▸</span> <span class="text-[var(--color-text)] font-bold">{site.title}</span></div>
				<div class="text-[var(--color-text-dim)] mt-1 ml-2">{site.author}</div>
				<div class="text-[var(--color-link)] mt-2 ml-2">
					<a
						href={site.url}
						target="_blank"
						rel="noopener"
						class="text-[var(--color-link)] no-underline border-b border-dotted border-[var(--color-link)] hover:text-[var(--color-link-hover)] hover:border-solid hover:border-[var(--color-link-hover)]"
					>
						{site.url}
					</a>
				</div>
			</div>
		{/each}
	{/if}
</div>

<!-- Widget Instructions Accordion -->
<div class="my-12">
	<button
		on:click={() => showWidget = !showWidget}
		class="text-[var(--color-primary)] font-bold text-base tracking-wide hover:text-[var(--color-accent)] transition-colors bg-transparent border-none cursor-pointer"
	>
		<span class="text-[var(--color-text-dim)]">[{showWidget ? '-' : '+'}]</span> WIDGET
	</button>

	{#if showWidget}
		<div class="mt-4 pl-4 border-l-2 border-[var(--color-border)]">
			<p class="text-[var(--color-text-muted)] mb-4">Add this to your website:</p>

			<div class="bg-[var(--color-text-subtle)] bg-opacity-10 p-4 border border-[var(--color-border)] text-xs">
				<pre class="text-[var(--color-text)]">&lt;div id="webring-widget" data-theme="dark" data-style="compact"&gt;&lt;/div&gt;
&lt;script src="https://openmaking.club/webring.js"&gt;&lt;/script&gt;</pre>
			</div>

			<div class="mt-4 text-xs text-[var(--color-text-dim)] pl-2">
				<p>options:</p>
				<p>  data-theme: "light" | "dark"</p>
				<p>  data-style: "compact" | "full"</p>
			</div>
		</div>
	{/if}
</div>

<!-- Footer -->
<div class="mt-16 text-left text-[var(--color-text-subtle)] border-t border-[var(--color-border)] pt-8">
	<p>part of the <a href="/" class="text-[var(--color-accent)] no-underline border-b border-dotted border-[var(--color-accent)] hover:text-[var(--color-link-hover)] hover:border-solid hover:border-[var(--color-link-hover)]">OpenMaking</a> gang? add your site: <a
		href="https://github.com/open-making/webring/issues/new/choose"
		class="text-[var(--color-link)] no-underline border-b border-dotted border-[var(--color-link)] hover:text-[var(--color-link-hover)] hover:border-solid hover:border-[var(--color-link-hover)]"
	>submit here</a></p>
</div>