// Report runtime errors
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
//   )export default {
  showCompileError: (...args) => {
    console.log("shoshowCompileError", ...args)
  },

  clearCompileError: (...args) => {
    console.log("clearCompileError", ...args)
  },

  clearRuntimeErrors: (...args) => {
    console.log("clearRuntimeErrors", ...args)
  },

  handleRuntimeError: (...args) => {
    console.log("handleRuntimeError", ...args)
  },

  showRuntimeErrors: (...args) => {
    console.log("showRuntimeErrors", ...args)
  },
}
