import React from "react"
import { MDXRenderer } from "gatsby-plugin-mdx"
import Layout from "./layout"
import PrevNext from "./prev-next"

const Lesson = ({ data: { lesson }, pageContext: { previous, next } }) => (
  <Layout currentModule={lesson.module}>
    <h1>
      {lesson.number}: {lesson.title}
    </h1>
    <MDXRenderer>{lesson.body}</MDXRenderer>
    <PrevNext previous={previous} next={next} />
  </Layout>
)

export default Lesson
