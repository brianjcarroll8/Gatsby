/** @jsx jsx */
import { jsx } from "theme-ui"

const Footer = () => (
  <footer
    sx={{
      gridArea: `footer`,
      padding: 4,
      borderTop: theme => `1px solid ${theme.colors.gray[3]}`,
      color: `gray.7`,
    }}
  >
    &copy; {new Date().getFullYear()} by Gatsby - All rights reserved
  </footer>
)

export default Footer
