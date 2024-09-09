import type { Meta, StoryObj } from '@storybook/svelte';
import TagSelector from './TagSelector.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/TagSelector',
	component: TagSelector,
	tags: ['autodocs'],
	argTypes: {
		selected: {
			description: 'The list of tags which are selcted',
			defaultValue: []
		},
		key: {
			control: 'select',
			options: ['provider', 'year', 'resolution', 'theme', 'sdg_target', 'keyword', 'granularity'],
			description: 'Tag key name to search',
			defaultValue: ''
		},
		placeholder: {
			type: 'string',
			description: 'Placeholder text shown in search box.',
			defaultValue: 'Type keyword'
		},
		geohubOrigin: {
			type: 'string',
			description: 'Set GeoHub origin URL if you want to use it in other places',
			defaultValue: ''
		},
		apiUrl: {
			type: 'string',
			description: 'dataset api URL to filter tags.',
			defaultValue: ''
		}
	}
} satisfies Meta<TagSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const DataProvider: Story = {
	args: {
		selected: [],
		key: 'provider',
		geohubOrigin: 'https://dev.undpgeohub.org'
	}
};

export const DataProviderFiltered: Story = {
	args: {
		selected: [],
		key: 'provider',
		geohubOrigin: 'https://dev.undpgeohub.org',
		apiUrl: 'https://dev.undpgeohub.org/data?year=2020'
	}
};

export const Year: Story = {
	args: {
		selected: [],
		key: 'year',
		geohubOrigin: 'https://dev.undpgeohub.org'
	}
};

export const Resolution: Story = {
	args: {
		selected: [],
		key: 'resolution',
		geohubOrigin: 'https://dev.undpgeohub.org'
	}
};

export const Theme: Story = {
	args: {
		selected: [],
		key: 'theme',
		geohubOrigin: 'https://dev.undpgeohub.org'
	}
};

export const SdgTarget: Story = {
	args: {
		selected: [],
		key: 'sdg_target',
		geohubOrigin: 'https://dev.undpgeohub.org'
	}
};

export const Keyword: Story = {
	args: {
		selected: [],
		key: 'keyword',
		geohubOrigin: 'https://dev.undpgeohub.org'
	}
};

export const granularity: Story = {
	args: {
		selected: [],
		key: 'granularity',
		geohubOrigin: 'https://dev.undpgeohub.org'
	}
};
