/** @jsx jsx */
import { jsx } from "theme-ui"

const ListHeader = ({ children }) => (
  <div
    sx={{
      px: 3,
      py: 2,
      backgroundColor: `purple.1`,
      display: `inline-block`,
      mb: 2,
    }}
  >
    <h2
      sx={{
        fontWeight: `medium`,
        textTransform: `uppercase`,
        color: `purple.7`,
        fontSize: 1,
        m: 0,
        lineHeight: 1,
        letterSpacing: `2px`,
        borderRadius: 3,
      }}
    >
      {children}
    </h2>
  </div>
)

export default ListHeader
