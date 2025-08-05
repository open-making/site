
<script lang="ts">
	import '../app.css';

	let { children } = $props();
	let theme = $state('dark');

	function toggleTheme() {
		theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.setAttribute('data-theme', theme);
	}
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" />
</svelte:head>

<div class="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] text-sm leading-tight flex flex-col">
	<div class="max-w-[100ch] md:min-w-[100ch] w-full mx-auto p-4 md:p-12 text-left flex-1 flex flex-col">
		<!-- Theme toggle -->
		<div class="md:fixed absolute top-4 right-4">
			<button
				onclick={toggleTheme}
				class="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors font-mono cursor-pointer border-none bg-transparent"
			>
				[theme: {theme}]
			</button>
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
