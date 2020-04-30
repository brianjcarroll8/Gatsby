import { merge } from "theme-ui"
import { tailwind } from "@theme-ui/presets"

export default merge(tailwind, {
  colors: {
    primary: `#663399`, // Gatsby Color
    textMuted: tailwind.colors.gray[7],
    heading: tailwind.colors.black,
    separator: tailwind.colors.gray[3],
  },
  sizes: {
    container: 900,
    sidebar: 260,
  },
  styles: {
    h1: {
      variant: `text.heading`,
      pb: 2,
      mb: 4,
      borderBottom: theme => `1px solid ${theme.colors.separator}`,
      fontSize: 5,
    },
    h2: {
      variant: `text.heading`,
      fontSize: 4,
    },
    h3: {
      variant: `text.heading`,
      fontSize: 3,
    },
    h4: {
      variant: `text.heading`,
      fontSize: 2,
    },
    h5: {
      variant: `text.heading`,
      fontSize: 1,
    },
    h6: {
      variant: `text.heading`,
      fontSize: 1,
    },
    a: {
      textDecoration: `none`,
      "&:hover,&:focus": {
        textDecoration: `none`,
      },
    },
    p: {
      "> code": {
        variant: `highlighting.inline`,
      },
    },
    li: {
      "> code": {
        variant: `highlighting.inline`,
      },
    },
  },
  layout: {
    container: {
      px: 3,
    },
  },
  highlighting: {
    inline: {
      backgroundColor: `purple.1`,
      color: `purple.8`,
      px: 2,
      py: 1,
      borderRadius: `0.3em`,
      fontFamily: `Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
    },
  },
  text: {
    heading: {
      fontFamily: `heading`,
      fontWeight: `heading`,
      lineHeight: `heading`,
      color: `heading`,
    },
  },
  list: {
    item: {
      my: 3,
      h3: {
        mb: 0,
        color: `gray.8`,
        span: {
          color: `primary`,
          mr: 2,
        },
      },
      p: {
        mt: 2,
        fontSize: 1,
        color: `textMuted`,
        lineHeight: `snug`,
      },
    },
  },
})
