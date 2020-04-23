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
	  primary: `#663399`,
		textMuted: tailwind.colors.gray[7],
		heading: tailwind.colors.black,
	},
	sizes: {
		container: 900,
    sidebar: 320,
	},
	styles: {
		...headingStyles,
		a: {
			textDecoration: `none`,
      "&:hover,&:focus": {
        textDecoration: `none`,
      }
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
		},
	},
	list: {
		item: {
		  my: 3,
			h3: {
				mb: 0,
        color: `gray.8`,
        span: {
				  color: `primary`,
          mr: 2,
        }
			},
			p: {
				mt: 2,
				fontSize: 1,
				color: `textMuted`,
        lineHeight: `snug`,
			},
		},
	},
});
