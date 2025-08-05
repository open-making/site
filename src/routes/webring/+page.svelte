<script>
	import SEO from '$lib/components/SEO.svelte';

	let { data } = $props();
	let sites = data.webring.sites.filter(site => site.active);
	let showWidget = $state(false);
</script>

<SEO
	title="OpenMaking WebRing"
	description="A network of websites from OpenMaking course participants"
	image="/og?title=WEBRING&description=webring for websites made by OpenMaking participants&count={sites.length}&countType=sites&pageType=webring"
/>

<div class="w-full">

	<!-- Header -->
	<div class="text-left mb-16">
		<h1 class="text-2xl font-bold tracking-[3px] text-[var(--color-accent)] font-mono">
			<a href="/" class="text-[var(--color-accent)] no-underline border-b border-dotted border-[var(--color-accent)] hover:text-[var(--color-link-hover)] hover:border-solid hover:border-[var(--color-link-hover)]">OPENMAKING</a>
			<span class="text-[var(--color-text-dim)]"> / WEBRING</span>
		</h1>
		<p class="text-[var(--color-text-muted)] mt-2 font-mono text-sm">connecting websites made for OpenMaking courses</p>
	</div>

	<!-- Sites -->
	<div class="my-16">
		<div class="border-t border-[var(--color-border)] pt-8 mb-6">
			{#if sites.length === 0}
				<p class="text-[var(--color-text-dim)] font-mono text-sm">no sites connected yet</p>
			{:else}
				<p class="mb-8 font-mono text-sm"><span class="text-[var(--color-link)] font-bold">{sites.length}</span> sites connected:</p>

				{#each sites as site}
					<div class="my-6 pl-6 border-l-2 border-[var(--color-border)]">
						<div class="flex items-start gap-2">
							<span class="text-[var(--color-primary)] font-mono text-lg leading-none">▸</span>
							<div class="flex-1">
								<div class="text-[var(--color-text)] font-bold font-mono">{site.title}</div>
								<div class="text-[var(--color-text-dim)] mt-1 font-mono text-xs tracking-wide">by {site.author}</div>
								<div class="text-[var(--color-link)] mt-3">
									<span class="text-[var(--color-text-subtle)] font-mono text-xs mr-2">→ </span><a
										href={site.url}
										target="_blank"
										rel="noopener"
										class="text-[var(--color-link)] no-underline border-b border-dotted border-[var(--color-link)] hover:text-[var(--color-link-hover)] hover:border-solid hover:border-[var(--color-link-hover)] font-mono text-sm"
									>
										{site.url}
									</a>
								</div>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<!-- Widget Instructions Accordion -->
	<div class="my-2">
		<div class="border-t border-[var(--color-border)] py-2">
			<button
				onclick={() => showWidget = !showWidget}
				class="text-[var(--color-primary)] font-bold text-lg tracking-[2px] hover:text-[var(--color-accent)] transition-colors bg-transparent border-none cursor-pointer font-mono"
			>
				<span class="text-[var(--color-text-dim)]">[{showWidget ? '-' : '+'}]</span> WIDGET
			</button>

			{#if showWidget}
				<div class="mt-6 pl-6 border-l-2 border-[var(--color-border)]">
					<p class="text-[var(--color-text-muted)] mb-6 font-mono text-sm">Add this to your website:</p>

					<div class="bg-[var(--color-text-subtle)] bg-opacity-10 p-4 border border-[var(--color-border)]">
						<pre class="text-[var(--color-text)] font-mono text-xs leading-relaxed">&lt;div id="webring-widget" data-theme="dark" data-style="compact"&gt;&lt;/div&gt;
&lt;script src="https://openmaking.club/webring.js"&gt;&lt;/script&gt;</pre>
					</div>

					<div class="mt-6 text-xs text-[var(--color-text-dim)] pl-2 font-mono">
						<p class="mb-2">options:</p>
						<p class="ml-4">data-theme: "light" | "dark"</p>
						<p class="ml-4">data-style: "compact" | "full"</p>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Footer -->
	<div class="mt-2 text-left text-[var(--color-text-subtle)] ">
		<p class="font-mono text-sm">part of the <a href="/" class="text-[var(--color-accent)] no-underline border-b border-dotted border-[var(--color-accent)] hover:text-[var(--color-link-hover)] hover:border-solid hover:border-[var(--color-link-hover)]">OpenMaking</a> gang? add your site: <a
			href="https://github.com/open-making/webring/issues/new/choose"
			class="text-[var(--color-link)] no-underline border-b border-dotted border-[var(--color-link)] hover:text-[var(--color-link-hover)] hover:border-solid hover:border-[var(--color-link-hover)]"
		>submit here</a></p>
	</div>
</div>
