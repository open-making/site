import webringData from '$lib/data/webring.json';

export const prerender = true;

export function load() {
	return {
		webring: webringData
	};
}