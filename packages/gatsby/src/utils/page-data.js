import { websocketManager } from "./websocket-manager"
const fs = require(`fs-extra`)
const path = require(`path`)
const { store } = require(`../redux`)

const fixedPagePath = pagePath => (pagePath === `/` ? `index` : pagePath)

const getFilePath = ({ publicDir }, pagePath) =>
  path.join(publicDir, `page-data`, fixedPagePath(pagePath), `page-data.json`)

const read = async ({ publicDir }, pagePath) => {
  const filePath = getFilePath({ publicDir }, pagePath)
  const rawPageData = await fs.readFile(filePath, `utf-8`)
  return JSON.parse(rawPageData)
}

const remove = async ({ publicDir }, pagePath) => {
  const filePath = getFilePath({ publicDir }, pagePath)
  if (fs.existsSync(filePath)) {
    return await fs.remove(filePath)
  }
  return Promise.resolve()
}

const writePageData = async (
  { publicDir },
  page,
  { staticQueryHashes, moduleDependencies, pageDataProcessors }
) => {
  const inputFilePath = path.join(
    publicDir,
    `..`,
    `.cache`,
    `json`,
    `${page.path.replace(/\//g, `_`)}.json`
  )
  const outputFilePath = getFilePath({ publicDir }, page.path)
  const result = await fs.readJSON(inputFilePath)

  const pageProcessorsObj = {}

  if (pageDataProcessors) {
    pageDataProcessors.forEach((value, key) => {
      pageProcessorsObj[key] = Array.from(value)
    })
  }

  const body = {
    componentChunkName: page.componentChunkName,
    path: page.path,
    matchPath: page.matchPath,
    moduleDependencies: moduleDependencies,
    result,
    staticQueryHashes,
    pageProcessors: pageProcessorsObj,
  }
  const bodyStr = JSON.stringify(body)
  // transform asset size to kB (from bytes) to fit 64 bit to numbers
  const pageDataSize = Buffer.byteLength(bodyStr) / 1000

  store.dispatch({
    type: `ADD_PAGE_DATA_STATS`,
    payload: {
      filePath: outputFilePath,
      size: pageDataSize,
    },
  })

  await fs.outputFile(outputFilePath, bodyStr)

  return body
}

const flush = async () => {
  const {
    pendingPageDataWrites,
    components,
    pages,
    staticQueryComponents,
    staticQueriesByTemplate,
    queryModuleDependencies,
    pageDataProcessors,
    modules,
    program,
  } = store.getState()

  const { pagePaths, templatePaths } = pendingPageDataWrites

  const pagesToWrite = Array.from(templatePaths).reduce(
    (set, componentPath) => {
      const pageTemplate = components.get(componentPath)
      if (!pageTemplate) {
        console.log(`no template for`, componentPath)
        return set
      }
      const { pages } = pageTemplate
      pages.forEach(set.add.bind(set))
      return set
    },
    new Set(pagePaths.values())
  )

  const hashToStaticQueryId = new Map()
  staticQueryComponents.forEach(({ componentPath, id, hash }) => {
    hashToStaticQueryId.set(hash, id)
  })

  console.log({
    pendingPageDataWrites,
    hashToStaticQueryId,
    staticQueriesByTemplate,
  })

  const pickModulesFromStaticQuery = (staticQueryHash, resources) => {
    const staticQueryId = hashToStaticQueryId.get(staticQueryHash)

    const modulesUsedByStaticQuery = queryModuleDependencies.get(staticQueryId)

    if (modulesUsedByStaticQuery?.size > 0) {
      modulesUsedByStaticQuery.forEach(moduleId => {
        resources.moduleDependencies.add(moduleId)
        pickStaticQueriesFromModule(moduleId, resources)
      })
    }
  }

  const pickStaticQueriesFromModule = (moduleId, resources) => {
    const source = modules.get(moduleId)?.source
    if (!source) {
      return
    }

    const statiQueriesUsedByModule = staticQueriesByTemplate.get(source)
    if (statiQueriesUsedByModule?.length > 0) {
      statiQueriesUsedByModule.forEach(staticQueryHash => {
        resources.staticQueryHashes.add(staticQueryHash)
        pickModulesFromStaticQuery(staticQueryHash, resources)
      })
    }

    // staticQueryHashes.push(...(staticQueriesByTemplate.get(source) || []))
  }

  for (const pagePath of pagesToWrite) {
    const page = pages.get(pagePath)

    const resources = {
      staticQueryHashes: new Set(),
      moduleDependencies: new Set(),
    }

    const staticQueryForTemplate = staticQueriesByTemplate.get(
      page.componentPath
    )
    const modulesForPage = queryModuleDependencies.get(pagePath)

    if (staticQueryForTemplate) {
      staticQueryForTemplate.forEach(staticQueryHash => {
        resources.staticQueryHashes.add(staticQueryHash)
        pickModulesFromStaticQuery(staticQueryHash, resources)
      })
    }

    if (modulesForPage) {
      modulesForPage.forEach(moduleId => {
        resources.moduleDependencies.add(moduleId)
        pickStaticQueriesFromModule(moduleId, resources)
      })
    }

    console.log({
      path: pagePath,
      staticQueryHashes: resources.staticQueryHashes,
      moduleDependencies: resources.moduleDependencies,
    })

    const result = await writePageData(
      { publicDir: path.join(program.directory, `public`) },
      page,
      {
        staticQueryHashes: Array.from(resources.staticQueryHashes),
        moduleDependencies: Array.from(resources.moduleDependencies),
        pageDataProcessors: pageDataProcessors.get(pagePath) || new Map(),
      }
    )

    if (program.command === `develop`) {
      // const pageProcessorsObj = {}

      // if (pageDataProcessors.has(pagePath)) {
      //   pageDataProcessors.get(pagePath).forEach((value, key) => {
      //     pageProcessorsObj[key] = Array.from(value)
      //   })
      // }

      websocketManager.emitPageData({
        id: pagePath,
        result,
      })
    }
  }

  store.dispatch({
    type: `CLEAR_PENDING_PAGE_DATA_WRITES`,
  })

  return
}

module.exports = {
  read,
  writePageData,
  remove,
  fixedPagePath,
  flush,
}
