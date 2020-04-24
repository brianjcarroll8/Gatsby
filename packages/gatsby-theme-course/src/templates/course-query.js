import { graphql } from "gatsby"
import CoursePage from "../components/course"

export default CoursePage

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
