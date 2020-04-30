/** @jsx jsx */
import { jsx, Link as TLink } from "theme-ui"
import { Link, useStaticQuery, graphql } from "gatsby"

const Header = () => {
  const data = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <header
      sx={{
        display: `flex`,
        alignItems: `center`,
        variant: `styles.header`,
        gridArea: `header`,
        px: 4,
        py: 3,
        borderBottom: theme => `1px solid ${theme.colors.gray[3]}`,
      }}
    >
      <TLink
        as={Link}
        to="/"
        sx={{
          variant: `styles.navlink`,
          fontWeight: `medium`,
          fontSize: 2,
        }}
      >
        {data.site.siteMetadata.title}
      </TLink>
    </header>
  )
}

export default Header
