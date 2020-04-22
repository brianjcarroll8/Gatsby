/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import Link from "./localized-link"
import {
  MdChevronRight as ChevronRight,
  MdChevronLeft as ChevronLeft,
} from "react-icons/md"

const Separator = ({ character = <ChevronRight /> }) => (
  <span sx={{ my: 0, mx: 1 }} role="presentation">
    {character}
  </span>
)

const BreadcrumbNav = ({ children, mobile = false }) => (
  <nav
    aria-label="breadcrumb"
    sx={{
      color: `textMuted`,
      display: [
        `${mobile ? `inherit` : `none`}`,
        null,
        `${mobile ? `none` : `inherit`}`,
      ],
      fontSize: 1,
      mb: [6, null, 8],
    }}
  >
    {children}
  </nav>
)

const Breadcrumb = ({ item }) => {
  return (
    <React.Fragment>
      {/* render the default view on desktop sizes with all links displayed */}
      <BreadcrumbNav>
        <Link to="/">Home</Link>
        <Separator />
        {item.parents &&
          item.parents.reverse().map(item => {
            return (
              <React.Fragment key={item.breadcrumbTitle}>
                <span>
                  <Link to={item.link}>{item.breadcrumbTitle}</Link>
                </span>
                <Separator />
              </React.Fragment>
            )
          })}
        <span aria-current="page">{item.breadcrumbTitle}</span>
      </BreadcrumbNav>
      {/* render a smaller view on mobile viewports with only previous breadcrumb */}
      {item.parents[0] && (
        <BreadcrumbNav mobile>
          <Separator character={<ChevronLeft />} />
          <Link to={item.parents[0].link}>
            {item.parents[0].breadcrumbTitle}
          </Link>
        </BreadcrumbNav>
      )}
    </React.Fragment>
  )
}

export default Breadcrumb
