/** @jsx jsx */
import { jsx, Container } from "theme-ui"
import { Global } from "@emotion/core"
import SEO from "./seo"
import Header from "./header"
import Footer from "./footer"
import CourseNav from "./course-nav"
import "../styles/code.css"

const Layout = ({ children, currentModule = 0 }) => (
  <div
    sx={{
      display: `grid`,
      gridTemplateAreas: `"header header" "course-nav main" "footer footer"`,
      gridTemplateColumns: theme => `${theme.sizes.sidebar}px 1fr`,
      gridTemplateRows: `auto`,
    }}
  >
    <Global
      styles={theme => {
        return {
          "[data-name='live-preview']": {
            backgroundColor: theme.colors.purple[2],
            padding: theme.space[2],
          },
          "[data-name='live-editor']": {
            fontSize: `16px`,
            position: `relative`,
            "&:after": {
              content: `"live"`,
              position: `absolute`,
              top: `8px`,
              right: `8px`,
              backgroundColor: theme.colors.primary,
              color: `white`,
              fontFamily: theme.fonts.body,
              textTransform: `uppercase`,
              fontWeight: `600`,
              letterSpacing: theme.letterSpacings.widest,
              fontSize: `12px`,
              padding: `0.1rem 0.25rem`,
              borderRadius: `5px`,
            },
          },
        }
      }}
    />
    <SEO />
    <Header />
    <CourseNav currentModule={currentModule} />
    <main sx={{ gridArea: `main`, padding: 4 }}>
      <Container>{children}</Container>
    </main>
    <Footer />
  </div>
)

export default Layout
