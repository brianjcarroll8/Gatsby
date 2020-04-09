const withDefaults = require(`./utils/default-options`);
const options = withDefaults({});

module.exports = {
	siteMetadata: {
		title: 'Course Site',
		description: 'you can see a course here!',
		author: 'Madalyn Parker',
	},
	plugins: [
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				path: options.coursePath || `content/course`,
				name: options.coursePath || `content/course`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				path: options.assetPath || `content/assets`,
				name: options.assetPath || `content/assets`,
			},
		},
		'gatsby-plugin-mdx',
		'gatsby-plugin-theme-ui',
		'gatsby-plugin-react-helmet',
	],
};
