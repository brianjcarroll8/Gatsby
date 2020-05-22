import VirtualModulesPlugin from "webpack-virtual-modules"
import { store } from "../redux"
import * as path from "path"
import { slash } from "gatsby-core-utils"

function generateExportCode({ type, source, importName }) {
  if (type === `default`) {
    return `export { default } from "${slash(source)}"`
  }

  if (type === `named`) {
    return `export { ${importName} as default } from "${slash(source)}"`
  }

  if (type === `namespace`) {
    return `export * from "${slash(source)}"`
  }

  throw new Error(`GatsbyPageDepsPlugin: Unsupported export type: \${type}`)
}

export class GatsbyPageDepsPlugin {
  apply(compiler) {
    const virtualModules = new VirtualModulesPlugin()

    virtualModules.apply(compiler)

    compiler.hooks.compilation.tap(`GatsbyPageDepsPlugin`, function (
      compilation
    ) {
      store.getState().modules.forEach(({ moduleID, ...rest }) => {
        virtualModules.writeModule(
          `node_modules/GATSBY_MAGIC_${moduleID}.js`,
          // path.join(process.cwd(), `.cache`, `GATSBY_MAGIC_${moduleID}.js`),
          // `node_modules/GATSBY_MAGIC_${moduleID}.js`,
          generateExportCode(rest)
        )
      })
    })
  }
}
