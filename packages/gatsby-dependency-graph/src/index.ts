import { join } from "path"
import { readGatsbyPages } from "./read-pages"
import { readDependencies } from "./read-dependencies"
import { findUnresolvedDependencies } from "./scan-for-unresolved-dependencies"
import { DependencyGraph } from "./types"

type Options = {
  depth: number
}

export const deriveGraph = async (
  ROOT: string,
  opts: Options = {}
): Promise<DependencyGraph> => {
  const pages = await readGatsbyPages(join(ROOT, "/src/pages"))

  let depthCount = 0
  let resolvedDependencies = new Set<string>()

  // Generate the graph for each page
  const gdraph: DependencyGraph = {
    root: ROOT,
    pages: new Map(),
    components: new Map(),
  }

  // read pages as a first input
  await Promise.all(
    pages.map(async (page: string) => {
      gdraph.pages.set(
        join(__dirname, page),
        await readDependencies(ROOT, join("/src/pages", page))
      )
    })
  )

  // then start looping through dependencies to resolve the entire tree
  async function runDependencyResolution() {
    if (opts.depth && depthCount >= opts.depth) {
      return
    }

    const deps = findUnresolvedDependencies(gdraph, resolvedDependencies)
    if (deps.length === 0) {
      return
    }

    for (let index = 0; index < deps.length; index++) {
      const node = deps[index]
      for (let index = 0; index < node.dependencies.length; index++) {
        const relativePath = node.dependencies[index]
        const parts = relativePath.split(ROOT)

        gdraph.components.set(
          relativePath,
          await readDependencies(ROOT, parts[1])
        )

        // Mark the node as dependencies resolved so we don't hit this again.
        resolvedDependencies.add(node.absolutePath)
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        depthCount++
        resolve(runDependencyResolution())
      }, 0)
    })
  }

  await runDependencyResolution()

  console.log(resolvedDependencies)
  return resolvedDependencies
}
