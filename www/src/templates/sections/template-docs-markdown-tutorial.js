import React from "react"
import { graphql } from "gatsby"

import TemplateDocsMarkdown from "../template-docs-markdown"
import useTutorialSidebar from "./sidebars/tutorial"
import { ItemListProvider } from "../../utils/sidebar/item-list"

function TemplateDocsMarkdownTutorial(props) {
  const sidebar = useTutorialSidebar()

  return (
    <ItemListProvider sidebar={sidebar} location={props.location}>
      <TemplateDocsMarkdown {...props} />
    </ItemListProvider>
  )
}

export default TemplateDocsMarkdownTutorial

export const pageQuery = graphql`
  query($slug: String!, $locale: String!) {
    mdx(fields: { slug: { eq: $slug }, locale: { eq: $locale } }) {
      ...MarkdownPageMdx
    }
  }
`
