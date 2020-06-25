// codemod for inserting a value in a theme-ui `space`
//
// existing `space` scale [ 0, 16, 24, 32 ]
// need a new value like [ 0, 8, 16, 24, 32 ]
//
// yarn add jscodeshift @types/jscodeshift
//
// node ./node_modules/jscodeshift/bin/jscodeshift.sh -t codemod.js ./src/**/*.{js,jsx,ts,tsx}
// need to debug? node --inspect-brk ./node_modules/jscodeshift/bin/jscodeshift.sh -t codemod.js --run-in-band ./src/**/*.{js,jsx,ts,tsx} -d
// after that, `yarn run format` from the repo root, to get rid of semicolors and stuff

// position to insert value
const pos = 1

// prep list of props the `space` scale values can be applied to
// https://theme-ui.com/sx-prop#theme-aware-properties
const modifiers = [``, `Top`, `Right`, `Bottom`, `Left`, `X`, `Y`]
const shorthandModifiers = [``, `t`, `r`, `b`, `l`, `x`, `y`]

const spaceProperties = [
  // margin, padding keys
  ...modifiers.map(d => `margin${d}`),
  ...modifiers.map(d => `padding${d}`),
  // theme-ui shorthand keys
  ...shorthandModifiers.map(d => `m${d}`),
  ...shorthandModifiers.map(d => `p${d}`),
  `top`,
  `bottom`,
  `left`,
  `right`,
]

function visit(v) {
  // console.log(v)

  if (
    v.type === `Property` &&
    v.key.type === `Identifier` &&
    spaceProperties.includes(v.key.name)
  ) {
    if (v.value.type === `ArrayExpression` && v.value.elements.length >= pos) {
      if (
        !v.value.elements.every(currentValue => currentValue.type === `Literal`)
      ) {
        console.warn(`Only arrays with ints working for now :(`)
        return
      }

      v.value.elements.forEach((e, index) => {
        if (e.value >= pos) {
          e.value += 1
        }
      })
    }

    if (v.value.type === `Literal` && v.value.value >= pos) {
      v.value.value += 1
    }
    return v
  }

  if (v.type === `Property` && v.value.type === `ObjectExpression`) {
    v.value.properties.forEach(function (w) {
      visit(w)
    })
  }
}

export default function transformer(file, api) {
  const j = api.jscodeshift
  return j(file.source)
    .find(j.JSXAttribute)
    .forEach(path => {
      const { value } = path

      if (
        // look for sx prop values
        value.name.name === `sx` &&
        value.value.type === `JSXExpressionContainer` &&
        // TODO: cover emotions array syntax
        value.value.expression.type === `ObjectExpression` &&
        value.value.expression.properties.length
      ) {
        value.value.expression.properties.forEach(v => visit(v))
      }
    })
    .toSource()
}
