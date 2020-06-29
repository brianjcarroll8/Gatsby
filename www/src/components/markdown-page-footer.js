/** @jsx jsx */
import { jsx } from "theme-ui"
import { Fragment } from "react"
import { graphql } from "gatsby"
import { MdCreate as EditIcon } from "react-icons/md"

export default function MarkdownPageFooter(props) {
  return (
    <Fragment>
      {props.page && (
        <div
          sx={{
            display: `flex`,
            alignItems: `center`,
            justifyContent: `space-between`,
            mt: 9,
          }}
        >
          <a
            sx={{ variant: `links.muted` }}
            href={`https://github.com/gatsbyjs/gatsby/blob/master/${
              props.packagePage ? `packages` : `docs`
            }/${props.page ? props.page.parent.relativePath : ``}`}
          >
            <EditIcon sx={{ mr: 2 }} /> Edit this page on GitHub
          </a>
          {props.page?.fields?.latestUpdate && (
            <span sx={{ color: `textMuted`, fontSize: 1 }}>
              Last updated:{` `}
              <time dateTime={props.page.fields.latestUpdate}>
                {props.page.fields.latestUpdate}
              </time>
            </span>
          )}
        </div>
      )}
    </Fragment>
  )
}

export const fragment = graphql`
  fragment MarkdownPageFooterMdx on Mdx {
    fields {
      latestUpdate(formatString: "MMMM D, YYYY")
    }
    parent {
      ... on File {
        relativePath
        fields {
          latestUpdate(formatString: "MMMM D, YYYY")
        }
      }
    }
  }
`
