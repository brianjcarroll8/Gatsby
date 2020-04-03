import { findUnresolvedDependencies } from "./scan-for-unresolved-dependencies"
import { readDependencies } from "./read-dependencies"
import { DependencyGraph, Options } from "./types"

export const loopDependencyResolution = async (
  ROOT: string,
  gdraph: DependencyGraph,
  opts: Options
): Promise<void> => {
  let depthCount = 0
  let resolvedDependencies = new Set<string>()

  // then start looping through dependencies to resolve the entire tree
  async function runDependencyResolution() {
    if (opts.depth && depthCount >= opts.depth) {
      return
    }

    const deps = findUnresolvedDependencies(gdraph, resolvedDependencies)
    if (deps.size === 0) {
      return
    }

    for (let node of deps) {
      console.log(node)
      for (let index = 0; index < node.dependencies.length; index++) {
        const nearAbsolutePath = node.dependencies[index]
        const part = nearAbsolutePath.split(ROOT)[1]

        const resolvedNode = await readDependencies(ROOT, part)
        gdraph.components.set(nearAbsolutePath, resolvedNode)

        // Mark the node as dependencies resolved so we don't hit this again.
        resolvedDependencies.add(resolvedNode.absolutePath)
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
}
