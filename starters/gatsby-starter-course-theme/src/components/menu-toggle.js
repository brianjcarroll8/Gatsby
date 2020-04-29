/** @jsx jsx */
import { jsx, Flex, Link as TLink } from "theme-ui"
import { useState, useRef } from "react"
import { Link } from "gatsby"

const MenuToggle = ({
  title = ``,
  slug = ``,
  items = [],
  expandByDefault = false,
}) => {
  const [isExpanded, setExpanded] = useState(expandByDefault)
  const toggleRef = useRef(null)
  const itemListRef = useRef(null)
  const clickHandler = () => {
    setExpanded(!isExpanded)
    if (isExpanded) {
      itemListRef.current.querySelector(`a`).focus()
    }
  }

  return (
    <div>
      <button
        aria-controls={`#${title}-menu`}
        onClick={clickHandler}
        ref={toggleRef}
        aria-expanded={isExpanded}
        sx={{
          border: `none`,
          background: `none`,
          fontWeight: `600`,
          letterSpacing: `2px`,
          textTransform: `uppercase`,
          fontSize: 1,
          color: `#687690`,
          mb: 2,
        }}
      >
        {title}
      </button>
      <ul
        id={`#${title}-menu`}
        ref={itemListRef}
        tabIndex={-1}
        className={`${isExpanded ? `expanded` : ``}`}
        role="list"
        sx={{
          display: `none`,
          listStyle: `none`,
          pl: 3,
          a: {
            color: `gray.9`,
            fontSize: 1,
            "&[aria-current='page']": {
              color: `primary`,
              fontWeight: `600`,
            },
          },
          "&.expanded": {
            display: `block`,
          },
        }}
      >
        <li>
          <TLink as={Link} to={slug} role="listitem">
            {title} Overview
          </TLink>
        </li>
        {items.map(item => (
          <li key={item.title} role="listitem">
            <TLink as={Link} to={item.slug}>
              {item.title}
            </TLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MenuToggle
