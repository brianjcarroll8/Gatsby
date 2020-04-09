import merge from 'deepmerge';
import { tailwind } from '@theme-ui/presets';

const headingStyles = {
	h1: {
		fontSize: 5,
		color: `heading`,
	},
	h2: {
		fontSize: 4,
		color: `heading`,
	},
	h3: {
		fontSize: 3,
		color: `heading`,
	},
};

export default merge(tailwind, {
	colors: {
		textMuted: tailwind.colors.gray[7],
		heading: tailwind.colors.black,
	},
	sizes: {
		container: 1024,
	},
	styles: {
		...headingStyles,
		a: {
			textDecoration: `none`,
		},
	},
	layout: {
		container: {
			px: 3,
		},
	},
	text: {
		...headingStyles,
		heading: {
			fontFamily: `heading`,
			fontWeight: `heading`,
			lineHeight: `heading`,
			color: `heading`,
		},
	},
	list: {
		item: {
			h3: {
				mb: 0,
			},
			p: {
				mt: 2,
				fontSize: 1,
				color: `textMuted`,
			},
		},
	},
});
