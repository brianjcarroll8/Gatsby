import { join } from "path"
import traverse from "@babel/traverse"
import { parse } from "@babel/parser"
import { getExtension } from "./utils"

function extractES6Imports(
  root: string,
  componentPath: string,
  js: string
): string[] {
  const lines = js.split(/(\n|;)/)
  const imports = lines.filter((line) => line.startsWith(`import`))

  return imports.map((i) => {
    const importReference = new RegExp(`import.* .([\\.\\/a-zA-Z-0-9]+).`).exec(
      i
    )![1]

    return importReference.startsWith(`.`)
      ? join(root, componentPath, `..`, importReference)
      : join(root, `node_modules`, importReference)
  })
}

const resolvePathRelation = (
  root: string,
  componentPath: string,
  importReference: string
): string =>
  importReference.startsWith(`.`)
    ? join(root, componentPath, `..`, importReference)
    : join(root, `node_modules`, importReference)

export const extractDependencies = async (
  root: string,
  componentPath: string,
  js: string
): string[] => {
  const isParseable =
    [`js`, `jsx`, `ts`, `tsx`].indexOf(getExtension(componentPath)) !== -1
  if (!isParseable) return []

  try {
    const ast = parse(js, {
      sourceType: `unambiguous`,
      plugins: [
        `jsx`,
        /tsx?/.test(getExtension(componentPath)) ? `typescript` : `flow`,
      ],
    })

    const cjsRequires: string[] = []

    traverse(ast as any, {
      enter(path) {
        if (
          path.node.type === `CallExpression` &&
          (path.node.callee as any).name === `require`
        ) {
          cjsRequires.push(
            resolvePathRelation(
              root,
              componentPath,
              (path.node.arguments[0] as any).value
            )
          )
        }
      },
    })

    const es6Imports = extractES6Imports(root, componentPath, js)

    return [...es6Imports, ...cjsRequires]
  } catch (e) {
    console.error(`failed to parse module:`, componentPath)
    console.error(e)
    return []
  }
}
