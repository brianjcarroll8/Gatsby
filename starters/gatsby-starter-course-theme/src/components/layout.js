/** @jsx jsx */
import { jsx, Container } from "theme-ui"
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
      gridTemplateColumns: `320px 1fr`,
      gridTemplateRows: `auto`,
    }}
  >
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
