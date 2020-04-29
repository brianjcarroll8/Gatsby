/** @jsx jsx */
import { jsx, Flex, Link as TLink } from "theme-ui"
import { Link } from "gatsby"

const PrevNext = ({ previous, next }) => {
  console.log(previous, next)
  if (!previous && !next) {
    return null
  }

  return (
    <Flex
      as="ul"
      sx={{
        flexWrap: `wrap`,
        justifyContent: `space-between`,
        listStyle: `none`,
        padding: 0,
      }}
    >
      <li>
        {previous && (
          <TLink as={Link} to={previous.slug} rel="prev">
            ← {previous.title}
          </TLink>
        )}
      </li>
      <li>
        {next && (
          <TLink as={Link} to={next.slug} rel="next">
            {next.title} →
          </TLink>
        )}
      </li>
    </Flex>
  )
}

export default PrevNext
