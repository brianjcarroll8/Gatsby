import React from "react"
import { MDXRenderer } from "gatsby-plugin-mdx"
import { Heading } from "theme-ui"
import Layout from "./layout"
import List from "./list"
import PrevNext from "./prev-next"
import ListHeader from "./list-header"
import Separator from "./separator"
import SEO from "./seo"

const Module = ({
  data: { module, lessons },
  pageContext: { previous, next },
}) => (
  <Layout currentModule={module.module}>
    <SEO title={module.title} />
    <Heading as="h1" variant="styles.h1">
      {module.title}
    </Heading>
    <MDXRenderer>{module.body}</MDXRenderer>
    <Separator />
    <ListHeader>List of lessons</ListHeader>
    <List items={lessons.nodes} />
    <Separator />
    <PrevNext previous={previous} next={next} />
  </Layout>
)

export default Module
