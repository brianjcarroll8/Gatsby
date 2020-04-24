/** @jsx jsx */
import { jsx, Link as TLink, Heading } from "theme-ui"
import { Link } from "gatsby"

const ListItem = ({ title, slug, number, description }) => (
  <li sx={{ variant: `list.item` }}>
    <TLink as={Link} to={slug}>
      <Heading as="h3">
        <span>{number}</span> {title}
      </Heading>
    </TLink>
    <p>{description}</p>
  </li>
)

export default ListItem
