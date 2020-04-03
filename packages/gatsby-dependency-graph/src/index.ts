import { join } from "path"
import { readGatsbyPages } from "./read-pages"
import { readDependencies } from "./read-dependencies"
import { loopDependencyResolution } from "./loop-dependency-resolution"
import { DependencyGraph, Options } from "./types"

export const deriveGraph = async (
  ROOT: string,
  opts: Options = {}
): Promise<DependencyGraph> => {
  const pages = await readGatsbyPages(join(ROOT, "/src/pages"))

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

  // Loop all pages and dependencies until every file's dependencies are loaded
  await loopDependencyResolution(ROOT, gdraph, opts)

  return gdraph
}
