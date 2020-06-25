/** @jsx jsx */
import { jsx } from "theme-ui"

const User = () => (
  <form
    sx={{
      alignItems: `flex-end`,
      justifyContent: `flex-end`,
      mb: 0,
      margin: 1,
      mx: [2, null, null, 5, 0],
      top: 6,
      position: `relative`,
      "& .algolia-autocomplete": {
        width: `100%`,
        paddingX: [1, 2, 3, 4],
        mx: 1,
        "> div": {
          padding: 7,
        },
      },
      [mediaQueries.xl]: {
        bottom: 7,
      },
    }}
  >
    <input
      sx={{
        pl: [5, null, null, focused ? 7 : 24, 8],
        mx: 10,
      }}
    />
  </form>
)

export default User
