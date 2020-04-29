import React from "react"
import { Heading } from "theme-ui"
import { graphql } from "gatsby"
import { MDXRenderer } from "gatsby-plugin-mdx"
import Layout from "../components/layout"
import List from "../components/list"
import ListHeader from "../components/list-header"
import Separator from "../components/separator"

const Index = ({ data: { course, modules } }) => (
  <Layout>
    <Heading as="h1">{course.title}</Heading>
    <MDXRenderer>{course.body}</MDXRenderer>
    <Separator />
    <ListHeader>List of modules</ListHeader>
    <List items={modules.nodes} />
  </Layout>
)

export default Index

export const query = graphql`
  query CourseQuery {
    site {
      siteMetadata {
        title
      }
    }
    course: mdxCourse {
      title
      body
      description
    }
    modules: allMdxModule(sort: { fields: module, order: ASC }) {
      nodes {
        id
        number: module
        slug
        title
        description
      }
    }
  }
`
