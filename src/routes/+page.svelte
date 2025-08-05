<script>
	import data from '$lib/data/site.json';
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
	title="OpenMaking"
	description="Open courses on code, data analysis, and more"
		image="/og?title=OPEN MAKING&description={data.header.subtitle}&count={data.sections.find(s => s.title === 'COURSES')?.items.length || 0}&countType=courses&pageType=home"
/>
<!-- Header -->
<div class="text-left mb-12">
	<h1 class="text-xl font-bold tracking-[2px] text-[var(--color-accent)]">{data.header.title}</h1>
	<p class="text-[var(--color-text-muted)] mt-1">{data.header.subtitle}</p>
</div>

<!-- Sections -->
{#each data.sections as section}
	<div class="my-12">
		<h2 class="text-[var(--color-primary)] font-bold text-base mb-4 tracking-wide">{section.title}</h2>
		{#if section.description}
			<p class="text-[var(--color-text-muted)] mb-8">{section.description}</p>
		{/if}

		{#each section.items as item}
			<div class="my-8 pl-4">
				<div><span class="text-[var(--color-primary)] -ml-4">▸</span> <span class="text-[var(--color-text)] font-bold">{item.title}</span></div>
				{#if item.period}
					<div class="text-[var(--color-text-subtle)] text-xs mt-1 ml-2">{item.period}</div>
				{/if}
				<div class="text-[var(--color-text-dim)] mt-2 ml-2">{item.description}</div>
				<div class="text-[var(--color-link)] mt-2 ml-2"><a
					href={item.link}
					{...(item.external ? { target: '_blank', rel: 'noopener' } : {})}
					class="text-[var(--color-link)] no-underline border-b border-dotted border-[var(--color-link)] hover:text-[var(--color-link-hover)] hover:border-solid hover:border-[var(--color-link-hover)]"
				>{item.external ? item.link.replace('https://', '') : item.link}</a></div>
			</div>
		{/each}
	</div>
{/each}

<!-- Footer -->
<div class="mt-16 text-left space-y-4 text-[var(--color-text-subtle)] border-t border-[var(--color-border)] pt-8">
	<p>By <a href="https://aman.bh" class="text-[var(--color-link)] no-underline border-b border-dotted border-[var(--color-link)] hover:text-[var(--color-link-hover)] hover:border-solid hover:border-[var(--color-link-hover)]">Aman Bhargava</a></p>
	<p>{data.footer.text}</p>
	<p class="text-[var(--color-accent)] font-bold">{data.footer.cta.split(':')[0]}: <a
		href={data.footer.link}
		class="text-[var(--color-link)] no-underline border-b border-dotted border-[var(--color-link)] hover:text-[var(--color-link-hover)] hover:border-solid hover:border-[var(--color-link-hover)]"
	>{data.footer.cta.split(': ')[1]}</a></p>
</div>
