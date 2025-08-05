<script>
	import data from '$lib/data/site.json';
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
	title="OpenMaking"
	description="Open courses on code, data analysis, and more"
		image="/og?title=OPEN MAKING&description={data.header.subtitle}&count={data.sections.find(s => s.title === 'COURSES')?.items.length || 0}&countType=courses&pageType=home"
/>

<!-- Courses Section -->
{#each data.sections as section}
	{#if section.title === 'COURSES'}
		<div class="my-8">
			<div class="border-t border-[var(--color-border)] pt-8">
				<h2 class="text-[var(--color-primary)] font-bold text-lg mb-3 tracking-[2px] font-mono">{section.title}</h2>
				{#if section.description}
					<p class="text-[var(--color-text-muted)] mb-8 font-mono text-sm">{section.description}</p>
				{/if}
			</div>

			{#each section.items as item}
				<div class="my-6 pl-6 border-l-2 border-[var(--color-border)]">
					<div class="flex items-start gap-2">
						<span class="text-[var(--color-primary)] font-mono text-lg leading-none">▸</span>
						<div class="flex-1">
							<div class="text-[var(--color-text)] font-bold font-mono">{item.title}</div>
							{#if 'period' in item && item.period}
								<div class="text-[var(--color-text-subtle)] text-xs mt-1 font-mono tracking-wide">{item.period}</div>
							{/if}
							<div class="text-[var(--color-text-dim)] mt-2 font-mono text-sm leading-relaxed">{item.description}</div>
							<div class="text-[var(--color-link)] mt-3">
								<span class="text-[var(--color-text-subtle)] mr-2 font-mono text-xs">→ </span><a
									href={item.link}
									{...(item.external ? { target: '_blank', rel: 'noopener' } : {})}
									class="text-[var(--color-link)] no-underline border-b border-dotted border-[var(--color-link)] hover:text-[var(--color-link-hover)] hover:border-solid hover:border-[var(--color-link-hover)] font-mono text-sm"
								>{item.external ? item.link.replace('https://', '') : item.link}</a>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
{/each}

<!-- Footer -->
<div class="mt-20 text-left space-y-3 text-[var(--color-text-subtle)] border-t border-[var(--color-border)] py-8">
	<p class="font-mono text-sm">By <a href="https://aman.bh" class="text-[var(--color-link)] no-underline border-b border-dotted border-[var(--color-link)] hover:text-[var(--color-link-hover)] hover:border-solid hover:border-[var(--color-link-hover)]">Aman Bhargava</a></p>
	<p class="font-mono text-sm">{data.footer.text}</p>
	<p class="text-[var(--color-accent)] font-bold font-mono text-sm">{data.footer.cta.split(':')[0]}: <a
		href={data.footer.link}
		class="text-[var(--color-link)] no-underline border-b border-dotted border-[var(--color-link)] hover:text-[var(--color-link-hover)] hover:border-solid hover:border-[var(--color-link-hover)]"
	>{data.footer.cta.split(': ')[1]}</a></p>
</div>
