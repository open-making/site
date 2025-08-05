<script>
  import { page } from '$app/stores';

  // Required props
  export let title = '';

  // Optional props with defaults
  export let description = '';
  export let type = 'website'; // website, article, etc.
  export let image = ''; // URL to the image
  export let courseId = '';
  export let contentType = 'page'; // page, assignment, day
  export let date = '';
  export let author = '';
  export let keywords = '';
  export let canonical = '';

  // Site configuration
  const domain = 'https://openmaking.club';
  const siteName = 'OpenMaking';
  const defaultAuthor = 'Aman Bhargava';

  // Computed values
  $: fullTitle = courseId
    ? `${title} | ${courseId.toUpperCase()}`
    : title || 'OpenMaking';

  $: fullOgImageUrl = image && image.startsWith('/') ? `${domain}${image}` : image;
  $: currentUrl = canonical || ($page.url.href.startsWith('http') ? $page.url.href : `${domain}${$page.url.pathname}`);
  $: finalAuthor = author || defaultAuthor;
  $: articleType = contentType === 'assignment' || contentType === 'day' ? 'article' : type;
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />

  <!-- Author and Keywords -->
  <meta name="author" content={finalAuthor} />
  {#if keywords}
    <meta name="keywords" content={keywords} />
  {/if}

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content={articleType} />
  <meta property="og:url" content={currentUrl} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={fullOgImageUrl} />
  <meta property="og:site_name" content={siteName} />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={currentUrl} />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={fullOgImageUrl} />
  <meta name="twitter:creator" content="@amanbhargava" />

  <!-- Article metadata (for assignments, days, etc.) -->
  {#if courseId}
    <meta property="article:section" content={courseId} />
  {/if}
  {#if date}
    <meta property="article:published_time" content={new Date(date).toISOString()} />
  {/if}
  <meta property="article:author" content={finalAuthor} />

  <!-- Additional structured data -->
  {#if articleType === 'article'}
    {@html `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": fullTitle,
        "description": description,
      "author": {
        "@type": "Person",
        "name": finalAuthor
      },
      "publisher": {
        "@type": "Organization",
        "name": siteName
      },
      "url": currentUrl,
      "datePublished": date ? new Date(date).toISOString() : undefined,
      "image": fullOgImageUrl
    })}</script>`}
  {/if}

  <link rel="canonical" href={currentUrl} />
</svelte:head>