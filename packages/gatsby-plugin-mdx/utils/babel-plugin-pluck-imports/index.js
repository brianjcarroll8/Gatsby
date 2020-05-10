const declare = require(`@babel/helper-plugin-utils`).declare

module.exports = class Plugin {
  constructor() {
    const imports = []
    // const identifiers = []
    this.state = { imports }
    this.plugin = declare(api => {
      api.assertVersion(7)

      return {
        visitor: {
          ImportDeclaration(path) {
            const source = path.node.source.value

            path.node.specifiers.forEach(specifier => {
              if (specifier.type === `ImportDefaultSpecifier`) {
                imports.push({
                  source,
                  type: `default`,
                  local: specifier.local.name,
                })
              } else if (specifier.type === `ImportNamespaceSpecifier`) {
                imports.push({
                  source,
                  type: `namespace`,
                  local: specifier.local.name,
                })
              } else if (specifier.type === `ImportSpecifier`) {
                imports.push({
                  source,
                  type: `named`,
                  importName: specifier.imported.name,
                  local: specifier.local.name,
                })
              }
            })

            // path.traverse({
            //     Identifier(path) {
            //       // only take local bindings
            //       if (path.key === `local`) {
            //         identifiers.push(path.node.name)
            //       }
            //     },
            // })

            // //            const name = path.get("declaration.declarations.0").node.id.name;
            // const importString = path.hub.file.code.slice(
            //   path.node.start,
            //   path.node.end
            // )
            // imports.push(importString)

            // })
            path.remove()
          },
        },
      }
    })
  }
}
