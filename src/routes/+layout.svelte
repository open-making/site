<script lang="ts">
	import '../app.css';

	let { children } = $props();
	let theme = 'dark';

	function toggleTheme() {
		theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.setAttribute('data-theme', theme);
	}
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" />
</svelte:head>

<div class="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] text-sm leading-tight">
	<div class="max-w-[100ch] mx-auto p-4 md:p-12 text-left">
		<!-- Theme toggle -->
		<div class="md:fixed absolute top-4 right-4">
			<button
				onclick={toggleTheme}
				class="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors font-mono cursor-pointer border-none bg-transparent"
			>
				[theme: {theme}]
			</button>
		</div>

		{@render children?.()}
	</div>
</div>
