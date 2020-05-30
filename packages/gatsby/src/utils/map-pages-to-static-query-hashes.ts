import { Stats, Module } from "webpack"

import { IGatsbyState } from "../redux/types"
import { slash } from "gatsby-core-utils"

type MapOfTemplatesToStaticQueryHashes = Map<string, Array<number>>

const findModule = (path, modules): Module | null => {
  for (const m of modules) {
    if (m.constructor.name === `ConcatenatedModule`) {
      const possibleMod = findModule(path, m.modules)
      if (possibleMod) {
        return possibleMod
      }
    } else if (
      m.constructor.name === `NormalModule` &&
      slash(m.resource) === path
    ) {
      return m
    }
  }
  return null
}

export function mapTemplatesToStaticQueryHashes(
  reduxState: IGatsbyState,
  webpackStats: Stats
): MapOfTemplatesToStaticQueryHashes {
  const { staticQueryComponents, components } = reduxState

  const lazyModules = new Set()
  reduxState.modules.forEach(moduleDependency => {
    lazyModules.add(moduleDependency.source)
  })

  const modules = webpackStats.compilation.modules

  const getEntrypoints = (
    mod,
    entrypoints: Set<string> = new Set(),
    visitedModules = new Set()
  ): Set<string> => {
    const slashedResource = slash(mod.resource)
    if (visitedModules.has(slashedResource)) {
      return entrypoints
    }
    visitedModules.add(slashedResource)

    if (mod.constructor.name === `ConcatenatedModule`) {
      mod.modules.forEach(m2 => {
        getEntrypoints(m2, entrypoints, visitedModules)
      })
      return entrypoints
    }
    if (components.has(slashedResource) || lazyModules.has(slashedResource)) {
      entrypoints.add(slashedResource)
      return entrypoints
    }

    if (mod && mod.reasons) {
      mod.reasons.forEach(reason => {
        if (reason.dependency.type === `single entry`) {
          entrypoints.add(reason.dependency.request)
        } else if (
          reason.dependency.type !== `harmony side effect evaluation` &&
          reason.dependency.type !== `harmony export imported specifier`
        ) {
          getEntrypoints(reason.module, entrypoints, visitedModules)
        }
      })
    }

    return entrypoints
  }

  const map = new Map()

  staticQueryComponents.forEach(({ componentPath, hash }) => {
    const staticQueryComponentModule = findModule(slash(componentPath), modules)
    if (staticQueryComponentModule) {
      const entrypoints = getEntrypoints(staticQueryComponentModule)
      entrypoints.forEach(entrypoint => {
        const hashes = map.get(entrypoint) || []
        hashes.push(hash)
        map.set(entrypoint, hashes)
      })
    }
  })

  return map
}
