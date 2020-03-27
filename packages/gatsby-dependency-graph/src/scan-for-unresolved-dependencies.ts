import { Node, DependencyGraph } from "./types"

let pagesAreScanned = false

export const findUnresolvedDependencies = (
  gdraph: DependencyGraph,
  resolvedDependencies: Set<string>
): Node[] => {
  // force this true on first pass. pages need immediate scanning
  if (pagesAreScanned === false) {
    pagesAreScanned = true
    return Array.from(gdraph.pages.values())
  }

  let deps: Node[] = []
  for (let [, node] of gdraph.components) {
    if (resolvedDependencies.has(node.absolutePath) === false) {
      deps.push(node)
    }
  }

  return deps
}
