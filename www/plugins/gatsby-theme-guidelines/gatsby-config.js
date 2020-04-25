module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `guidelines`,
        path: `${__dirname}/src/data/`,
      },
    },
    `gatsby-transformer-yaml`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-theme-ui`,
  ],
}
