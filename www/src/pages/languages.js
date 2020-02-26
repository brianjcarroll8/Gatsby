/** @jsx jsx */
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import { Helmet } from "react-helmet"

import { langs } from "../utils/i18n"
import Layout from "../components/layout"
import Container from "../components/container"
import FooterLinks from "../components/shared/footer-links"

export default function Languages({ location }) {
  return (
    <Layout location={location}>
      <Helmet>
        <meta name="description" content="Gatsbyjs.org Translations" />
      </Helmet>
      <Container>
        <main id={`reach-skip-nav`}>
          <h1>Languages</h1>
          <p>
            The Gatsby documentation is available in the languages listed below.
          </p>
          <ul sx={{ listStyleType: `none` }}>
            {langs.map(({ code, name, localName }) => {
              return (
                <li>
                  <Link
                    to={`/${code}/languages/`}
                    sx={{
                      width: `100%`,
                      border: `2px transparent solid`,
                      borderRadius: 3,
                      p: 2,
                    }}
                  >
                    <strong>{localName}</strong> / {name}
                  </Link>
                </li>
              )
            })}
          </ul>
          <h2>How to help with translation.</h2>
          <p>
            The Gatsby documentation is currently translated in {langs.length}{" "}
            languages. Most of the translations are contributed by our
            international members.
          </p>
          <p>
            If you would like to contribute, please read our{" "}
            <Link to="/contributing/translation/">Translation guide</Link>.
          </p>
        </main>
      </Container>
      <FooterLinks />
    </Layout>
  )
}
