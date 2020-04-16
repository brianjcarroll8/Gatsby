const withDefaults = require(`./utils/default-options`);
const options = withDefaults({});

module.exports = {
	siteMetadata: {
		title: `Course Site`,
		description: `you can see a course here!`,
		author: `Madalyn Parker`,
	},
	plugins: [
		`gatsby-plugin-sharp`,
    `gatsby-remark-images`,
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
		`gatsby-plugin-theme-ui`,
		`gatsby-plugin-react-helmet`,
	],
};
