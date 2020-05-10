import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
// import scopeContexts from "../loaders/mdx-scopes"
import MDXRenderer from "../mdx-renderer"
import { plugins as wrappers } from "../loaders/mdx-wrappers"

/*
 * A function that you can pass an mdx body to and get back html
 */
export default (body, moduleMapping) => {
  const wrappedElement = wrappers.reduce(
    (element, plugin) => plugin.wrapRootElement({ element }, {}),
    <MDXRenderer isHTMLRenderPass>{{ body, moduleMapping }}</MDXRenderer>
  )
  return renderToStaticMarkup(wrappedElement)
}
