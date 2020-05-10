import VirtualModulesPlugin from "webpack-virtual-modules"
import { store } from "../redux"

function generateExportCode({ type, source, importName }) {
  if (type === `default`) {
    return `export { default } from "${source}"`
  }

  if (type === `named`) {
    return `export { ${importName} as default } from "${source}"`
  }

  if (type === `namespace`) {
    return `export * from "${source}"`
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
          generateExportCode(rest)
        )
      })
    })
  }
}
