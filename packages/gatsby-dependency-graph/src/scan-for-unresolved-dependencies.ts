import { Node, DependencyGraph } from "./types"

let pagesAreScanned = false

export const findUnresolvedDependencies = (
  gdraph: DependencyGraph,
  resolvedDependencies: Set<string>
): Set<Node> => {
  // force this true on first pass. pages need immediate scanning
  if (pagesAreScanned === false) {
    pagesAreScanned = true
    return new Set(gdraph.pages.values())
  }

  let deps: Set<Node> = new Set()
  for (let [, node] of gdraph.components) {
    if (resolvedDependencies.has(node.absolutePath) === false) {
      deps.add(node)
    }
  }

  return deps
}
