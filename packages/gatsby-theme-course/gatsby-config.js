const withDefaults = require(`./utils/default-options`);

module.exports = opts => {
	const options = withDefaults(opts);
	return {
	siteMetadata: {
		title: `Course Site`,
		description: `you can see a course here!`,
		author: `Madalyn Parker`,
	},
	plugins: [
    `gatsby-plugin-theme-ui`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sharp`,
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				path: options.coursePath,
				name: options.coursePath,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				path: options.assetPath || `content/assets`,
				name: options.assetPath || `content/assets`,
			},
		},
		{
      resolve: `gatsby-plugin-mdx`,
      options: {
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1035,
              sizeByPixelDensity: true,
            },
          },
        ],
      },
    },
	],
}};
