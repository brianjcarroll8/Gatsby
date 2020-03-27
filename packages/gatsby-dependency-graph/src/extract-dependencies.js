const { join } = require("path")
const traverse = require("@babel/traverse").default
const { parse } = require("@babel/parser")
const { getExtension } = require("./utils")

function extractES6Imports(root, componentPath, js) {
  const lines = js.split(/(\n|;)/)
  const imports = lines.filter((line) => line.startsWith("import"))

  return imports.map((i) => {
    const importReference = new RegExp("import.* .([\\.\\/a-zA-Z-0-9]+).").exec(
      i
    )[1]

    return importReference.startsWith(".")
      ? join(root, componentPath, "..", importReference)
      : join(root, "node_modules", importReference)
  })
}

const resolvePathRelation = (root, componentPath, importReference) => {
  return importReference.startsWith(".")
    ? join(root, componentPath, "..", importReference)
    : join(root, "node_modules", importReference)
}

exports.extractDependencies = async (root, componentPath, js) => {
  const isParseable =
    ["js", "jsx", "ts", "tsx"].indexOf(getExtension(componentPath)) !== -1
  if (!isParseable) return []

  try {
    const ast = parse(js, {
      sourceType: "unambiguous",
      plugins: [
        "jsx",
        getExtension(componentPath) === "ts" ? "typescript" : "flow",
      ],
    })

    const cjsRequires = []

    traverse(ast, {
      enter(path) {
        if (
          path.node.type === "CallExpression" &&
          path.node.callee.name === "require"
        ) {
          cjsRequires.push(
            resolvePathRelation(
              root,
              componentPath,
              path.node.arguments[0].value
            )
          )
        }
      },
    })

    const es6Imports = extractES6Imports(root, componentPath, js)

    return [...es6Imports, ...cjsRequires]
  } catch (e) {
    console.error("failed to parse module:", componentPath)
    console.error(e)
    return []
  }
}
