import * as ReactRefreshErrorOverlay from "@pmmmwh/react-refresh-webpack-plugin/src/overlay"

// if (process.env.GATSBY_HOT_LOADER !== `fast-refresh`) {
//   // Report runtime errors
//   ReactErrorOverlay.startReportingRuntimeErrors({
//     onError: () => {},
//     filename: `/commons.js`,
//   })
//   ReactErrorOverlay.setEditorHandler(errorLocation =>
//     window.fetch(
//       `/__open-stack-frame-in-editor?fileName=` +
//         window.encodeURIComponent(errorLocation.fileName) +
//         `&lineNumber=` +
//         window.encodeURIComponent(errorLocation.lineNumber || 1)
//     )
//   )
// }

const errorMap = {}

function flat(arr) {
  return Array.prototype.flat ? arr.flat() : [].concat(...arr)
}

const handleErrorOverlay = () => {
  const errors = Object.values(errorMap)
  let errorStringsToDisplay = []
  if (errors.length > 0) {
    errorStringsToDisplay = flat(errors)
      .map(error => {
        if (typeof error === `string`) {
          return error
        } else if (typeof error === `object`) {
          const errorStrBuilder = [error.text]

          if (error.filePath) {
            errorStrBuilder.push(`File: ${error.filePath}`)
          }

          return errorStrBuilder.join(`\n\n`)
        }

        return null
      })
      .filter(Boolean)
  }

  if (errorStringsToDisplay.length > 0) {
    ReactRefreshErrorOverlay.showCompileError(
      errorStringsToDisplay.join(`\n\n`)
    )
  } else {
    ReactRefreshErrorOverlay.clearCompileError()
  }
}

export const clearError = errorID => {
  delete errorMap[errorID]
  handleErrorOverlay()
}

export const reportError = (errorID, error) => {
  if (error) {
    errorMap[errorID] = error
  }
  handleErrorOverlay()
}

export { errorMap }
