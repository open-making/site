import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { html as toReactNode } from 'satori-html';
import Card from '$lib/components/ShareCard.svelte';
import { render } from 'svelte/server';

const height = 627;
const width = 1200;

// Load JetBrains Mono font
const fontFile = await fetch(
    'https://github.com/JetBrains/JetBrainsMono/raw/refs/heads/master/fonts/ttf/JetBrainsMono-Regular.ttf'
);
const fontData = await fontFile.arrayBuffer();

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ url }) => {
    const title = url.searchParams.get('title') ?? 'OPEN MAKING';
    const description = url.searchParams.get('description') ?? 'open source resources for learning code and other miscellany';
    const count = parseInt(url.searchParams.get('count') ?? '0');
    const countType = url.searchParams.get('countType') ?? 'courses';
    const pageType = url.searchParams.get('pageType') ?? 'home';

    const result = render(Card, {
        props: {
            title,
            description,
            count,
            countType,
            pageType
        }
    });

    // Convert Svelte HTML to React element for Satori
    const element = toReactNode(result.body);

    const svg = await satori(element, {
        fonts: [
            {
                name: 'JetBrains Mono',
                data: fontData,
                style: 'normal',
                weight: 400
            }
        ],
        height,
        width
    });

    const resvg = new Resvg(svg, {
        fitTo: {
            mode: 'width',
            value: width
        }
    });

    const image = resvg.render();

    return new Response(image.asPng(), {
        headers: {
            'content-type': 'image/png',
            'cache-control': 'public, max-age=3600'
        }
    });
};