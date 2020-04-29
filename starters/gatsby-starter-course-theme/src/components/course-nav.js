/** @jsx jsx */
import { jsx } from "theme-ui"
import { useStaticQuery, graphql } from "gatsby"
import MenuToggle from "./menu-toggle"

const CourseNav = ({ currentModule }) => {
  const data = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          title
        }
      }
      modules: allMdxModule(sort: { fields: module }) {
        nodes {
          slug
          title
          number: module
        }
      }
      lessons: allMdxLesson(sort: { fields: [module, lesson] }) {
        nodes {
          title
          slug
          number: lesson
          module
        }
      }
    }
  `)

  const navItems = []
  data.modules.nodes.forEach(mod => {
    const modLessons = []
    data.lessons.nodes
      .filter(lesson => lesson.module === mod.number)
      .forEach(lesson => {
        modLessons.push({
          slug: lesson.slug,
          title: lesson.title,
          type: `lesson`,
          number: lesson.number,
        })
      })
    navItems.push({
      slug: mod.slug,
      title: mod.title,
      type: `module`,
      number: mod.number,
      lessons: modLessons,
    })
  })

  return (
    <nav sx={{ gridArea: `course-nav`, maxWidth: `sidebar` }}>
      <ul sx={{ m: 0, padding: 4, display: `grid`, gridRowGap: 4 }}>
        {navItems.map(navItem => (
          <MenuToggle
            title={navItem.title}
            slug={navItem.slug}
            items={navItem.lessons}
            expandByDefault={navItem.number === currentModule}
            key={navItem.title}
          />
        ))}
      </ul>
    </nav>
  )
}

export default CourseNav
