import React from "react"
import { MDXRenderer } from "gatsby-plugin-mdx"
import { Heading } from "theme-ui"
import Layout from "./layout"
import PrevNext from "./prev-next"
import Separator from "./separator"
import SEO from "./seo"

const Lesson = ({ data: { lesson }, pageContext: { previous, next } }) => (
  <Layout currentModule={lesson.module}>
    <SEO title={lesson.title} />
    <Heading as="h1" variant="styles.h1">
      {lesson.title}
    </Heading>
    <MDXRenderer>{lesson.body}</MDXRenderer>
    <Separator />
    <PrevNext previous={previous} next={next} />
  </Layout>
)

export default Lesson
