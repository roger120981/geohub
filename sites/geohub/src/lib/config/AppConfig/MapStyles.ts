import type { StyleDefinition } from '@undp-data/style-switcher';

// style image can be generated by static api
// https://staticimage.undpgeohub.org/api/style/static/36.975,-1.364,1,0,0/60x60.webp?url=https%3A%2F%2Fdev.undpgeohub.org%2Fapi%2Fmapstyle%2Fstyle.json&ratio=2

export const MapStyles: StyleDefinition[] = [
	{
		title: 'Carto',
		uri: `/api/mapstyle/style.json`,
		image: `/assets/style-switcher/voyager.webp`
	},
	{
		title: 'Positron',
		uri: `/api/mapstyle/positron.json`,
		image: `/assets/style-switcher/positron.webp`
	},
	{
		title: 'Dark',
		uri: `/api/mapstyle/dark.json`,
		image: `/assets/style-switcher/dark.webp`
	},
	{
		title: 'Bing Aerial',
		uri: `/api/mapstyle/aerialstyle.json`,
		image: `/assets/style-switcher/aerial.webp`
	},
	{
		title: 'Blank',
		uri: `/api/mapstyle/blank.json`,
		image: `/assets/style-switcher/blank.webp`
	}
];
