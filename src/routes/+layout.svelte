
<script lang="ts">
	import '../app.css';
	import data from '$lib/data/site.json';
	import { page } from '$app/stores';

	let { children } = $props();
	let theme = $state('dark');

	function toggleTheme() {
		theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.setAttribute('data-theme', theme);
	}

	function getPageTitle(pathname: string): string {
		if (pathname === '/') return data.header.title;
		const pageName = pathname.replace('/', '').toUpperCase();
		return `${data.header.title} / ${pageName}`;
	}

	function isActiveLink(itemLink: string, currentPath: string): boolean {
		if (itemLink === '/' && currentPath === '/') return true;
		if (itemLink !== '/' && currentPath.startsWith(itemLink)) return true;
		return false;
	}
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" />
</svelte:head>

<div class="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] text-sm leading-tight flex flex-col">
	<div class="max-w-[100ch] md:min-w-[100ch] w-full mx-auto p-4 md:p-12 text-left flex-1 flex flex-col">
		<!-- Theme toggle -->
		<div class="md:fixed hidden md:block top-4 right-4">
			<button
				onclick={toggleTheme}
				class="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors font-mono cursor-pointer border-none bg-transparent"
			>
				[theme: {theme}]
			</button>
		</div>
		<!-- Header -->
		<div class="text-left">
			<a href="/" class="text-[var(--color-accent)] border-b border-dotted border-[var(--color-accent)] hover:text-[var(--color-link-hover)] hover:border-solid hover:border-[var(--color-link-hover)]">
				<h1 class="text-2xl font-bold tracking-[3px] text-[var(--color-accent)] font-mono">{getPageTitle($page.url.pathname)}</h1>
			</a>
			<p class="text-[var(--color-text-muted)] mt-2 font-mono text-sm">{data.header.subtitle}</p>

		<!-- Terminal Menu -->
		{#each data.sections as section}
		{#if section.title === 'LINKS'}
			<div>
				<div class="mt-4 flex flex-wrap gap-x-6 gap-y-2">
					<a href="/" class="font-mono text-sm border-b border-dotted no-underline {isActiveLink('/', $page.url.pathname) ? 'text-[var(--color-accent)] border-[var(--color-accent)]' : 'text-[var(--color-link)] border-[var(--color-link)] hover:text-[var(--color-link-hover)] hover:border-solid hover:border-[var(--color-link-hover)]'}">home</a>
					{#each section.items as item}
						<a
							href={item.link}
							{...(item.external ? { target: '_blank', rel: 'noopener' } : {})}
							class="font-mono text-sm border-b border-dotted no-underline {isActiveLink(item.link, $page.url.pathname) ? 'text-[var(--color-accent)] border-[var(--color-accent)]' : 'text-[var(--color-link)] border-[var(--color-link)] hover:text-[var(--color-link-hover)] hover:border-solid hover:border-[var(--color-link-hover)]'}"
						>
							{item.external ? item.link.replace('https://', '').replace('github.com/', 'gh:') : item.link.replace('/', '')}
						</a>
					{/each}
				</div>
			</div>
		{/if}
		{/each}
		</div>

		<div class="flex-1 w-full">
			{@render children?.()}
		</div>

		<!-- OSS Attribution Footer -->
		<footer class="mt-auto pt-8 border-t border-[var(--color-border)] border-opacity-20">
			<div class="text-xs text-[var(--color-text-dim)] font-mono">
				<p>MIT License • <a href="https://github.com/open-making/site" class="text-[var(--color-accent)] hover:underline">View on GitHub</a></p>
				<p class="mt-1">Built with SvelteKit</p>
			</div>
		</footer>
	</div>
</div>
